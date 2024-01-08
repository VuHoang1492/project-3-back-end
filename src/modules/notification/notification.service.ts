import { HttpException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, map } from 'rxjs';

import { AppJwtService } from '../app.jwt/app.jwt.service';
import mongoose from 'mongoose';
import { Notification } from 'src/schema/notification/notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ResponseData } from 'src/global/global';
import { HttpCode, HttpMessage } from 'src/global/enum';

@Injectable()
export class NotificationService {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly appJwtService: AppJwtService,
        @InjectModel('notifications')
        private readonly notificationModel: mongoose.Model<Notification>
    ) { }


    //TODO : send notify
    async sendNotification(accessToken: string) {
        const payload = await this.appJwtService.verifyToken(accessToken)

        return fromEvent(this.eventEmitter, "notification")
            .pipe(map((to) => {
                if (payload.userId == to)
                    return { data: 'NEW' };
                //  return { data: { hello: 'world' } }
            }))
    }


    //TODO: create notify
    async create(from: string, email: string, to: string, type: string) {
        const notification = new this.notificationModel({
            to: to,
            from: from,
            email: email,
            type: type
        })
        try {
            await notification.save()
        } catch (error) {
            throw error
        }
    }

    //TODO get number of notification
    async getCountNotification(userId: string): Promise<ResponseData<{ count: number }>> {
        try {

            const notis = await this.notificationModel.find({ to: userId, status: 'NOT_SEEN' })
            return new ResponseData<{ count: number }>({ count: notis.length }, HttpMessage.SUCCESS, HttpCode.SUCCESS)

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


    }

    //TODO Get all notification
    async getAllNotification(userId: string): Promise<ResponseData<[]>> {
        try {

            const notis = (await this.notificationModel.find({ to: userId, status: 'NOT_SEEN' }))

            let data = []
            notis.forEach(item => {
                data.push(item)
                console.log(item);

            })

            return new ResponseData<[]>(data, HttpMessage.SUCCESS, HttpCode.SUCCESS)

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }

    //TODO seen noti
    async delete(userId: string, notiId: string) {

        let noti
        try {
            noti = await this.notificationModel.findOne({ _id: new mongoose.Types.ObjectId(notiId) })


        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (noti.to !== userId) {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }

        await this.notificationModel.deleteOne({ _id: new mongoose.Types.ObjectId(notiId) })

    }
}

