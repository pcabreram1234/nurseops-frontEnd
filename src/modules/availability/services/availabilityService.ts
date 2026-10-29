import { apiInstance } from "@/services/axios";
import { NurseAvailability, AvailabilityFormData, AvailabilityFilters, PaginatedAvailability } from "../types";

export const availabilityService = {
    getAll: async (filters?: AvailabilityFilters): Promise<PaginatedAvailability> => {
        const params = new URLSearchParams();
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/nurse-availability", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedAvailability;
    },

    create: async (data: AvailabilityFormData): Promise<NurseAvailability> => {
        const resp = await apiInstance.post("/nurse-availability", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<AvailabilityFormData>): Promise<NurseAvailability> => {
        const resp = await apiInstance.patch(`/nurse-availability/${id}`, data);
        return (resp as any)?.data || resp;
    },
};
