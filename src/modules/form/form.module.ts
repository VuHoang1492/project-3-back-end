import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UpGradeForm, UpgradeFormSchema } from 'src/schema/form/upgrade-form.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'forms', schema: UpgradeFormSchema }]),
    ],
    // controllers: [FormController],
    providers: [FormService],
    exports: [FormService]
})
export class FormModule { }
