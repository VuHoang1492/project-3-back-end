
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpCode, HttpMessage } from 'src/global/enum';
import { AppJwtService } from 'src/modules/app.jwt/app.jwt.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class UserIDMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: AppJwtService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        console.log('Middleware...');

        const token = this.extractTokenFromHeader(req)
        req['userId'] = undefined
        if (token) {

            let payload

            try {
                payload = await this.jwtService.verifyToken(token)

            } catch (error) {
                console.log(error);
                throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
            }
            req['userId'] = payload.userId

        }



        next();
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
