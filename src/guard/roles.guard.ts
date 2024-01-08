import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, HttpException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { HttpCode, HttpMessage, Role } from 'src/global/enum';
import { AppJwtService } from 'src/modules/app.jwt/app.jwt.service';
import { UserService } from 'src/modules/user/user.service';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private readonly userService: UserService, private readonly jwtService: AppJwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            console.log("Public route...");
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);


        if (!token) {
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }
        let payload

        try {
            payload = await this.jwtService.verifyToken(token)

        } catch (error) {
            console.log(error);
            throw new HttpException(HttpMessage.UNAUTHORIZED, HttpCode.UNAUTHORIZED)
        }



        let userRole
        try {
            userRole = await this.userService.getRole(payload.userId)
            if (requiredRoles.includes(userRole.role)) {
                request['userId'] = payload.userId
                return true
            }

            throw new HttpException(HttpMessage.NOT_ACCESS, HttpCode.NOT_ACCESS)
        } catch (error) {
            console.log(error);
            throw error
        }





    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}