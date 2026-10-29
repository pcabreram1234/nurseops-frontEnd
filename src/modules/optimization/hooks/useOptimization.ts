import { useQuery } from "@tanstack/react-query";
import { optimizationService } from "../services/optimizationService";
import { OptimizationFilters, PaginatedOptimizationRuns } from "../types";

export const OPT_RUNS_KEY = "optimization-runs";
export const OPT_SCORES_KEY = "optimization-scores";

export function useOptimizationRuns(filters?: OptimizationFilters) {
    const query = useQuery<PaginatedOptimizationRuns>({
        queryKey: [OPT_RUNS_KEY, filters?.scheduleId, filters?.page, filters?.limit],
        queryFn: () => optimizationService.getRuns(filters),
        placeholderData: (prev) => prev, // Transiciones sin flash
        retry: 1,
    });

    return {
        runs: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
}

export function useOptimizationScores() {
    const query = useQuery({
        queryKey: [OPT_SCORES_KEY],
        queryFn: optimizationService.getScores,
        retry: 1,
    });

    return {
        scores: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
