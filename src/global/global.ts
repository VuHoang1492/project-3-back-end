import { HttpCode, HttpMessage, Role } from "./enum"

export class ResponseData<T> {
    data: T | T[]
    message: HttpMessage
    code: HttpCode

    constructor(data: T | T[], message: HttpMessage, code: HttpCode) {
        this.data = data
        this.message = message
        this.code = code
    }
}

export interface UserData {
    email: string
    userName: string
    roles: Role
    accessToken: string
}