import { apiInstance } from "@/services/axios";
import { Organization, OrganizationFormData } from "../types";

export const organizationService = {
    getAll: async (): Promise<Organization[]> => {
        const response = await apiInstance.get("/organizations");
        return response.data?.data || response.data;
    },

    getById: async (id: string): Promise<Organization> => {
        const response = await apiInstance.get(`/organizations/${id}`);
        return response.data?.data || response.data;
    },

    create: async (data: OrganizationFormData): Promise<Organization> => {
        const response = await apiInstance.post("/organizations", data);
        return response.data?.data || response.data;
    },

    update: async (id: string, data: Partial<OrganizationFormData>): Promise<Organization> => {
        const response = await apiInstance.patch(`/organizations/${id}`, data);
        return response.data?.data || response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/organizations/${id}`);
    }
};