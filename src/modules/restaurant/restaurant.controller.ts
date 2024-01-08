import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { S3Service } from '../s3/s3.service';
import { CreateDTO } from 'src/dto/restaurant.dto/create.dto';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {

    constructor(private readonly restaurantService: RestaurantService) { }

    @Post('/create')
    @UseInterceptors(FileInterceptor('thumbnail'))
    @Roles(Role.OWNER)
    async createRestaurant(@Body() data: CreateDTO, @UploadedFile() files: Express.Multer.File, @Request() req) {
        return this.restaurantService.createRestaurant(req.userId, data, files)
    }


    @Get('/consider')
    @Roles(Role.OWNER)
    getWaitingRestaurant(@Request() req) {
        return this.restaurantService.getWaitingRestaurant(req.userId)
    }

    @Get('/get-by-id/:id')
    getRestaurantbyId(@Param('id') id) {
        return this.restaurantService.getRestaurantById(id)
    }

    @Get('/owner/get-all')
    @Roles(Role.OWNER)
    getAll(@Request() req) {
        return this.restaurantService.getAllRestaurantOfOwner(req.userId)
    }

    @Delete('/delete/:id')
    @Roles(Role.OWNER)
    deleteRestaurant(@Param('id') id, @Request() req) {
        return this.restaurantService.deleteRestaurant(id, req.userId)
    }

    @Put('/update/:id')
    @UseInterceptors(FileInterceptor('thumbnail'))
    @Roles(Role.OWNER)
    async update(@Body() data: CreateDTO, @Param('id') restaurantId, @UploadedFile() files: Express.Multer.File, @Request() req) {
        return this.restaurantService.updateRestaurant(req.userId, restaurantId, data, files)
    }

    @Get('/nearby')
    async getNearby(@Query('lat') lat, @Query('lng') lng) {
        return this.restaurantService.getRestaurantNearby({ lat: lat, lng: lng })
    }
}
