import { apiInstance } from "@/services/axios";
import { OperationalAlert, AlertFilters, ResolveAlertPayload, AlertStats } from "../types";

export interface PaginatedAlerts {
    data: OperationalAlert[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const alertService = {
    /**
     * GET /operational-alerts
     * - Con page/limit → `{ data, meta }` paginado.
     * - Sin page/limit → array plano (backward compatible).
     */
    getAll: async (filters?: AlertFilters): Promise<OperationalAlert[] | PaginatedAlerts> => {
        const params = new URLSearchParams();
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.severity) params.append("severity", filters.severity);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp: any = await apiInstance.get("/operational-alerts", { params });
        // El ResponseInterceptor del backend promueve `meta` como hermano de `data`
        if (resp?.data && resp?.meta) {
            return { data: resp.data, meta: resp.meta };
        }
        return resp?.data || resp || [];
    },

    /** GET /operational-alerts/stats — agregados por estado/severidad. */
    getStats: async (filters?: AlertFilters): Promise<AlertStats> => {
        const params = new URLSearchParams();
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.severity) params.append("severity", filters.severity);
        if (filters?.search) params.append("search", filters.search);
        const resp = await apiInstance.get(`/operational-alerts/stats?${params.toString()}`);
        return ((resp as any)?.data || resp) as AlertStats;
    },

    getById: async (id: string): Promise<OperationalAlert> => {
        const resp = await apiInstance.get(`/operational-alerts/${id}`);
        return (resp as any)?.data || resp;
    },

    resolve: async (id: string, payload: ResolveAlertPayload): Promise<OperationalAlert> => {
        const resp = await apiInstance.post(`/operational-alerts/${id}/resolve`, payload);
        return (resp as any)?.data || resp;
    },

    /** Escala la alerta a severidad CRITICAL + estado ESCALATED. */
    escalate: async (id: string, payload: { targetTier: string; reason: string }): Promise<OperationalAlert> => {
        const resp = await apiInstance.post(`/operational-alerts/${id}/escalate`, payload);
        return (resp as any)?.data || resp;
    },
};