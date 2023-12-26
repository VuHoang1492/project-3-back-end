import { Body, Controller, Post, Get, Query, Redirect, HttpCode, Request, } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from './dto/register.dto';
import { LogInDTO } from './dto/login.dto';
import { ForgetDTO } from './dto/forget.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { UpgradeDTO } from './dto/upgrade.dto';
import { PasswordDTO } from './dto/password.dto';
import { log } from 'console';


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
    upgrade(@Body() data: UpgradeDTO) {

    }

}
