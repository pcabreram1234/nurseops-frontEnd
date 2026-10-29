import { apiInstance } from "@/services/axios";
import { ShiftChangeRequest, ShiftChangeFilters } from "../types";

export const shiftChangeService = {
    getAll: async (filters?: ShiftChangeFilters): Promise<{ data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.requesterId) params.append("requesterId", filters.requesterId);
        if (filters?.receiverId) params.append("receiverId", filters.receiverId);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const result = await apiInstance.get("/shift-change-requests", { params });
        // apiInstance interceptor returns data directly
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
            return result as unknown as { data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    },

    getById: async (id: string): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.get(`/shift-change-requests/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (payload: { requesterId: string; receiverId?: string; sourceShiftId: string; targetShiftId?: string; reason?: string; emergencyRequest?: boolean }): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.post("/shift-change-requests", payload);
        return (resp as any)?.data || resp;
    },

    approve: async (id: string, payload: { supervisorNotes?: string }): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.patch(`/shift-change-requests/${id}/approve`, payload);
        return (resp as any)?.data || resp;
    },

    reject: async (id: string, payload: { reason: string }): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.patch(`/shift-change-requests/${id}/reject`, payload);
        return (resp as any)?.data || resp;
    },

    cancel: async (id: string): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.patch(`/shift-change-requests/${id}/cancel`, {});
        return (resp as any)?.data || resp;
    },
};