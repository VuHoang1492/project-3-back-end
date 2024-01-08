import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { S3Module } from '../s3/s3.module';
import { UserModule } from '../user/user.module';
import { FormModule } from '../form/form.module';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from 'src/schema/user/restaurant/restaurant.schema';
import { User, UserSchema } from 'src/schema/user/user.schema';
import { UserIDMiddleware } from 'src/middleware/UserID.middelware';
import { AppJwtModule } from '../app.jwt/app.jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'restaurants', schema: RestaurantSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module,
    UserModule,
    FormModule,
    MailModule,
    NotificationModule,
    AppJwtModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService]
})
export class RestaurantModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIDMiddleware)
      .forRoutes('/restaurant/nearby')
    consumer
      .apply(UserIDMiddleware)
      .forRoutes('/restaurant/get-by-id/*')
  }
}
