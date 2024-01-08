import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { OwnerLevel, Role } from 'src/global/enum'

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        unique: true
    })
    email: string
    @Prop({ required: true })
    password: string
    @Prop({ enum: [Role.USER, Role.OWNER], default: Role.USER })
    role: string


    @Prop({ required: false })
    numberPhone: string
    @Prop({ required: false })
    userName: string

    @Prop({ required: false })
    brandName: string

    @Prop({ required: false, enum: [OwnerLevel.TRIAL, OwnerLevel.VIP] })
    level: string


    @Prop({ required: false })
    numberRestaurant: number
}



export const UserSchema = SchemaFactory.createForClass(User)


UserSchema.pre('save', function (next) {
    if (this.role == Role.OWNER) {
        if (this.numberPhone == null || this.userName == null || this.brandName == null || this.level == null)
            next(new Error('Owner need more infomation'))
    }
    next()
})

// UserSchema.pre('updateOne', function (next) {
//     console.log(this.getUpdate().$set);


//     next()
// })