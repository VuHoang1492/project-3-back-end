import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { Post } from 'src/schema/post/post.schema';
import { Restaurant } from 'src/schema/user/restaurant/restaurant.schema';
import { S3Service } from '../s3/s3.service';
import * as crypto from 'crypto'
import { ResponseData } from 'src/global/global';

@Injectable()
export class PostService {

    constructor(
        @InjectModel(Post.name)
        private readonly postModel: mongoose.Model<Post>,
        @InjectModel('restaurants')
        private readonly restaurantModel: mongoose.Model<Restaurant>,
        private readonly s3Service: S3Service
    ) { }

    async createPost(files: Array<Express.Multer.File>, userId: string, payload: any) {
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
        if (restaurant.userId.toString() !== userId) {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }

        const post = new this.postModel({
            restaurant: payload.restaurant,
            title: payload.title,
            description: payload.description
        })

        for (let i = 0; i < files.length; ++i) {
            const url = `/image/${payload.restaurant}-${crypto.randomBytes(16).toString('hex')}`
            await this.s3Service.upload(url, files[0].buffer)
            post.media.push({
                type: files[0].mimetype,
                src: url,
            })
        }

        await post.save()
        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }
}
