import { Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'

import { User } from './user.schema';
import mongoose from 'mongoose';
import { MailService } from 'src/modules/mail/mail.service';
import { AppJwtService } from 'src/modules/app.jwt/app.jwt.service';
import { ResponseData, UserData } from 'src/global/global';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { LogInDTO } from './dto/login.dto';


@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private readonly mailService: MailService,
        private readonly jwtService: AppJwtService
    ) { }

    async sendVerifyMail(userDTO: RegisterDTO): Promise<ResponseData<string>> {
        try {
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

    async login(userDTO: LogInDTO): Promise<ResponseData<UserData>> {
        try {
            console.log(1234);

            const userCheck = await this.userModel.findOne({ email: userDTO.email })
            if (userCheck) {
                console.log('data ', userCheck);
            } else { return new ResponseData<UserData>(null, HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED) }
        } catch (error) {
            console.log(error);
            return new ResponseData<UserData>(null, HttpMessage.ERROR, HttpCode.ERROR)

        }
    }



}
