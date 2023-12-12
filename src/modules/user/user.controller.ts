import { Body, Controller, Post, Get, Query, Redirect, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from './dto/register.dto';
import { LogInDTO } from './dto/login.dto';
import { Response } from 'express';


@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('login')
    async login(@Body() userDTO: LogInDTO, @Res() response: Response) {
        const result = await this.userService.login(userDTO)
        response.status(result.code).send(result)

    }


    @Post('register')
    async register(@Body() user: RegisterDTO, @Res() response: Response) {
        const result = await this.userService.sendVerifyMail(user)
        response.status(result.code).send(result)
    }

    @Get('verify')
    @Redirect()
    verify(@Query('token') token) {
        return this.userService.verifyEmail(token)
    }


    @Get('profile')
    async getProfile(@Query('token') token, @Res() response: Response) {
        const result = await this.userService.getUser(token)
        response.status(result.code).send(result)
    }

}
