import { apiInstance } from "@/services/axios";
import { ShiftTemplate, ShiftTemplateFormData } from "../types";

export const shiftTemplateService = {
    getAll: async (): Promise<ShiftTemplate[]> => {
        const resp = await apiInstance.get("/shift-templates");
        return (resp as any)?.data || resp || [];
    },

    getById: async (id: string): Promise<ShiftTemplate> => {
        const resp = await apiInstance.get(`/shift-templates/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (data: ShiftTemplateFormData): Promise<ShiftTemplate> => {
        const resp = await apiInstance.post("/shift-templates", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<ShiftTemplateFormData>): Promise<ShiftTemplate> => {
        const resp = await apiInstance.patch(`/shift-templates/${id}`, data);
        return (resp as any)?.data || resp;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/shift-templates/${id}`);
    },
};