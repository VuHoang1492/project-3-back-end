import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schema/user/user.schema';
import { AppJwtModule } from 'src/modules/app.jwt/app.jwt.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { OnwerSchema } from 'src/schema/user/onwer.schema';
import { FormModule } from '../form/form.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: OnwerSchema }]),
    AppJwtModule,
    MailModule,
    FormModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
