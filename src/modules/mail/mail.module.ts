import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { AppJwtModule } from 'src/modules/app.jwt/app.jwt.module';


@Module({
    imports: [
        MailerModule.forRootAsync({

            useFactory: async () => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: process.env.MAIL,
                        pass: process.env.MAIL_PASSWORD,
                    },
                },
                defaults: {
                    from: `"No Reply" <foodmapprj3@gmail.com>`,
                },
            }),
        }),
        AppJwtModule
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
