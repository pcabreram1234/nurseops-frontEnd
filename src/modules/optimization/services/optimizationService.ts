import { apiInstance } from "@/services/axios";
import { OptimizationRun, OptimizationScore, OptimizationFilters, PaginatedOptimizationRuns } from "../types";

export const optimizationService = {
    getRuns: async (filters?: OptimizationFilters): Promise<PaginatedOptimizationRuns> => {
        const params = new URLSearchParams();
        if (filters?.scheduleId) params.append("scheduleId", filters.scheduleId);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp: any = await apiInstance.get("/optimization-runs", { params });
        // El ResponseInterceptor del backend promueve `meta` como hermano de `data`
        const data = resp?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: resp?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedOptimizationRuns;
    },

    getRunById: async (id: string): Promise<OptimizationRun> => {
        const resp = await apiInstance.get(`/optimization-runs/${id}`);
        return (resp as any)?.data || resp;
    },

    getScores: async (): Promise<OptimizationScore[]> => {
        const resp = await apiInstance.get("/optimization-scores");
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },
};
