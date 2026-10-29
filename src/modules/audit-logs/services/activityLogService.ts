import { apiInstance } from "@/services/axios";
import { ActivityLog, ActivityLogFilters } from "../types";

export const activityLogService = {
    getAll: async (filters?: ActivityLogFilters): Promise<ActivityLog[]> => {
        const params = new URLSearchParams();
        if (filters?.userId) params.append("userId", filters.userId);
        if (filters?.action) params.append("action", filters.action);
        if (filters?.fromDate) params.append("fromDate", filters.fromDate);
        if (filters?.toDate) params.append("toDate", filters.toDate);
        const resp = await apiInstance.get("/activity-logs", { params });
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },
};
