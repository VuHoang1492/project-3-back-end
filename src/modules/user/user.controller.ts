import { Body, Controller, Post, Get, Query, Redirect, HttpCode, Request, Put, Param, } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from '../../dto/user.dto/register.dto';
import { LogInDTO } from '../../dto/user.dto/login.dto';
import { ForgetDTO } from '../../dto/user.dto/forget.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { UpgradeDTO } from '../../dto/restaurant.dto/upgrade.dto';
import { PasswordDTO } from '../../dto/user.dto/password.dto';



@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('login')
    login(@Body() userDTO: LogInDTO) {
        return this.userService.login(userDTO)
    }


    @Post('register')
    @HttpCode(200)
    register(@Body() user: RegisterDTO) {
        return this.userService.sendVerifyMail(user)
    }

    @Get('verify')
    @Redirect()
    verify(@Query('token') token) {
        return this.userService.verifyEmail(token)
    }


    @Get('profile')
    @Roles(Role.USER, Role.OWNER, Role.ADMIN)
    async getProfile(@Request() req) {
        return this.userService.getUserProfile(req.userId)
    }

    @Post('forget')
    getNewPassword(@Body() user: ForgetDTO) {
        console.log(user);

        return this.userService.forgetPassword(user)
    }

    @Post('change-password')
    @Roles(Role.OWNER, Role.USER)
    changePassword(@Body() passwordData: PasswordDTO, @Request() req) {
        return this.userService.changePassword(req.userId, passwordData)
    }


    @Post('upgrade')
    @Roles(Role.USER)
    upgrade(@Body() data: UpgradeDTO, @Request() req) {
        return this.userService.upgrade(req.userId, data)

    }

    @Put('brand/update')
    @Roles(Role.OWNER)
    updateBrand(@Body() data, @Request() req) {
        return this.userService.changeBrand(data.newName, req.userId)
    }

    @Post('/follow/:id')
    @Roles(Role.OWNER, Role.USER)
    follow(@Param('id') restaurantId, @Request() req) {
        return this.userService.follow(req.userId, restaurantId)
    }

    @Post('/unfollow/:id')
    @Roles(Role.OWNER, Role.USER)
    unfollow(@Param('id') restaurantId, @Request() req) {
        return this.userService.unfollow(req.userId, restaurantId)
    }
    @Get('/follow-restaurant')
    @Roles(Role.OWNER, Role.USER)
    getAllFollow(@Request() req) {
        return this.userService.getAllFollow(req.userId)
    }

}
