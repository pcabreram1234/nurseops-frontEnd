import { apiInstance } from "@/services/axios";
import { User, UserFormData } from "../types";

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface PaginatedUsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const userService = {
    // Ahora recibe un objeto opcional con los filtros para la URL
    getAll: async (params?: UsersQueryParams): Promise<PaginatedUsersResponse> => {
        const resp = await apiInstance.get("/users", { params });
        // Como 'apiInstance' usa interceptor, 'resp' ya es el objeto { data: [...], meta: {...} }
        // Forzamos el tipado correcto para asegurar la lectura en el hook
        return resp as unknown as PaginatedUsersResponse;
    },

    getById: async (id: string): Promise<User> => {
        const response = await apiInstance.get(`/users/${id}`);
        return response.data?.data || response.data;
    },

    create: async (data: UserFormData): Promise<User> => {
        const response = await apiInstance.post("/users", data);
        return response.data?.data || response.data;
    },

    update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
        if (!data.password) delete data.password;
        const response = await apiInstance.patch(`/users/${id}`, data);
        return response.data?.data || response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/users/${id}`);
    }
};