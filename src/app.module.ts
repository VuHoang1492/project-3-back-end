import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';

import { MailModule } from './modules/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AppJwtModule } from './modules/app.jwt/app.jwt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guard/roles.guard';
import { FormModule } from './modules/form/form.module';
import { NotificationModule } from './modules/notification/notification.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './modules/admin/admin.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { S3Module } from './modules/s3/s3.module';
import { PostModule } from './modules/post/post.module';
import { ReviewModule } from './modules/review/review.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/foodmap'),
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    MailModule,
    AppJwtModule,
    FormModule,
    NotificationModule,
    AdminModule,
    RestaurantModule,
    S3Module,
    PostModule,
    ReviewModule,

  ],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, AppService],
})
export class AppModule { }
