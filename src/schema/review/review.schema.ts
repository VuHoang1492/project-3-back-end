import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { User } from '../user/user.schema'



@Schema({ timestamps: true })
export class Review {

    @Prop({
        required: true, type: mongoose.Schema.Types.ObjectId, ref: 'restaurants'
    })
    restaurant: string

    @Prop({
        required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name
    })
    user: string


    @Prop({ required: true })
    description: string

    @Prop({ required: true })
    rating: number

    @Prop({ default: [] })
    media: Array<{ type: string; src: string }>

}

export const ReviewSchema = SchemaFactory.createForClass(Review)