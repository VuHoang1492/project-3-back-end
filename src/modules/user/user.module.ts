import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schema/user/user.schema';
import { AppJwtModule } from 'src/modules/app.jwt/app.jwt.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { FormModule } from '../form/form.module';
import { NotificationModule } from '../notification/notification.module';
import { Restaurant, RestaurantSchema } from 'src/schema/user/restaurant/restaurant.schema';
import { S3Module } from '../s3/s3.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'restaurants', schema: RestaurantSchema }]),
    AppJwtModule,
    MailModule,
    FormModule,
    NotificationModule,
    S3Module
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
