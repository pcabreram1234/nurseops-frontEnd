import { apiInstance } from '@/services/axios';
import { DashboardSummary, DashboardFilters } from '../types';

export const dashboardService = {
  getSummary: async (filters?: DashboardFilters): Promise<DashboardSummary> => {
    const params = new URLSearchParams();
    if (filters?.organizationId) params.append('organizationId', filters.organizationId);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    
    const resp: any = await apiInstance.get('/dashboard/summary', { params });
    return resp?.data || resp;
  },
};
