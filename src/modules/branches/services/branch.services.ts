import { apiInstance } from "@/services/axios";
import { Branch, BranchFormData } from "../types";

export const branchService = {
    getAll: async (): Promise<Branch[]> => {
        const resp = await apiInstance.get("/branches");
        return (resp as any)?.data || resp || [];
    },
    create: async (data: BranchFormData): Promise<Branch> => {
        const resp = await apiInstance.post("/branches", data);
        return (resp as any)?.data || resp;
    },
    update: async (id: string, data: BranchFormData): Promise<Branch> => {
        const resp = await apiInstance.patch(`/branches/${id}`, data);
        return (resp as any)?.data || resp;
    },
    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/branches/${id}`);
    }
};