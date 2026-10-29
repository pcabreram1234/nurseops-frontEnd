import { apiInstance } from "@/services/axios";
import { WorkLoadMetrics, WorkloadFilters, WorkloadDashboard, PaginatedWorkload } from "../types";

export const workloadService = {
    getAll: async (filters?: WorkloadFilters): Promise<PaginatedWorkload> => {
        const params = new URLSearchParams();
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.month) params.append("month", String(filters.month));
        if (filters?.year) params.append("year", String(filters.year));
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/workload-metrics", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedWorkload;
    },

    getDashboard: async (params: { month?: number; year?: number; organizationId?: string }): Promise<WorkloadDashboard> => {
        const qs = new URLSearchParams();
        if (params.month) qs.append("month", String(params.month));
        if (params.year) qs.append("year", String(params.year));
        if (params.organizationId) qs.append("organizationId", params.organizationId);
        const resp = await apiInstance.get(`/workload-metrics/dashboard?${qs.toString()}`);
        return (resp as any)?.data || resp || {};
    },
};
