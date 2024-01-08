import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from 'src/schema/post/post.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantSchema } from 'src/schema/user/restaurant/restaurant.schema';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: 'restaurants', schema: RestaurantSchema }]),
    S3Module
  ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule { }
