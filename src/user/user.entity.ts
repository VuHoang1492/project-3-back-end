import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm'

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column({ default: null })
    username: string;


    @BeforeInsert()
    setName() {
        if (this.username == null) this.username = this.email
    }
}



