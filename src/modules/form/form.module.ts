import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UpGradeForm, UpgradeFormSchema } from 'src/schema/form/upgrade-form.schema';
import { User, UserSchema } from 'src/schema/user/user.schema';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [

        MongooseModule.forFeature([{ name: UpGradeForm.name, schema: UpgradeFormSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MailModule
    ],
    controllers: [FormController],
    providers: [FormService],
    exports: [FormService]
})
export class FormModule { }
