
import { IsEnum, IsNotEmpty, IsPhoneNumber, Matches } from "class-validator"
import { Week } from "src/global/enum"

export class CreateDTO {

    @IsNotEmpty()
    restaurantName: string


    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
    )
    @IsNotEmpty()
    open: string


    @Matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    @IsNotEmpty()
    close: string


    @IsNotEmpty()
    inWeek: Week[]

    @IsNotEmpty()
    displayName: string


    @IsNotEmpty()
    description: string


    @IsNotEmpty()
    lat: number

    @IsNotEmpty()
    lng: number



    thumbnail: string | null
}