export type DepartmentType = 'ICU' | 'ER' | 'PEDIATRICS' | 'SURGERY' | 'CARDIOLOGY' | 'RADIOLOGY' | 'ONCOLOGY' | 'MATERNITY' | 'LABORATORY' | 'TRAUMA' | 'INTERNAL_MEDICINE' | 'GENERAL'; // Adapta según tus Enums reales
export type DepartmentCriticalLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Department {
    id: string;
    name: string;
    organizationId: string;
    code: string;
    description: string;
    branchId: string;
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
    };
}

export interface DepartmentFormData {
    name: string;
    code: string;
    description: string;
    organizationId: string;
    branchId: string;
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