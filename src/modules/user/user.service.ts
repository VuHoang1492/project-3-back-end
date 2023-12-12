import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

import { User } from './user.schema';
import { MailService } from 'src/modules/mail/mail.service';
import { AppJwtService } from 'src/modules/app.jwt/app.jwt.service';
import { ResponseData, UserData } from 'src/global/global';
import { HttpCode, HttpMessage, Role } from 'src/global/enum';
import { LogInDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private readonly mailService: MailService,
        private readonly jwtService: AppJwtService
    ) { }


    //TODO: register
    async sendVerifyMail(userDTO: RegisterDTO): Promise<ResponseData<string>> {
        try {
            if (userDTO.email == 'adminfoodmap@admin.com')
                return new ResponseData<string>(null, HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)


            const user = await this.userModel.findOne({ email: userDTO.email })
            if (user) {
                return new ResponseData<string>(null, HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
            }

            const token = await this.jwtService.generateVerifyToken(userDTO.email)
            await this.mailService.sendUserConfirmation(userDTO.email, token)
            return new ResponseData<string>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } catch (error) {
            console.log(error);
            return new ResponseData<string>(null, HttpMessage.ERROR, HttpCode.ERROR)
        }
    }

    async verifyEmail(token: string): Promise<{ url: string }> {
        try {

            const payload = await this.jwtService.verifyToken(token)
            const userCheck = await this.userModel.findOne({ email: payload.email })
            if (userCheck) {
                return { url: process.env.WEB_APP_URL }
            }

            const password = Math.random().toString(36).slice(-8);
            await this.mailService.sendPassword(payload.email, password)
            const saltOrRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltOrRounds);
            const user = new this.userModel({
                email: payload.email,
                userName: payload.email,
                password: hashPassword
            })
            await user.save()
            return { url: process.env.WEB_APP_URL }
        } catch (err) {
            console.log(err);
            return { url: process.env.WEB_APP_URL }
        }
    }


    //TODO: login service
    async login(userDTO: LogInDTO): Promise<ResponseData<{ accessToken: string }>> {
        try {
            if (userDTO.email == process.env.ADMIN_EMAIL) {
                if (userDTO.password == process.env.ADMIN_PASSWORD) {
                    const accessToken = await this.jwtService.generateAccessToken(process.env.ADMIN_ID)
                    return new ResponseData<{ accessToken: string }>({ accessToken: accessToken }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
                }
            }


            const userCheck = await this.userModel.findOne({ email: userDTO.email })

            if (userCheck) {
                const res = await bcrypt.compareSync(userDTO.password, userCheck.password)
                if (res) {
                    const accessToken = await this.jwtService.generateAccessToken(userCheck._id.toString())
                    return new ResponseData<{ accessToken: string }>({ accessToken: accessToken }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
                } else {
                    return new ResponseData<{ accessToken: string }>(null, HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
                }

            } else {
                return new ResponseData<{ accessToken: string }>(null, HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
            }
        } catch (error) {
            console.log(error);
            return new ResponseData<{ accessToken: string }>(null, HttpMessage.ERROR, HttpCode.ERROR)
        }
    }

    //TODO: get user profile
    async getUser(token: string): Promise<ResponseData<UserData | { role: string }>> {
        try {
            const payload = await this.jwtService.verifyToken(token)

            if (payload.userId == process.env.ADMIN_ID) {
                return new ResponseData<{ role: string }>({ role: 'admin' }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            }

            const user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) })
            if (user) {
                const data: UserData = {
                    id: user._id.toString(),
                    email: user.email,
                    userName: user.userName,
                    role: user.role as Role
                }

                return new ResponseData<UserData>(data, HttpMessage.SUCCESS, HttpCode.SUCCESS)
            } else {
                return new ResponseData<UserData>(null, HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
            }


        } catch (error) {
            return new ResponseData<UserData>(null, HttpMessage.ERROR, HttpCode.ERROR)
        }
    }


}
