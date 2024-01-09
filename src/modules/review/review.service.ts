import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { S3Service } from '../s3/s3.service';
import mongoose from 'mongoose';
import { Restaurant } from 'src/schema/user/restaurant/restaurant.schema';
import { Review } from 'src/schema/review/review.schema';
import { HttpCode, HttpMessage } from 'src/global/enum';
import * as crypto from 'crypto'
import { ResponseData } from 'src/global/global';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel('restaurants')
        private readonly restaurantModel: mongoose.Model<Restaurant>,
        @InjectModel(Review.name)
        private readonly reviewModel: mongoose.Model<Review>,
        private readonly s3Service: S3Service
    ) { }

    async createReview(userId: string, files: Array<Express.Multer.File>, payload: any) {
        let restaurant = null
        try {
            restaurant = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(payload.restaurant) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (restaurant == null) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }


        const curRating = restaurant.rating
        const curCountReview = restaurant.countReview



        const newCountReview = curCountReview + 1
        const newRating = (curRating * curCountReview + Number(payload.rating)) / newCountReview





        if (restaurant.userId.toString() === userId) {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }

        const review = new this.reviewModel({
            restaurant: payload.restaurant,
            description: payload.description,
            rating: payload.rating,
            user: userId
        })

        for (let i = 0; i < files.length; ++i) {
            const url = `/image/${payload.restaurant}-${crypto.randomBytes(16).toString('hex')}`
            await this.s3Service.upload(url, files[i].buffer)
            review.media.push({
                type: files[i].mimetype,
                src: url,
            })
        }
        await this.restaurantModel.updateOne({ _id: new mongoose.Types.ObjectId(payload.restaurant) }, { $set: { rating: newRating, countReview: newCountReview } })
        await review.save()
        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)

    }

    async getReviewByRestauarant(restaurantId: string) {
        let response = null
        try {
            response = await this.reviewModel.find({ restaurant: restaurantId }).sort({ createdAt: 'desc' }).populate('user', { email: 1 }).lean()
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (response == null) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }
        for (let i = 0; i < response.length; ++i) {
            for (let j = 0; j < response[i].media.length; ++j) {
                response[i].media[j].src = await this.s3Service.getFile(response[i].media[j].src)
            }
        }


        return new ResponseData<[]>(response, HttpMessage.SUCCESS, HttpCode.SUCCESS)


    }
}
