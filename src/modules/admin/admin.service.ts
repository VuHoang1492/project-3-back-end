import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { ResponseData } from 'src/global/global';
import { Restaurant } from 'src/schema/user/restaurant/restaurant.schema';
import { User } from 'src/schema/user/user.schema';
import { S3Service } from '../s3/s3.service';
import * as crypto from 'crypto'
import { Post } from 'src/schema/post/post.schema';
import { Review } from 'src/schema/review/review.schema';

@Injectable()
export class AdminService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        @InjectModel('restaurants')
        private restaurantModel: mongoose.Model<Restaurant>,
        @InjectModel(Post.name)
        private readonly postModel: mongoose.Model<Post>,
        @InjectModel(Review.name)
        private readonly reviewModel: mongoose.Model<Review>,
        private readonly s3Service: S3Service,
    ) { }

    async createRestaurant(payload: any, file) {
        try {
            const thumbnail = `/restaurant-thumbnail/${payload.userId}-${crypto.randomBytes(16).toString('hex')}`
            await this.s3Service.upload(thumbnail, file.buffer)

            payload.thumbnail = thumbnail

            const restaurant = new this.restaurantModel({ ...payload, status: 'ACTIVE' })
            await restaurant.save()
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


    }

    async getBrand() {
        let respone
        try {
            respone = await this.userModel.find({ brandName: { $ne: null } }, { brandName: 1, email: 1, numberPhone: 1, userName: 1 })
            return new ResponseData<[]>(respone, HttpMessage.SUCCESS, HttpCode.SUCCESS)

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }

    async deleteRestaurant(id) {
        try {
            await this.restaurantModel.deleteOne({ _id: new mongoose.Types.ObjectId(id) })
            await this.postModel.deleteMany({ restaurant: id })
            await this.reviewModel.deleteMany({ restaurant: id })
            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }
}
