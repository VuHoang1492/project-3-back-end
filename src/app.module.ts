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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/foodmap'),
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    MailModule,
    AppJwtModule,
    FormModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, AppService],
})
export class AppModule { }
