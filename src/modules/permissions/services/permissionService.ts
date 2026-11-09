import { apiInstance } from "@/services/axios";
import {
    Permission,
    PermissionFilters,
    CreatePermissionDto,
    UpdatePermissionDto,
    PermissionPaginatedResponse,
} from "../types";

export const permissionService = {
    getAll: async (filters?: PermissionFilters): Promise<PermissionPaginatedResponse> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));

        const result = await apiInstance.get(`/permissions?${params.toString()}`);
        return result as unknown as PermissionPaginatedResponse;
    },

    getOne: async (id: string): Promise<Permission> => {
        const result = await apiInstance.get(`/permissions/${id}`);
        return result as unknown as Permission;
    },

    create: async (dto: CreatePermissionDto): Promise<Permission> => {
        const result = await apiInstance.post(`/permissions`, dto);
        return result as unknown as Permission;
    },

    update: async (id: string, dto: UpdatePermissionDto): Promise<Permission> => {
        const result = await apiInstance.patch(`/permissions/${id}`, dto);
        return result as unknown as Permission;
    },

    remove: async (id: string): Promise<void> => {
        await apiInstance.delete(`/permissions/${id}`);
    },
};
