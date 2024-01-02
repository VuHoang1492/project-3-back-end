import { Type } from "class-transformer"
import { IsEnum, IsNotEmpty, IsPhoneNumber } from "class-validator"
import { OwnerLevel } from "src/global/enum"

export class UpgradeDTO {

    @IsNotEmpty()
    brandName: string


    @IsNotEmpty()
    userName: string


    @IsNotEmpty()
    @IsPhoneNumber()
    numberPhone: string


    @IsNotEmpty()
    @IsEnum(OwnerLevel)
    level: OwnerLevel
}