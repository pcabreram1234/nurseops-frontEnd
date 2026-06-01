import { apiInstance } from "@/services/axios";
import { Department, DepartmentFormData } from "../types";

export const departmentService = {
    getAll: async (): Promise<Department[]> => {
        const resp = await apiInstance.get("/departments");
        return (resp as any)?.data || resp || [];
    },
    create: async (data: DepartmentFormData): Promise<Department> => {
        const resp = await apiInstance.post("/departments", data);
        return (resp as any)?.data || resp;
    },
    update: async (id: string, data: DepartmentFormData): Promise<Department> => {
        const resp = await apiInstance.patch(`/departments/${id}`, data);
        return (resp as any)?.data || resp;
    },
    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/departments/${id}`);
    }
};