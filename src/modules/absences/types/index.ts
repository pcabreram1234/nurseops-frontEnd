export type AbsenceType = "SICKNESS" | "EMERGENCY" | "NO_SHOW" | "VACATION" | "MEDICAL_LICENSE" | "PERSONAL" | "UNJUSTIFIED";
export type AbsenceStatus = "PENDING" | "APPROVED" | "REJECTED" | "COVERED";

export interface Absence {
    id: string;
    nurseId: string;
    organizationId: string;
    branchId?: string | null;
    date: string;
    endDate: string;
    type: AbsenceType;
    status: AbsenceStatus;
    reason: string;
    reporterById: string;
    approvedById?: string | null;
    notes?: string | null;
    requiresCoverage: boolean;
    emergencyLevel?: number | null;
    createdAt: string;
    updatedAt: string;
    nurse?: {
        id: string;
        departmentId?: string;
        branchId?: string | null;
        branch?: { id: string; name: string } | null;
        user?: { id: string; firstName: string; lastName: string; email: string };
    };
    branch?: { id: string; name: string } | null;
    reporter?: { id: string; firstName: string; lastName: string };
    approver?: { id: string; firstName: string; lastName: string };
}

export interface AbsenceFormData {
    nurseId: string;
    date: string;
    endDate?: string;
    type: AbsenceType;
    reason: string;
    reporterById: string;
    notes?: string;
    requiresCoverage?: boolean;
    emergencyLevel?: number;
}

export interface AbsenceFilters {
    nurseId?: string;
    branchId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedAbsences {
    data: Absence[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
    SICKNESS: "Enfermedad",
    EMERGENCY: "Emergencia",
    NO_SHOW: "Ausente",
    VACATION: "Vacaciones",
    MEDICAL_LICENSE: "Licencia médica",
    PERSONAL: "Personal",
    UNJUSTIFIED: "Injustificada",
};

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    COVERED: "Cubierta",
};
