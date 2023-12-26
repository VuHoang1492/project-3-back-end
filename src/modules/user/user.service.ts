import { HttpException, Injectable } from '@nestjs/common';
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
import { ForgetDTO } from './dto/forget.dto';
import { PasswordDTO } from './dto/password.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>,
        private readonly mailService: MailService,
        private readonly jwtService: AppJwtService
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
                userName: payload.email,
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
    async login(userDTO: LogInDTO): Promise<ResponseData<{ accessToken: string }> | HttpException> {

        if (userDTO.email == process.env.ADMIN_EMAIL) {
            if (userDTO.password == process.env.ADMIN_PASSWORD) {
                const accessToken = await this.jwtService.generateAccessToken(process.env.ADMIN_ID)
                return new ResponseData<{ accessToken: string }>({ accessToken: accessToken }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
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
                const accessToken = await this.jwtService.generateAccessToken(userCheck._id.toString())
                return new ResponseData<{ accessToken: string }>({ accessToken: accessToken }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
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
    async getUserProfile(userId: string): Promise<ResponseData<UserData | { role: string }>> {

        if (userId == process.env.ADMIN_ID) {
            return new ResponseData<{ role: string }>({ role: 'admin' }, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }


        let user
        try {
            user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
        if (user) {
            const data: UserData = {
                id: user._id.toString(),
                email: user.email,
                userName: user.userName,
                role: user.role as Role
            }

            return new ResponseData<UserData>(data, HttpMessage.SUCCESS, HttpCode.SUCCESS)
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


    //TODO get roles 
    async getRole(userId: string): Promise<{ role: Role }> {
        if (userId == process.env.ADMIN_ID) {
            return { role: Role.ADMIN }
        }
        let user
        try {
            user = await this.userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })
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
}
