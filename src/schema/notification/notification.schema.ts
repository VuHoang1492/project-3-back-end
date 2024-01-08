import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'


@Schema({ timestamps: true })
export class Notification {

    @Prop({ required: true })
    from: string

    @Prop({ required: true })
    email: string

    @Prop({ required: true })
    to: string

    @Prop({ required: true })
    type: string

    @Prop({ required: true, enum: ['SEEN', 'NOT_SEEN'], default: 'NOT_SEEN' })
    status: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)