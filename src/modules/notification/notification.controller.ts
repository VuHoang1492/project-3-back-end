import { Controller, Get, Param, Query, Request, Response, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, interval, map } from 'rxjs';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/global/enum';
import { AppJwtService } from '../app.jwt/app.jwt.service';

@Controller('')
export class NotificationController {
    constructor(private readonly eventEmitter: EventEmitter2, private readonly appJwtService: AppJwtService) { }

    @Sse('notification')
    async sse(@Query('accessToken') acessToken) {

        const payload = await this.appJwtService.verifyToken(acessToken)
        console.log(payload);


        if (payload.userId == process.env.ADMIN_ID) {
            return interval(10000).pipe(map((_) => ({ data: 'hello admin' })));
        }

        return interval(1000).pipe(map((_) => ({ data: 'hello user' })));

    }

}
export class MessageEvent {
    data: string;
}