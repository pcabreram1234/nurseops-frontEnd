import { apiInstance } from "@/services/axios";
import { AuditLogRecord, AuditLogFilters, PaginatedAuditLogs } from "../types/audit-log";

/**
 * Cliente del endpoint de SOLO LECTURA `GET /api/v1/audit-logs`.
 * No expone métodos de escritura: la inmutabilidad la garantiza el backend.
 */
export const auditLogService = {
    getAll: async (filters?: AuditLogFilters): Promise<PaginatedAuditLogs> => {
        const params = new URLSearchParams();
        if (filters?.userId) params.append("userId", filters.userId);
        if (filters?.action) params.append("action", filters.action);
        if (filters?.moduleId) params.append("moduleId", filters.moduleId);
        if (filters?.requestId) params.append("requestId", filters.requestId);
        if (filters?.fromDate) params.append("fromDate", filters.fromDate);
        if (filters?.toDate) params.append("toDate", filters.toDate);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp: any = await apiInstance.get(`/audit-logs?${params.toString()}`);
        // El ResponseInterceptor del backend promueve `meta` como hermano de `data`
        if (resp?.data && resp?.meta) {
            return { data: resp.data, meta: resp.meta };
        }
        const data = resp?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: { total: data.length, page: 1, limit: data.length || 25, totalPages: 1 } };
        }
        return data as PaginatedAuditLogs;
    },

    getById: async (id: string): Promise<AuditLogRecord> => {
        const resp = await apiInstance.get(`/audit-logs/${id}`);
        return (resp as any)?.data || resp;
    },
};