export interface OptimizationRun {
    id: string;
    scheduleId: string;
    departmentId: string;
    startedAt: string;
    fineshedAt: string | null;
    executionTimeMs: number;
    totalSlotsProcessed: number;
    slotsCovered: number;
    coveragePercentage: number;
    result: any;
    schedule?: {
        id: string;
        month: number;
        year: number;
        status: string;
        department?: { id: string; name: string };
    };
    department?: { id: string; name: string };
}

export interface OptimizationScore {
    id: string;
    nurseId: string;
    organizationId: string;
    fairness_score: number;
    fatigue_score: number;
    workload_score: number;
    overtime_score?: number | null;
    preference_score?: number | null;
    overall_score?: number | null;
    calculatedAt: string;
    metadata?: any;
    nurse?: {
        id: string;
        user?: { id: string; firstName: string; lastName: string };
    };
}

export interface OptimizationFilters {
    scheduleId?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedOptimizationRuns {
    data: OptimizationRun[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Conversión segura de Decimal de Prisma */
export function toNum(v: unknown): number {
    if (v === null || v === undefined) return 0;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}

export function getRunStatus(run: OptimizationRun): "completed" | "running" | "failed" {
    if (!run.fineshedAt) return "running";
    const result = run.result;
    if (result?.status === "SUCCESS" || result?.status === "SUCCESS_WITH_WARNINGS") return "completed";
    if (result?.status === "FAILED" || result?.error) return "failed";
    return "completed";
}

export const RUN_STATUS_LABELS = {
    completed: "Completada",
    running: "En curso",
    failed: "Fallida",
} as const;

export const RUN_STATUS_BADGE = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    running: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
} as const;
