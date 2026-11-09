import { apiInstance } from "@/services/axios";
import {
    ShiftChangeRequest,
    ShiftChangeFilters,
    ShiftChangeFormData,
    ShiftChangeStats,
    CoverageApplication,
} from "../types";

export const shiftChangeService = {
    getAll: async (filters?: ShiftChangeFilters): Promise<{ data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.requesterId) params.append("requesterId", filters.requesterId);
        if (filters?.receiverId) params.append("receiverId", filters.receiverId);
        if (filters?.operationType) params.append("operationType", filters.operationType);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const result = await apiInstance.get("/shift-change-requests", { params });
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
            return result as unknown as { data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    },

    getReceived: async (filters?: ShiftChangeFilters): Promise<{ data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const result = await apiInstance.get("/shift-change-requests/received", { params });
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
            return result as unknown as { data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    },

    getOpportunities: async (filters?: ShiftChangeFilters): Promise<{ data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const result = await apiInstance.get("/shift-change-requests/opportunities", { params });
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
            return result as unknown as { data: ShiftChangeRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } };
        }
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    },

    getStats: async (): Promise<ShiftChangeStats> => {
        const result = await apiInstance.get("/shift-change-requests/stats");
        return (result as any)?.data || result;
    },

    getById: async (id: string): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.get(`/shift-change-requests/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (payload: ShiftChangeFormData): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.post("/shift-change-requests", payload);
        return (resp as any)?.data || resp;
    },

    respond: async (id: string, payload: { decision: "APPROVED" | "REJECTED"; comments?: string }): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.post(`/shift-change-requests/${id}/respond`, payload);
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

    apply: async (id: string, payload: { approverNotes?: string }): Promise<any> => {
        const resp = await apiInstance.post(`/shift-change-requests/${id}/apply`, payload);
        return (resp as any)?.data || resp;
    },

    cancel: async (id: string, payload?: { reason?: string }): Promise<ShiftChangeRequest> => {
        const resp = await apiInstance.patch(`/shift-change-requests/${id}/cancel`, payload || {});
        return (resp as any)?.data || resp;
    },

    applyToCoverage: async (requestId: string, payload?: { comments?: string }): Promise<CoverageApplication> => {
        const resp = await apiInstance.post(`/shift-change-requests/coverage/${requestId}/apply`, payload || {});
        return (resp as any)?.data || resp;
    },

    selectCandidate: async (requestId: string, payload: { candidateNurseId: string; comments?: string }): Promise<CoverageApplication> => {
        const resp = await apiInstance.post(`/shift-change-requests/coverage/${requestId}/select`, payload);
        return (resp as any)?.data || resp;
    },

    withdrawApplication: async (applicationId: string): Promise<void> => {
        await apiInstance.delete(`/shift-change-requests/coverage/applications/${applicationId}`);
    },
};
