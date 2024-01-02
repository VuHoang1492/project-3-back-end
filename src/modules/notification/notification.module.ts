import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AppJwtModule } from '../app.jwt/app.jwt.module';

@Module({
  imports: [AppJwtModule],
  providers: [NotificationService],
  controllers: [NotificationController]
})


export class NotificationModule { }
