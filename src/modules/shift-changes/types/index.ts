export type ShiftChangeStatus =
    | "AWAITING_OTHER_NURSE" | "REJECTED_BY_NURSE" | "ACCEPTED_BY_NURSE"
    | "UNDER_SUPVERSION" | "APPROVED_BY_SUPERVISOR" | "REJECTED_BY_SUPERVISOR"
    | "REJECTED" | "CANCELLED" | "EXPIRED" | "COMPLETED"
    | "ROLLED_BACK" | "CONFLIC_DETECTED";

export interface ShiftChangeRequest {
    id: string;
    organizationId: string;
    requesterId: string;
    receiverId?: string | null;
    sourceShiftId: string;
    targetShiftId?: string | null;
    status: ShiftChangeStatus;
    autoApproved: boolean;
    emergencyRequest: boolean;
    aiRiskScore?: number | null;
    aiRecommendation?: any;
    expiresAt?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    reason?: string | null;
    supervisorNotes?: string | null;
    createdAt: string;
    updatedAt: string;
    requester?: {
        id: string;
        user?: { id: string; firstName: string; lastName: string };
    };
    receiver?: {
        id: string;
        user?: { id: string; firstName: string; lastName: string };
    } | null;
    sourceShift?: {
        id: string;
        name: string;
        startTime: string;
        endTime: string;
    };
    targetShift?: {
        id: string;
        name: string;
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
}

export interface ShiftChangeFormData {
    requesterId: string;
    receiverId?: string;
    sourceShiftId: string;
    targetShiftId?: string;
    reason?: string;
    emergencyRequest?: boolean;
}

export interface ShiftChangeFilters {
    status?: string;
    requesterId?: string;
    receiverId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const REQUEST_STATUS_LABELS: Record<ShiftChangeStatus, string> = {
    AWAITING_OTHER_NURSE: "Esperando enfermera",
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

export const SHIFT_CHANGE_STATUS_LABELS = REQUEST_STATUS_LABELS;
export const SHIFT_CHANGE_STATUS_BADGE = REQUEST_STATUS_BADGE;