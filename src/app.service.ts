import { Injectable } from '@nestjs/common';
import { MailService } from './modules/mail/mail.service';
import { AppJwtService } from './modules/app.jwt/app.jwt.service';

@Injectable()
export class AppService {

  constructor(private readonly mailService: MailService, private readonly jwtAppService: AppJwtService) { }
  getHello(): string {
    return 'Hello Hoang Vu';
  }
}
