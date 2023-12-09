import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
    })
    email: String
    @Prop({ required: true })
    password: String
    @Prop()
    numberPhone: String
    @Prop()
    userName: String
}

export const UserSchema = SchemaFactory.createForClass(User)