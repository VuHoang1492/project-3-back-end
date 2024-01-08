import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantSchema } from 'src/schema/user/restaurant/restaurant.schema';
import { Review, ReviewSchema } from 'src/schema/review/review.schema';
import { User, UserSchema } from 'src/schema/user/user.schema';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'restaurants', schema: RestaurantSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    S3Module
  ],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule { }
