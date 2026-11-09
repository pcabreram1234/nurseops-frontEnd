export type ShiftChangeStatus =
    | "AWAITING_OTHER_NURSE" | "PUBLISHED" | "REJECTED_BY_NURSE" | "ACCEPTED_BY_NURSE"
    | "UNDER_SUPVERSION" | "APPROVED_BY_SUPERVISOR" | "REJECTED_BY_SUPERVISOR"
    | "REJECTED" | "CANCELLED" | "EXPIRED" | "COMPLETED"
    | "ROLLED_BACK" | "CONFLIC_DETECTED";

export type ShiftChangeOperationType = "SWAP" | "TRANSFER" | "COVERAGE";

export interface ShiftChangeScheduleEntry {
    id: string;
    date: string;
    status: string;
    shift: {
        id: string;
        name: string;
        type: string;
        startTime: string;
        endTime: string;
        isNightShift: boolean;
    };
    shiftTemplate: {
        id: string;
        name: string;
        departmentId: string;
        minimum_staff: number;
        department: {
            id: string;
            name: string;
        };
    };
    branch: {
        id: string;
        name: string;
    } | null;
    nurse: {
        id: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } | null;
    schedule: {
        id: string;
        month: number;
        year: number;
        status: string;
    };
}

export interface ShiftChangeRequest {
    id: string;
    organizationId: string;
    operationType: ShiftChangeOperationType;
    status: ShiftChangeStatus;
    requesterId: string;
    receiverId?: string | null;
    sourceScheduleEntryId: string;
    targetScheduleEntryId?: string | null;
    sourceShiftId: string;
    targetShiftId?: string | null;
    autoApproved: boolean;
    emergencyRequest: boolean;
    aiRiskScore?: number | null;
    aiRecommendation?: any;
    expiresAt?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    reason?: string | null;
    supervisorNotes?: string | null;
    approverId?: string | null;
    createdAt: string;
    updatedAt: string;
    /** Usuario autenticado que registró la operación (para auditoría) */
    createdBy?: string | null;
    requester?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        user?: { id: string; firstName: string; lastName: string };
    };
    receiver?: {
        id: string;
        firstName?: string;
        lastName?: string;
        user?: { id: string; firstName: string; lastName: string };
    } | null;
    approver?: {
        id: string;
        firstName?: string;
        lastName?: string;
    } | null;
    sourceScheduleEntry?: ShiftChangeScheduleEntry;
    targetScheduleEntry?: ShiftChangeScheduleEntry | null;
    sourceShift?: {
        id: string;
        name?: string;
        startTime: string;
        endTime: string;
    };
    targetShift?: {
        id: string;
        name?: string;
        startTime: string;
        endTime: string;
    } | null;
    shiftChangeApprovals?: {
        id: string;
        status: string;
        approverId?: string | null;
        comments?: string | null;
        createdAt: string;
    }[];
    responses?: {
        id: string;
        nurseId: string;
        decision: string;
        respondedAt?: string | null;
        comments?: string | null;
        nurse: {
            id: string;
            firstName: string;
            lastName: string;
        };
    }[];
    applications?: {
        id: string;
        nurseId: string;
        status: string;
        appliedAt: string;
        selectedAt?: string | null;
        rejectedAt?: string | null;
        nurse: {
            id: string;
            firstName: string;
            lastName: string;
        };
    }[];
}

export interface ShiftChangeFormData {
    requesterId: string;
    receiverId?: string;
    sourceScheduleEntryId: string;
    targetScheduleEntryId?: string;
    operationType?: ShiftChangeOperationType;
    reason?: string;
    emergencyRequest?: boolean;
    expiresAt?: string;
}

export interface ShiftChangeFilters {
    status?: string;
    requesterId?: string;
    receiverId?: string;
    operationType?: ShiftChangeOperationType;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    branchId?: string;
}

export interface CoverageApplication {
    id: string;
    shiftChangeRequestId: string;
    nurseId: string;
    status: "PENDING" | "SELECTED" | "REJECTED" | "WITHDRAWN";
    appliedAt: string;
    selectedAt?: string | null;
    rejectedAt?: string | null;
    nurse: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface ShiftChangeStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    coverageOpportunities: number;
}

export const REQUEST_STATUS_LABELS: Record<ShiftChangeStatus, string> = {
    AWAITING_OTHER_NURSE: "Esperando enfermera",
    PUBLISHED: "Publicada",
    REJECTED_BY_NURSE: "Rechazada por enfermera",
    ACCEPTED_BY_NURSE: "Aceptada por enfermera",
    UNDER_SUPVERSION: "En revisión supervisor",
    APPROVED_BY_SUPERVISOR: "Aprobada supervisor",
    REJECTED_BY_SUPERVISOR: "Rechazada supervisor",
    REJECTED: "Rechazada",
    CANCELLED: "Cancelada",
    EXPIRED: "Expirada",
    COMPLETED: "Completada",
    ROLLED_BACK: "Revertida",
    CONFLIC_DETECTED: "Conflicto detectado",
};

export const REQUEST_STATUS_BADGE: Record<ShiftChangeStatus, string> = {
    AWAITING_OTHER_NURSE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    PUBLISHED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    REJECTED_BY_NURSE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    ACCEPTED_BY_NURSE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    UNDER_SUPVERSION: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
    APPROVED_BY_SUPERVISOR: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    REJECTED_BY_SUPERVISOR: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    EXPIRED: "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
    ROLLED_BACK: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    CONFLIC_DETECTED: "bg-red-50 text-red-700 border-red-200 animate-pulse dark:bg-red-950 dark:text-red-300",
};

export const OPERATION_TYPE_LABELS: Record<ShiftChangeOperationType, string> = {
    SWAP: "Intercambio",
    TRANSFER: "Cesión",
    COVERAGE: "Cobertura",
};

export const OPERATION_TYPE_BADGE: Record<ShiftChangeOperationType, string> = {
    SWAP: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
    TRANSFER: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    COVERAGE: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
};

export const SHIFT_CHANGE_STATUS_LABELS = REQUEST_STATUS_LABELS;
export const SHIFT_CHANGE_STATUS_BADGE = REQUEST_STATUS_BADGE;

export const ACTIONABLE_STATUSES: ShiftChangeStatus[] = [
    "AWAITING_OTHER_NURSE",
    "ACCEPTED_BY_NURSE",
    "UNDER_SUPVERSION",
];

export const isActionable = (status: ShiftChangeStatus): boolean =>
    ACTIONABLE_STATUSES.includes(status);

export function resolvePersonName(
    person?: {
        firstName?: string;
        lastName?: string;
        user?: { firstName: string; lastName: string };
    } | null,
    fallback?: string | null
): string {
    if (person?.user) return `${person.user.firstName} ${person.user.lastName}`.trim();
    if (person?.firstName || person?.lastName) return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
    return fallback || "Sin asignar";
}

export function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES");
}

export function formatTime(iso?: string): string {
    if (!iso) return "—";
    if (iso.includes("T")) {
        const timePart = iso.split("T")[1];
        return timePart ? timePart.slice(0, 5) : "—";
    }
    return iso.slice(0, 5);
}
