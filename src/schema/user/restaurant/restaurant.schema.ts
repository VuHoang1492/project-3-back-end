import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { User } from '../user.schema'


@Schema({ timestamps: true })
export class Restaurant {
    @Prop({
        required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name
    })
    userId: string

    @Prop({ required: true })
    restaurantName: string

    @Prop({ required: true })
    open: string

    @Prop({ required: true })
    close: string

    @Prop({ required: true })
    inWeek: string

    @Prop({ required: true })
    displayName: string

    @Prop({ required: true })
    description: string

    @Prop({ required: true })
    lat: number

    @Prop({ required: true })
    lng: number

    @Prop({ require: true })
    thumbnail: string


    @Prop({ default: 10 })
    rating: number

    @Prop({ default: 'WAIT', enum: ['WAIT', 'ACTIVE'] })
    status: string

}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)