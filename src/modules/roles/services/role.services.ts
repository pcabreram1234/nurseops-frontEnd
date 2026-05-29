import { apiInstance } from "@/services/axios";
import { Role, RoleFormData, Permission, AssingPermisions, UpadeteRoleFormData, CreateRoleFormData } from "../types";

export const roleService = {
    getAll: async (): Promise<Role[]> => {
        const resp = await apiInstance.get("/roles");
        return (resp as any)?.data || resp || [];
    },

    getPermissionsCatalog: async (): Promise<Permission[]> => {
        const resp = await apiInstance.get("/permissions");
        return (resp as any)?.data || resp || [];
    },

    assignPermissions: async (id: string, data: AssingPermisions): Promise<AssingPermisions> => {
        const resp = await apiInstance.patch(`/roles/${id}/permissions`, data);
        return (resp as any)?.data || resp || [];
    },

    create: async (data: CreateRoleFormData): Promise<Role> => {
        const resp = await apiInstance.post("/roles", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: UpadeteRoleFormData): Promise<Role> => {
        const resp = await apiInstance.patch(`/roles/${id}`, data);
        return (resp as any)?.data || resp;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/roles/${id}`);
    }
};