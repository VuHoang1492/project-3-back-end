import { Body, Controller, Post, Get, Query, Redirect } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from './dto/register.dto';
import { LogInDTO } from './dto/login.dto';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('login')
    login(@Body() userDTO: LogInDTO) {
        console.log(userDTO);

    }


    @Post('register')
    register(@Body() user: RegisterDTO) {
        return this.userService.sendVerifyMail(user)
    }

    @Get('verify')
    @Redirect()
    verify(@Query('token') token) {
        return this.userService.verifyEmail(token)
    }

}
