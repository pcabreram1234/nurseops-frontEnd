export type VacationStatus =
    | "DRAFT" | "PENDING_APPROVAL" | "UNDER_REVIEW" | "APPROVED"
    | "PARTIALLY_APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED"
    | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SUSPENSION";

export interface Vacation {
    id: string;
    departmentId?: string;
    organizationId: string;
    branchId?: string | null;
    nurseId: string;
    startDate: string;
    endDate: string;
    status: VacationStatus;
    reason: string;
    notes?: string;
    approvedById?: string | null;
    approvedAt?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
    updatedAt: string;
    nurse?: {
        id: string;
        departmentId?: string;
        branchId?: string | null;
        branch?: { id: string; name: string } | null;
        user?: { id: string; firstName: string; lastName: string; email: string };
        department?: { id: string; name: string };
        vacationDaysAvailable?: number;
        vacationDaysTaken?: number;
    };
    branch?: { id: string; name: string } | null;
    approvedBy?: { id: string; firstName: string; lastName: string };
}

export interface VacationFormData {
    nurseId: string;
    startDate: string;
    endDate: string;
    status?: VacationStatus;
    reason?: string;
    notes?: string;
}

export interface VacationFilters {
    nurseId?: string;
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedVacations {
    data: Vacation[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const VACATION_STATUS_LABELS: Record<VacationStatus, string> = {
    DRAFT: "Borrador",
    PENDING_APPROVAL: "Pendiente de aprobación",
    UNDER_REVIEW: "En revisión",
    APPROVED: "Aprobada",
    PARTIALLY_APPROVED: "Parcialmente aprobada",
    REJECTED: "Rechazada",
    CANCELLED: "Cancelada",
    EXPIRED: "Expirada",
    SCHEDULED: "Programada",
    IN_PROGRESS: "En curso",
    COMPLETED: "Completada",
    SUSPENSION: "Suspensión",
};

export const VACATION_STATUS_BADGE: Record<VacationStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    PARTIALLY_APPROVED: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300",
    REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
    EXPIRED: "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
    SCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
    IN_PROGRESS: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
    SUSPENSION: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
};

/** Estados que pueden ser aprobados/rechazados desde la interfaz */
export const APPROVABLE_STATUSES: VacationStatus[] = ["PENDING_APPROVAL", "UNDER_REVIEW", "DRAFT"];
