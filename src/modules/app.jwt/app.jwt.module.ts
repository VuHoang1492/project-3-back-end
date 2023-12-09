import { Module } from '@nestjs/common';
import { AppJwtService } from './app.jwt.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [AppJwtService],
  exports: [AppJwtService]
})
export class AppJwtModule { }
