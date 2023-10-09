export class AlreadyConnectedError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "AlreadyConnectedError";
    }
}

export class AuthError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "AuthError";
    }
}

export class RoomNotFoundError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "RoomNotFoundError";
    }
}

export class IllegalMoveError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "IllegalMoveError";
    }
}
