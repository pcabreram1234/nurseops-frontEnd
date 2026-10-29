export interface WorkLoadMetrics {
    id: string;
    organizationId: string;
    nurseId: string;
    total_hours: number;
    overtime_hours: number;
    month: number;
    year: number;
    regular_hours: number;
    nigth_hours: number;
    weekend_hours: number;
    holidy_hours: number;
    emergency_hours: number;
    fatigue_score: number;
    fairness_score: number;
    workload_score: number;
    burnout_risk: number;
    createdAt: string;
    updatedAt: string;
    nurse?: {
        id: string;
        departmentId?: string;
        user?: { id: string; firstName: string; lastName: string; email: string };
        department?: { id: string; name: string };
    };
}

export interface WorkloadFilters {
    nurseId?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedWorkload {
    data: WorkLoadMetrics[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface WorkloadDashboard {
    totalNurses?: number;
    avgFatigue?: number;
    avgFairness?: number;
    avgWorkload?: number;
    avgBurnout?: number;
    [key: string]: any;
}

/** Conversión segura de Decimal de Prisma a number */
export function toNum(v: unknown): number {
    if (v === null || v === undefined) return 0;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}

export const MONTH_NAMES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
