import { IsNotEmpty, IsString, MinLength, NotContains } from "class-validator"

export class PasswordDTO {
    @IsString()
    @NotContains(' ')
    @MinLength(8)
    @IsNotEmpty()
    currentPassword: string

    @IsString()
    @NotContains(' ')
    @MinLength(8)
    @IsNotEmpty()
    newPassword: string
}