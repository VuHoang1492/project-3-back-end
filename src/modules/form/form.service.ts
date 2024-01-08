import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UpgradeDTO } from 'src/dto/restaurant.dto/upgrade.dto';
import { HttpCode, HttpMessage, OwnerLevel, Role } from 'src/global/enum';
import { ResponseData } from 'src/global/global';
import { UpGradeForm } from 'src/schema/form/upgrade-form.schema';
import { User } from 'src/schema/user/user.schema';
import { MailService } from '../mail/mail.service';
import { CreateDTO } from 'src/dto/restaurant.dto/create.dto';

@Injectable()
export class FormService {
    constructor(
        @InjectModel(UpGradeForm.name)
        private readonly upgradeFormModel: mongoose.Model<UpGradeForm>,
        @InjectModel(User.name)
        private readonly userModel: mongoose.Model<User>,
        private readonly mailService: MailService
    ) { }



    async createUpgradeForm(form: UpgradeDTO, userId: string, email: string) {
        let newForm
        newForm = new this.upgradeFormModel({
            userId: userId,
            email: email,
            ...form
        })
        return await newForm.save()
    }




    async processUpgradeForm(payload: { action: string, formId: string }) {
        let form = null
        try {

            form = await this.upgradeFormModel.findOne({ _id: new mongoose.Types.ObjectId(payload.formId) }, { "numberPhone": 1, "brandName": 1, "level": 1, "userId": 1, "userName": 1, "email": 1 })

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }

        if (!form) {
            throw new HttpException(HttpMessage.BAD_REQUEST, HttpCode.BAD_REQUEST)
        }

        if (payload.action == 'ACCEPT') {
            try {
                await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(form.userId) }, { $set: { role: Role.OWNER, numberPhone: form.numberPhone, userName: form.userName, level: form.level, brandName: form.brandName, numberRestaurant: 0 } })
                await this.upgradeFormModel.deleteOne({ _id: new mongoose.Types.ObjectId(payload.formId) })
            } catch (error) {
                console.log(error);
                throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
            }

            console.log(form);

            await this.mailService.sendUpgradeMail(form.email)

            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }
        else if (payload.action == 'DENIED') {
            await this.upgradeFormModel.deleteOne({ _id: new mongoose.Types.ObjectId(payload.formId) })
            return new ResponseData<null>(null, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        }
    }



    async checkExistForm(userId: string, type: string, status: string): Promise<boolean> {
        let form
        try {
            form = await this.upgradeFormModel.findOne({ userId: userId, type: type, status: status })
            if (form) return true
            return false
        } catch (error) {
            throw error
        }
    }


    async getUpgradeForm(): Promise<ResponseData<[]>> {

        try {
            const result = await this.upgradeFormModel.find({ status: 'PENDING' })
            const data = []
            result.forEach(item => {
                data.push(item)
            })
            return new ResponseData<[]>(data, HttpMessage.SUCCESS, HttpCode.SUCCESS)
        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }


}
