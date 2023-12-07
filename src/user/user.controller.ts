import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDTO } from './dto/register.dto';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }


    @Post('register')
    register(@Body() user: RegisterDTO) {
        return this.userService.create(user)
    }

}
