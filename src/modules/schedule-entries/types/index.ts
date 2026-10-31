export type ScheduleEntryStatus = "ASSIGNED" | "CONFIRMED" | "PENDING" | "CANCELLED" | "REPLACED" | "OPEN";

export interface ScheduleEntry {
    id: string;
    scheduleId: string;
    shiftId: string;
    branchId?: string | null;
    branch?: { id: string; name: string } | null;
    date: string;
    status: ScheduleEntryStatus;
    nurseId: string | null;
    notes?: string | null;
    isEmergencyCoverage?: boolean;
    createdAt: string;
    updatedAt: string;
    nurse?: {
        id: string;
        user?: { id: string; firstName: string; lastName: string; email: string };
        departmentId?: string;
        branchId?: string | null;
        branch?: { id: string; name: string } | null;
    };
    shift?: {
        id: string;
        name: string;
        startTime: string;
        endTime: string;
        departmentId?: string;
        branchId?: string | null;
        branch?: { id: string; name: string } | null;
    };
    shiftTemplate?: {
        id: string;
        name: string;
        departmentId?: string;
        department?: { id: string; name: string };
    };
}

export interface ScheduleEntryFormData {
    nurseId: string;
    shiftId: string;
    departmentId: string;
    date: string;
    notes?: string;
    isEmergencyCoverage?: boolean;
}

export interface ScheduleEntryFilters {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    branchId?: string;
    nurseId?: string;
    shiftId?: string;
    status?: string;
    scheduleId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedScheduleEntries {
    data: ScheduleEntry[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ScheduleEntriesStats {
    total: number;
    assigned: number;
    vacant: number;
    pending: number;
    cancelled: number;
    emergencies: number;
    statusCounts: Record<string, number>;
    byShift: { id: string; name: string; total: number; assigned: number }[];
    coverage?: number;
    generationTimeMs?: number;
}