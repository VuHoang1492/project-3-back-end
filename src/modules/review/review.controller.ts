import { Body, Controller, Get, Post, Query, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {

    constructor(
        private readonly reviewService: ReviewService,
    ) { }

    @Post('create')
    @UseInterceptors(FilesInterceptor('media'))
    @Roles(Role.OWNER, Role.USER)
    createReview(@Body() payload, @UploadedFiles() files: Array<Express.Multer.File>, @Request() req) {
        return this.reviewService.createReview(req.userId, files, payload)
    }

    @Get('/get-by-restaurant')
    async getReviewByRestaurant(@Query('restaurantId') restaurantId) {
        return this.reviewService.getReviewByRestauarant(restaurantId)
    }
}



