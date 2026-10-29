import { apiInstance } from "@/services/axios";
import { Vacation, VacationFormData, VacationFilters, PaginatedVacations, VacationStatus } from "../types";

/**
 * El modelo Prisma usa start_Date / end_Date pero los DTO aceptan startDate / endDate.
 * Normalizamos ambas formas para que la interfaz siempre use startDate / endDate.
 */
function normalize(v: any): Vacation {
    if (!v) return v;
    return {
        ...v,
        startDate: v.startDate || v.start_Date || null,
        endDate: v.endDate || v.end_Date || null,
    };
}

export const vacationService = {
    getAll: async (filters?: VacationFilters): Promise<PaginatedVacations> => {
        const params = new URLSearchParams();
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/vacations", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data: data.map(normalize), meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return {
            data: (data.data || []).map(normalize),
            meta: data.meta || { total: 0, page: 1, limit: 25, totalPages: 0 }
        };
    },

    getById: async (id: string): Promise<Vacation> => {
        const resp = await apiInstance.get(`/vacations/${id}`);
        return normalize((resp as any)?.data || resp);
    },

    create: async (data: VacationFormData): Promise<Vacation> => {
        const resp = await apiInstance.post("/vacations", data);
        return normalize((resp as any)?.data || resp);
    },

    update: async (id: string, data: Partial<VacationFormData>): Promise<Vacation> => {
        const resp = await apiInstance.patch(`/vacations/${id}`, data);
        return normalize((resp as any)?.data || resp);
    },

    /**
     * Aprobar o rechazar una vacación.
     * Para rechazar: enviar status REJECTED + rejectionReason.
     */
    approve: async (id: string, payload: { status: VacationStatus; rejectionReason?: string; notes?: string }): Promise<Vacation> => {
        const resp = await apiInstance.patch(`/vacations/${id}/approve`, payload);
        return normalize((resp as any)?.data || resp);
    },

    remove: async (id: string): Promise<void> => {
        await apiInstance.delete(`/vacations/${id}`);
    },
};
