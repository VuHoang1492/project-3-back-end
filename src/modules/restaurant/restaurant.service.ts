import { HttpException, Injectable } from '@nestjs/common';
import { CreateDTO } from 'src/dto/restaurant.dto/create.dto';
import { S3Service } from '../s3/s3.service';
import { UserService } from '../user/user.service';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { FormService } from '../form/form.service';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResponseData } from 'src/global/global';
import * as crypto from 'crypto'
import mongoose from 'mongoose';
import { Restaurant } from 'src/schema/restaurant/restaurant.schema';
import { InjectModel } from '@nestjs/mongoose';
import { getPreciseDistance } from 'geolib';

@Injectable()
export class RestaurantService {
    constructor(
        @InjectModel(Restaurant.name)
        private readonly restaurantModel: mongoose.Model<Restaurant>,
        private readonly s3Service: S3Service,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly notificationService: NotificationService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    async getRestaurantNearby(payload: { lat: number, lng: number }) {
        try {
            const response = []
            const restaurants = await this.restaurantModel.find({}, { status: 0, updatedAt: 0, createdAt: 0 })
                .populate('userId', { userName: 1, numberPhone: 1, email: 1, brandName: 1 })
                .exec()

            for (let i = 0; i < restaurants.length; ++i) {
                const distance = getPreciseDistance({ latitude: payload.lat, longitude: payload.lng }, { latitude: restaurants[i].lat, longitude: restaurants[i].lng })
                if (distance < 2000) {
                    const url = await this.s3Service.getFile(restaurants[i].thumbnail)
                    restaurants[i].thumbnail = url
                    response.push(restaurants[i])
                }
            }


            return new ResponseData<[]>(response, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

    }

    //TODO owner create restaurant
    async createRestaurant(userId: string, data: CreateDTO, file: Express.Multer.File): Promise<ResponseData<null>> {
        let restaurant
        try {
            restaurant = await this.restaurantModel.find({ userId: userId, status: 'WAIT' })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (restaurant.length) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }

        let user
        try {
            user = await this.userService.getMail(userId)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


        try {

            const thumbnail = `/restaurant-thumbnail/${userId}-${crypto.randomBytes(16).toString('hex')}`
            await this.s3Service.upload(thumbnail, file.buffer)

            data.thumbnail = thumbnail
            const restaurant = new this.restaurantModel({
                userId: userId,
                ...data,
            })
            await restaurant.save()

            const to = process.env.ADMIN_ID
            await this.notificationService.create(userId, user.email, to, 'CREATE_RESTAURANT')
            this.eventEmitter.emit('notification', to)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    async getWaitingRestaurant(userId: string): Promise<ResponseData<[]>> {
        let data
        try {
            data = await this.restaurantModel.find({ userId: userId, status: 'WAIT' }, { _id: 1, restaurantName: 1 })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        const response = []
        data.forEach(item => {
            response.push(item)
        })

        return new ResponseData<[]>(data, HttpMessage.SUCCESS, HttpCode.SUCCESS)

    }

    async getRestaurantById(restaurantId: string) {
        let data
        try {
            data = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) }, { status: 0 })
                .populate('userId', { userName: 1, numberPhone: 1, email: 1, brandName: 1 })
                .exec()
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


        const url = await this.s3Service.getFile(data.thumbnail)

        const response = { ...data._doc, thumbnail: url }


        return new ResponseData<Object>(response, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    async getAllRestaurantOfOwner(userId: string) {
        let data
        try {
            data = await this.restaurantModel.find({ userId: userId }, { restaurantName: 1, rating: 1, _id: 1, thumbnail: 1 })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        const respone = []
        for (let i = 0; i < data.length; ++i) {
            const url = await this.s3Service.getFile(data[i].thumbnail)
            data[i].thumbnail = url
            respone.push(data[i])
        }
        return new ResponseData<[]>(respone, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    async deleteRestaurant(restaurantId: string, userId: string) {
        let data
        try {
            data = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        console.log(data.userId.toString());

        if (data.userId.toString() !== userId) throw new HttpException(HttpMessage.NOT_ACCESS, HttpCode.NOT_ACCESS)

        await this.restaurantModel.deleteOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    async updateRestaurant(userId: string, restaurantId: string, data: CreateDTO, file: Express.Multer.File) {
        let restaurant
        try {
            restaurant = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        console.log(restaurant.userId);

        if (restaurant.userId.toString() !== userId) throw new HttpException(HttpMessage.NOT_ACCESS, HttpCode.NOT_ACCESS)

        try {
            if (file) {


                await this.s3Service.deleteFile(restaurant.thumbnail)
                const thumbnail = `/restaurant-thumbnail/${userId}-${crypto.randomBytes(16).toString('hex')}`
                await this.s3Service.upload(thumbnail, file.buffer)
                await this.restaurantModel.findByIdAndUpdate(restaurantId, { ...data, thumbnail: thumbnail })
            } else {
                await this.restaurantModel.findByIdAndUpdate(restaurantId, { ...data })
            }



        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    //TODO For admin
    async getRestaurantByIdForAdmin(restaurantId: string, userId: string) {
        let data
        try {
            data = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
                .populate('userId', { userName: 1, numberPhone: 1, email: 1, brandName: 1 })
                .exec()
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


        if (!data) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }

        if (data.status != 'WAIT') {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }


        const url = await this.s3Service.getFile(data.thumbnail)
        const response = { ...data._doc, thumbnail: url }
        return new ResponseData<Object>(response, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }


    async getRestaurantForAdmin(id) {
        if (id !== process.env.ADMIN_ID) throw new HttpException(HttpMessage.NOT_ACCESS, HttpCode.NOT_ACCESS)
        let restaurants
        try {
            restaurants = await this.restaurantModel.find({ status: 'WAIT' }, { restaurantName: 1 })
                .populate('userId', { userName: 1, numberPhone: 1, email: 1 })
                .exec()
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        const response = []
        restaurants.forEach(item => {
            response.push(item)
        })

        return new ResponseData<[]>(response, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    async processRestaurant(payload) {
        let restaurant
        try {
            restaurant = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(payload.restaurantId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


        if (payload.action === "ACCEPT") {
            await this.restaurantModel.updateOne({ _id: new mongoose.Types.ObjectId(payload.restaurantId) }, { $set: { status: 'ACTIVED' } })
            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }

        if (payload.action === "DENIED") {
            await this.restaurantModel.deleteOne({ _id: new mongoose.Types.ObjectId(payload.restaurantId) })
            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }

    }
}
