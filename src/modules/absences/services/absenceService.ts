import { apiInstance } from "@/services/axios";
import { Absence, AbsenceFormData, AbsenceFilters, PaginatedAbsences } from "../types";

export const absenceService = {
    getAll: async (filters?: AbsenceFilters): Promise<PaginatedAbsences> => {
        const params = new URLSearchParams();
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/absences", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedAbsences;
    },

    getById: async (id: string): Promise<Absence> => {
        const resp = await apiInstance.get(`/absences/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (data: AbsenceFormData): Promise<Absence> => {
        const resp = await apiInstance.post("/absences", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<AbsenceFormData> & { status?: string; approvedById?: string; notes?: string }): Promise<Absence> => {
        const resp = await apiInstance.patch(`/absences/${id}`, data);
        return (resp as any)?.data || resp;
    },
};
