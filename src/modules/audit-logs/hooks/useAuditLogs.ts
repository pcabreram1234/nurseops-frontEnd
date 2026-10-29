import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLogService";
import { AuditLogFilters } from "../types/audit-log";

export const AUDIT_LOGS_KEY = "audit-logs";

export function useAuditLogs(filters?: AuditLogFilters) {
    const query = useQuery({
        queryKey: [AUDIT_LOGS_KEY, filters?.userId, filters?.action, filters?.requestId,
            filters?.fromDate, filters?.toDate, filters?.page, filters?.limit],
        queryFn: () => auditLogService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    return {
        logs: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
}