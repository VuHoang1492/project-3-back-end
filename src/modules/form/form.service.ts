import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UpgradeDTO } from 'src/dto/restaurant.dto/upgrade.dto';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { UpGradeForm } from 'src/schema/form/upgrade-form.schema';

@Injectable()
export class FormService {
    constructor(
        @InjectModel('forms')
        private readonly upgradeFormModel: mongoose.Model<UpGradeForm>
    ) { }
    async createUpgradeForm(form: UpgradeDTO, userId: string, email: string) {
        const newForm = new this.upgradeFormModel({
            userId: userId,
            email: email,
            ...form
        })
        await newForm.save()
    }

    async checkExistForm(userId: string, type: string, status: string): Promise<boolean> {
        let form
        try {
            form = await this.upgradeFormModel.findOne({ userId: userId, type: type, status: status })
            if (form) return true
            return false
        } catch (error) {
            throw new HttpException(HttpMessage.ERROR, HttpCode.ERROR)
        }
    }
}
