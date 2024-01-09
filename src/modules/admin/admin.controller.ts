import { Body, Controller, Delete, Get, Param, Post, Query, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { FormService } from '../form/form.service';
import { AdminService } from './admin.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { UserService } from '../user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly formService: FormService,
        private readonly adminService: AdminService,
        private readonly restaurantService: RestaurantService,
    ) { }

    @Post('/form-process')
    @Roles(Role.ADMIN)
    processForm(@Body() payload) {
        return this.formService.processUpgradeForm(payload)
    }

    @Get('/get-upgrade-form')
    @Roles(Role.ADMIN)
    getAllForm() {
        return this.formService.getUpgradeForm()
    }

    @Get('/all-restaurant-wait')
    @Roles(Role.ADMIN)
    getAllRestaurant(@Request() req) {
        return this.restaurantService.getRestaurantForAdmin(req.userId)
    }

    @Post('/process')
    @Roles(Role.ADMIN)
    processRestaurant(@Body() payload) {
        return this.restaurantService.processRestaurant(payload)
    }

    @Get('/restaurant/:id')
    @Roles(Role.ADMIN)
    getRestaurant(@Param('id') restaurantId, @Request() req) {
        return this.restaurantService.getRestaurantByIdForAdmin(restaurantId, req.userId)
    }

    //For ADMIN

    @Get('brand/get-all')
    @Roles(Role.ADMIN)
    getAllBrand() {
        return this.adminService.getBrand()
    }

    @Post('bulk/resrautant/create')
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('thumbnail'))
    bulkCreateRestaurant(@Body() payload, @UploadedFile() files: Express.Multer.File) {
        return this.adminService.createRestaurant(payload, files)
    }

    @Get('/restaurant-owner')
    @Roles(Role.ADMIN)
    getAll(@Query('id') id) {
        console.log(id);
        return this.restaurantService.getAllRestaurantOfOwner(id)
    }
    @Delete('/restaurant/delete/:id')
    @Roles(Role.ADMIN)
    delete(@Param('id') id) {
        console.log(id);
        return this.adminService.deleteRestaurant(id)
    }
}
