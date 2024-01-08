import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { FormModule } from '../form/form.module';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [FormModule, RestaurantModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule { }
