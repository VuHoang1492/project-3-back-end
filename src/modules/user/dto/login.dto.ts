import { IsEmail, IsNotEmpty, IsString, MinLength, NotContains } from "class-validator";

export class LogInDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @NotContains(' ')
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}