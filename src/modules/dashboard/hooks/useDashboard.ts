import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { DashboardFilters } from '../types';

export const DASHBOARD_KEY = 'dashboard-summary';

export function useDashboard(filters?: DashboardFilters) {
  const query = useQuery({
    queryKey: [DASHBOARD_KEY, filters?.organizationId, filters?.departmentId],
    queryFn: () => dashboardService.getSummary(filters),
    staleTime: 60 * 1000,
    retry: 1,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
