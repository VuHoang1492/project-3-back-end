import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OwnerLevel, Role } from 'src/global/enum'

@Schema({ timestamps: true })
export class Onwer {
    @Prop({
        required: true,
        unique: true
    })
    email: string
    @Prop({ required: true })
    password: string
    @Prop({ required: true })
    numberPhone: string
    @Prop({ required: true })
    userName: string
    @Prop({ enum: [Role.OWNER], default: Role.OWNER })
    role: string

    @Prop({ required: true })
    brandName: string

    @Prop({ required: true, enum: [OwnerLevel.TRIAL, OwnerLevel.VIP] })
    level: string

}

export const OnwerSchema = SchemaFactory.createForClass(Onwer)