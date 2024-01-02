import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OwnerLevel, Role } from 'src/global/enum'

@Schema({ timestamps: true })
export class UpGradeForm {
    @Prop({ default: 'UPGRADE' })
    type: string
    @Prop({ required: true })
    userId: string
    @Prop({ required: true })
    email: string
    @Prop({ required: true })
    numberPhone: string
    @Prop({ required: true })
    userName: string
    @Prop({ required: true })
    brandName: string
    @Prop({ required: true, enum: [OwnerLevel.TRIAL, OwnerLevel.VIP] })
    level: string
    @Prop({ default: 'PENDING' })
    status: string

}

export const UpgradeFormSchema = SchemaFactory.createForClass(UpGradeForm)