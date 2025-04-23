export interface User {
    id: string;
    username: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    authenticated: boolean;
}

export interface SessionVerificationResponse {
    authenticated: boolean;
    user?: {
        username: string;
        id: string
    }
}