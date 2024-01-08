import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AppJwtModule } from '../app.jwt/app.jwt.module';
import { NotificationSchema } from 'src/schema/notification/notification.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AppJwtModule, MongooseModule.forFeature([{ name: 'notifications', schema: NotificationSchema }])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]

})


export class NotificationModule { }
