import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FormModule } from '../form/form.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schema/user/user.schema';
import { RestaurantSchema } from 'src/schema/user/restaurant/restaurant.schema';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [FormModule, RestaurantModule, UserModule, S3Module,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'restaurants', schema: RestaurantSchema }]),],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule { }
