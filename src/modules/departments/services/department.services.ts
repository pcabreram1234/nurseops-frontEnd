import { apiInstance } from "@/services/axios";
import { Department, DepartmentFormData, DepartmentFilters, PaginatedDepartments } from "../types";

export const departmentService = {
    getAll: async (filters?: DepartmentFilters): Promise<PaginatedDepartments> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.type) params.append("type", filters.type);
        if (filters?.criticalLevel) params.append("criticalLevel", filters.criticalLevel);
        if (filters?.isEmergencyDepartment !== undefined) params.append("isEmergencyDepartment", String(filters.isEmergencyDepartment));
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/departments", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedDepartments;
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