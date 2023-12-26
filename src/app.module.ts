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
import { UserService } from './modules/user/user.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/foodmap'),
    ConfigModule.forRoot(),
    UserModule,
    MailModule,
    AppJwtModule
  ],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, AppService],
})
export class AppModule { }
