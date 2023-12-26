import { HttpCode, HttpMessage, Role } from "./enum"

export class ResponseData<T> {
    data: T | T[]
    message: HttpMessage
    statusCode: HttpCode

    constructor(data: T | T[], message: HttpMessage, code: HttpCode) {
        this.data = data
        this.message = message
        this.statusCode = code
    }
}

export interface UserData {
    id: string
    email: string
    userName: string
    role: Role
}