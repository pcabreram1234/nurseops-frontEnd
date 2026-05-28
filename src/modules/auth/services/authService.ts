import { apiInstance } from "@/services/axios";
import { LoginCredentials, LoginResponse } from "../types";

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await apiInstance.post<LoginResponse>("/auth/login", credentials)
        return data;
    },
};