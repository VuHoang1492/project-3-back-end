import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import mongoose from 'mongoose';

import { User } from '../../schema/user/user.schema';
import { MailService } from 'src/modules/mail/mail.service';
import { AppJwtService } from 'src/modules/app.jwt/app.jwt.service';
import { ResponseData } from 'src/global/global';
import { HttpCode, HttpMessage, Role } from 'src/global/enum';
import { LogInDTO } from '../../dto/user.dto/login.dto';
import { RegisterDTO } from '../../dto/user.dto/register.dto';
import { ForgetDTO } from '../../dto/user.dto/forget.dto';
import { PasswordDTO } from '../../dto/user.dto/password.dto';
import { UpgradeDTO } from 'src/dto/restaurant.dto/upgrade.dto';
import { FormService } from '../form/form.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '../notification/notification.service';
import { Restaurant } from 'src/schema/user/restaurant/restaurant.schema';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        @InjectModel('restaurants')
        private restaurantModel: mongoose.Model<Restaurant>,
        private readonly mailService: MailService,
        private readonly jwtService: AppJwtService,
        private readonly formService: FormService,
        private readonly notificationService: NotificationService,
        private readonly eventEmitter: EventEmitter2,
        private readonly s3Service: S3Service
    ) { }


    //TODO: register
    async sendVerifyMail(userDTO: RegisterDTO): Promise<ResponseData<null> | HttpException> {

        if (userDTO.email == 'adminfoodmap@admin.com')
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)

        let user
        try {
            user = await this.userModel.findOne({ email: userDTO.email })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (user) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }

        const token = await this.jwtService.generateVerifyToken(userDTO.email)
        await this.mailService.sendUserConfirmation(userDTO.email, token)
        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)

    }

    async verifyEmail(token: string): Promise<{ url: string } | HttpException> {

        if (!token) throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)

        const payload = await this.jwtService.verifyToken(token)

        let userCheck
        try {
            userCheck = await this.userModel.findOne({ email: payload.email })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (userCheck) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }

        try {
            const password = Math.random().toString(36).slice(-8);
            const saltOrRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltOrRounds);
            const user = new this.userModel({
                email: payload.email,
                password: hashPassword
            })
            await user.save()
            await this.mailService.sendPassword(payload.email, password)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        return { url: process.env.WEB_APP_URL }

    }


    //TODO: login service
    async login(userDTO: LogInDTO) {

        if (userDTO.email == process.env.ADMIN_EMAIL) {
            if (userDTO.password == process.env.ADMIN_PASSWORD) {
                const accessToken = await this.jwtService.generateAccessToken(process.env.ADMIN_ID)
                return new ResponseData<Object>({ accessToken: accessToken, user: { role: Role.ADMIN, email: process.env.ADMIN_EMAIL } }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            }
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }

        let userCheck
        try {
            userCheck = await this.userModel.findOne({ email: userDTO.email })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (userCheck) {

            const res = await bcrypt.compareSync(userDTO.password, userCheck.password)
            if (res) {
                const data = {
                    role: userCheck.role,
                    email: userCheck.email,
                    brandName: userCheck.brandName
                }

                console.log(data);

                const accessToken = await this.jwtService.generateAccessToken(userCheck._id.toString())
                return new ResponseData<Object>({ accessToken: accessToken, user: data }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            } else {
                throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
            }

        } else {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }

    }



    //TODO: forget password
    async forgetPassword(userDTO: ForgetDTO): Promise<ResponseData<String>> {

        let userCheck
        try {
            userCheck = await this.userModel.findOne({ email: userDTO.email })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (userCheck) {
            const password = Math.random().toString(36).slice(-8);
            const saltOrRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltOrRounds);

            try {
                await userCheck.updateOne({ password: hashPassword })
            } catch (error) {
                console.log(error);
                throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
            }

            await this.mailService.sendNewPassword(userDTO.email, password)
            return new ResponseData<String>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } else {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }
    }


    //TODO: get user profile
    async getUserProfile(userId: string) {
        if (userId == process.env.ADMIN_ID) {
            return new ResponseData<Object>({ user: { role: Role.ADMIN, email: process.env.ADMIN_EMAIL } }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }


        let user
        try {
            user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (user) {
            const data = {
                role: user.role,
                email: user.email,
                brandName: user.brandName
            }

            return new ResponseData<Object>({ user: data }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } else {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }
    }

    //TODO: change password
    async changePassword(userId: string, passwordData: PasswordDTO): Promise<ResponseData<null>> {

        if (passwordData.currentPassword === passwordData.newPassword)
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)

        let user
        try {
            user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


        if (user) {
            const res = await bcrypt.compareSync(passwordData.currentPassword, user.password)

            if (res) {
                const saltOrRounds = 10;
                const hashPassword = await bcrypt.hash(passwordData.newPassword, saltOrRounds);
                try {
                    await user.updateOne({ password: hashPassword })
                } catch (error) {
                    console.log(error);
                    throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
                }
                return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            } else {
                throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
            }

        } else {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }
    }

    //TODO change brand
    async changeBrand(newBrand: string, userId: string) {
        try {
            await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { brandName: newBrand })
            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }


    }


    //TODO Upgrade
    async upgrade(userId: string, data: UpgradeDTO): Promise<ResponseData<null>> {
        try {
            if (await this.formService.checkExistForm(userId, 'UPGRADE', 'PENDING')) {
                throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        let user
        try {
            user = await this.getMail(userId)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        const payload = {
            userName: data.userName,
            numberPhone: data.numberPhone,
            brandName: data.brandName,
            email: user.email,
            level: data.level
        }

        try {
            await this.mailService.sendNotifymailToAdmin(payload)
            await this.formService.createUpgradeForm(data, userId, user.email)

            const to = process.env.ADMIN_ID
            await this.notificationService.create(userId, user.email, to, 'UPGRADE')
            this.eventEmitter.emit('notification', to)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }



        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
    }

    //TO DO get mail
    getMail(userId: string) {
        return this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { "email": 1 })
    }
    //TODO get roles 
    async getRole(userId: string): Promise<{ role: Role }> {
        if (userId == process.env.ADMIN_ID) {
            return { role: Role.ADMIN }
        }


        let user
        try {
            user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { "role": 1 })

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (user) {

            return { role: user.role as Role }
        } else {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }
    }


    //TODO follow 
    async follow(userId: string, restaurantId: string) {
        let restaurant
        try {
            restaurant = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (restaurant) {
            const followList = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { followed: 1 })

            followList.followed.forEach(object => {

                if (object.toString() == restaurantId) throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
            })



            try {
                await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $push: { followed: new mongoose.Types.ObjectId(restaurantId) } })
            } catch (error) {
                console.log(error);
                throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
            }

            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } else {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }



    }
    //TODO unfollow
    async unfollow(userId: string, restaurantId: string) {
        let restaurant
        try {
            restaurant = await this.restaurantModel.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (restaurant) {
            const followList = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { followed: 1 })

            followList.followed.forEach(object => {

                if (object.toString() == restaurantId) {

                }
            })

            for (let i = 0; i <= followList.followed.length; ++i) {
                if (followList.followed[i].toString() == restaurantId) {
                    try {
                        await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $pull: { followed: new mongoose.Types.ObjectId(restaurantId) } })
                        return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
                    } catch (error) {
                        console.log(error);
                        throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
                    }
                }
            }



        }
        throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)



    }

    //TODO get all follow
    async getAllFollow(userId: string) {
        try {
            const user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { followed: 1 })
                .populate('followed', { restaurantName: 1, rating: 1, thumbnail: 1 }).lean()
            let respone = []
            if (user) {
                respone = user.followed

                for (let i = 0; i < respone.length; ++i) {
                    const url = await this.s3Service.getFile(respone[i].thumbnail)
                    respone[i].thumbnail = url

                }

                return new ResponseData<[]>(respone, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            }
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }
}
