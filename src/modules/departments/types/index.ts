export type DepartmentType = 'ICU' | 'ER' | 'PEDIATRICS' | 'SURGERY' | 'CARDIOLOGY' | 'RADIOLOGY' | 'ONCOLOGY' | 'MATERNITY' | 'LABORATORY' | 'TRAUMA' | 'INTERNAL_MEDICINE' | 'GENERAL'; // Adapta según tus Enums reales
export type DepartmentCriticalLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DepartmentBranchLink {
    departmentId: string;
    branchId: string;
    isPrimary: boolean;
    branch?: {
        id: string;
        name: string;
        city?: string;
        isMainBranch?: boolean;
    };
}

export interface Department {
    id: string;
    name: string;
    organizationId: string;
    code: string;
    description: string;
    /** Sede principal (campo calculado por el backend para compatibilidad). */
    branchId: string | null;
    /** Sedes en las que opera el departamento (N:M). */
    branchIds?: string[];
    branches?: DepartmentBranchLink[];
    type: DepartmentType;
    criticalLevel: DepartmentCriticalLevel;
    minimumStaff: number;
    optimalStaff: number;
    maxCapacity: number;
    allowOvertime: boolean;
    allowsCrossDepartment: boolean;
    requiresSpecialization: boolean;
    isEmergencyDepartment: boolean;
    emergencyPriority?: number | null;
    isActive: boolean;
    organization?: {
        id: string;
        name: string;
    };
    branch?: {
        id: string;
        name: string;
    } | null;
    nurses?: any[];
    shifts?: any[];
}

export interface DepartmentFormData {
    name: string;
    code: string;
    description: string;
    organizationId: string;
    /** Sedes seleccionadas. */
    branchIds: string[];
    /** Sede principal, debe pertenecer a `branchIds`. */
    primaryBranchId: string;
    /** Compatibilidad con clientes/flujos antiguos. */
    branchId?: string;
    type: DepartmentType;
    criticalLevel: DepartmentCriticalLevel;
    minimumStaff: number;
    optimalStaff: number;
    maxCapacity: number;
    allowOvertime: boolean;
    allowsCrossDepartment: boolean;
    requiresSpecialization: boolean;
    isEmergencyDepartment: boolean;
    emergencyPriority?: number;
    isActive: boolean;
}

export interface DepartmentFilters {
    search?: string;
    branchId?: string;
    type?: DepartmentType;
    criticalLevel?: DepartmentCriticalLevel;
    isEmergencyDepartment?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface PaginatedDepartments {
    data: Department[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}