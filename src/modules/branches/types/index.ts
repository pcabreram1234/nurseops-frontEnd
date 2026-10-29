export interface BranchDepartmentLink {
    departmentId: string;
    branchId: string;
    isPrimary: boolean;
    department: {
        id: string;
        name: string;
        code?: string;
        type?: string;
        isActive?: boolean;
    };
}

export interface Branch {
    id: string;
    organizationId: string;
    organization?: {
        id: string;
        name: string;
    };
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    latitude?: number | null;
    longitude?: number | null;
    timezone?: string | null;
    isMainBranch: boolean;
    isActive: boolean;
    /** Sedes ↔ departamentos (tabla puente DepartmentBranch). */
    departments?: BranchDepartmentLink[];
    _count?: {
        departments?: number;
        users?: number;
        nurses?: number;
        schedules?: number;
        scheduleEntries?: number;
        shifts?: number;
        shiftTemplates?: number;
        absences?: number;
        vacations?: number;
        leaves?: number;
        nurseAvailabilities?: number;
        emergencyCoverages?: number;
    };
}

export interface BranchFormData {
    organizationId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isMainBranch: boolean;
    isActive: boolean;
}