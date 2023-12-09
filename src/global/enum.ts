export enum HttpCode {
    SUCCESS = 200,
    ERROR = 404,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401
}

export enum HttpMessage {
    SUCCESS = 'Successful',
    ERROR = 'Server Internal Error',
    BAD_REQUEST = 'Bad Request',
    ACCOUNT_EXIST = 'This account already exists',
    UNAUTHORIZED = 'Unauthorized'

}

export enum Role {
    ADMIN = 'admin',
    RESTAURANT_OWNER = 'owner',
    USER = 'user'
}