import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AppJwtService {
    constructor(private readonly jwtService: JwtService) { }

    generateVerifyToken(email: string): Promise<String> {
        const payload = { email: email }
        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_KEY,
            expiresIn: '1h',
        })
    }

    verifyToken(token: string) {
        return this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_KEY
        })
    }

    generateAccessToken(id: string) {
        const payload = { userId: id }
        return this.jwtService.signAsync(payload, {
            secret: process.env.JWT_KEY,
            expiresIn: '1d'
        })
    }
}
