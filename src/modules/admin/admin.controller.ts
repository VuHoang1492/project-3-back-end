import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { FormService } from '../form/form.service';
import { AdminService } from './admin.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly formService: FormService,
        private readonly adminService: AdminService,
        private readonly restaurantService: RestaurantService
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
}
