import { useQuery } from "@tanstack/react-query";
import { workloadService } from "../services/workloadService";
import { WorkloadFilters, PaginatedWorkload } from "../types";

export const WORKLOAD_KEY = "workload-metrics";

export function useWorkloadMetrics(filters?: WorkloadFilters) {
    const query = useQuery<PaginatedWorkload>({
        queryKey: [WORKLOAD_KEY, filters?.nurseId, filters?.month, filters?.year, filters?.page, filters?.limit],
        queryFn: () => workloadService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    return {
        metrics: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
}

export function useWorkloadDashboard(month?: number, year?: number) {
    const query = useQuery({
        queryKey: [WORKLOAD_KEY, "dashboard", month, year],
        queryFn: () => workloadService.getDashboard({ month, year }),
        retry: 1,
    });

    return {
        dashboard: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}
