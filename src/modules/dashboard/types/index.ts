export interface DashboardSummary {
  user: {
    id: string;
    role: string;
    organizationId?: string;
    name?: string;
  };
  overview: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalDepartments: number;
    totalNurses: number;
    activeNurses: number;
    totalUsers: number;
    scheduleEntriesToday: number;
    coverageToday: number;
    openToday: number;
    coveragePercent: number;
    openAlerts: number;
    criticalAlerts: number;
    pendingAbsences: number;
    activeVacations: number;
  };
  todaySchedule: any[];
  recentAlerts: any[];
  recentActivity: any[];
  departments: Array<{ id: string; name: string; code: string; nursesCount: number; usersCount: number }>;
  organizations: Array<{ id: string; name: string; code: string; status: string; departmentsCount: number; nursesCount: number; usersCount: number }>;
  statusCountsToday: Record<string, number>;
  generatedAt: string;
}

export interface DashboardFilters {
  organizationId?: string;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
}
