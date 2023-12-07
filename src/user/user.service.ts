import { Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }

    async create(user: RegisterDTO) {


        let entry = new UserEntity();
        entry.email = user.email

        await this.userRepository.save(entry)
    }
}
