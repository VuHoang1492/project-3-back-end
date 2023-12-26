import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    sendUserConfirmation(email: string, token: String): Promise<any> {
        return this.mailerService
            .sendMail({
                to: email,
                from: 'mapfoodprj3@gmail.com',
                subject: 'Confirm your Food Map Account',
                text: `http://localhost:3000/verify?token=${token}`
            })

    }

    sendPassword(email: string, pass: string) {
        return this.mailerService
            .sendMail({
                to: email,
                from: 'mapfoodprj3@gmail.com',
                subject: 'Password for your Food Map Account',
                html: `Mật khẩu của bạn là: <b><i>${pass}</i></b>  Để đảm bảo an toàn hãy đổi sau khi đăng nhập!`
            })
    }
    sendNewPassword(email: string, pass: string) {
        return this.mailerService
            .sendMail({
                to: email,
                from: 'mapfoodprj3@gmail.com',
                subject: 'New Password for your Food Map Account',
                html: `Mật khẩu của bạn là: <b><i>${pass}</i></b>  Để đảm bảo an toàn hãy đổi sau khi đăng nhập!`
            })
    }
}
