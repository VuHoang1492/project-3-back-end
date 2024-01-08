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

    sendNotifymailToAdmin(payload) {
        return this.mailerService
            .sendMail({
                to: 'mapfoodprj3@gmail.com',
                from: 'admin',
                subject: 'Food Map have a new partner',
                html: `<div>
                            Một người dùng đăng kí làm đối tác:<br>
                            Họ tên: <b><i>${payload.userName}</i></b><br>
                             Số điện thoại: <b><i>${payload.numberPhone}</i></b><br>
                            Email: <b><i>${payload.email}</i></b><br>
                            Thương hiệu: <b><i>${payload.brandName}</i></b><br>
                            Cấp độ: <b><i>${payload.level}</i></b>  <br>
                        </div>`

            })
    }


    sendUpgradeMail = (email: string) => {
        console.log(email);
        return this.mailerService
            .sendMail({
                to: email,
                from: 'admin',
                subject: 'UPGRADE SUCCESS',
                html: `<div>
                        Bạn đã trở thành đối tác của Food Map. Bạn có thể tạo cửa hàng và đăng bài từ bây giờ.
                    </div>`

            })
    }


}
