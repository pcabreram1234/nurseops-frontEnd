import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "../services/activityLogService";
import { ActivityLogFilters } from "../types";

export const ACTIVITY_LOGS_KEY = "activity-logs";

export function useActivityLogs(filters?: ActivityLogFilters) {
    const query = useQuery({
        queryKey: [ACTIVITY_LOGS_KEY, filters?.userId, filters?.action, filters?.fromDate, filters?.toDate],
        queryFn: () => activityLogService.getAll(filters),
        retry: 1,
    });

    return {
        logs: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
