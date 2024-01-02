import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Role } from 'src/global/enum'

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        unique: true
    })
    email: string
    @Prop({ required: true })
    password: string
    @Prop({ enum: [Role.USER], default: Role.USER })
    role: string
}

export const UserSchema = SchemaFactory.createForClass(User)