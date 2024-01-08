import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'



@Schema({ timestamps: true })
export class Post {

    @Prop({
        required: true, type: mongoose.Schema.Types.ObjectId, ref: 'restaurants'
    })
    restaurant: string

    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    description: string

    @Prop({ default: [] })
    media: Array<{ type: string; src: string }>

}

export const PostSchema = SchemaFactory.createForClass(Post)