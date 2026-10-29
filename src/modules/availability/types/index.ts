export type AvailabilityStatus = "AVAILABLE" | "PARTIAL" | "NOT_AVAILABLE";
export type ShiftPreference = "MORNING" | "AFTERNOON" | "NIGHT" | "FLEXIBLE";

export interface NurseAvailability {
    id: string;
    organizationId: string;
    branchId?: string | null;
    nurseId: string;
    date: string;
    status: AvailabilityStatus;
    shiftPreference?: ShiftPreference | null;
    availableForEmergency: boolean;
    availableForOvertime: boolean;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    nurse?: {
        id: string;
        departmentId?: string;
        branchId?: string | null;
        branch?: { id: string; name: string } | null;
        user?: { id: string; firstName: string; lastName: string; email: string };
        department?: { id: string; name: string };
    };
    branch?: { id: string; name: string } | null;
}

export interface AvailabilityFormData {
    nurseId: string;
    date: string;
    status: AvailabilityStatus;
    shiftPreference?: ShiftPreference;
    availableForEmergency?: boolean;
    availableForOvertime?: boolean;
    notes?: string;
}

export interface AvailabilityFilters {
    nurseId?: string;
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedAvailability {
    data: NurseAvailability[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
    AVAILABLE: "Disponible",
    PARTIAL: "Parcialmente disponible",
    NOT_AVAILABLE: "No disponible",
};

export const AVAILABILITY_STATUS_BADGE: Record<AvailabilityStatus, string> = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    PARTIAL: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    NOT_AVAILABLE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
};

export const SHIFT_PREFERENCE_LABELS: Record<ShiftPreference, string> = {
    MORNING: "Mañana",
    AFTERNOON: "Tarde",
    NIGHT: "Noche",
    FLEXIBLE: "Flexible",
};
