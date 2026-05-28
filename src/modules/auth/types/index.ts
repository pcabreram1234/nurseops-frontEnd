import { AuthResponse, } from "@/stores/auth.store";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse extends AuthResponse {

}

