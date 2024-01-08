import { Body, Controller, Get, Post, Query, Request, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';


@Controller('notification')
export class NotificationController {
    constructor(private readonly eventEmitter: EventEmitter2, private readonly notificationService: NotificationService) { }

    @Sse('sse')
    async sse(@Query('accessToken') accessToken) {
        return await this.notificationService.sendNotification(accessToken)

    }


    @Get('count')
    @Roles(Role.USER, Role.OWNER, Role.ADMIN)
    async getCount(@Request() req) {
        return this.notificationService.getCountNotification(req.userId)
    }

    @Get('getAll')
    @Roles(Role.USER, Role.OWNER, Role.ADMIN)
    async getAll(@Request() req) {
        return this.notificationService.getAllNotification(req.userId)
    }

    @Post('seen')
    @Roles(Role.USER, Role.OWNER, Role.ADMIN)
    async seen(@Request() req, @Body() data) {
        return this.notificationService.delete(req.userId, data.id)
    }


    // @Sse('test/:id')
    // test(@Param('id') id) {
    //     return fromEvent(this.eventEmitter, "test")
    //         .pipe(map((_) => {
    //             if (id == 'admin') {
    //                 return { data: 'NEW' };
    //             }
    //         }));
    // }


    // @Get('test-sse')
    // getTest() {
    //     this.eventEmitter.emit('test')
    // }
}
