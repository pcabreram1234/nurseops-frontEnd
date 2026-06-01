export interface SpecialityFormData {
    name: string;
    code: string;
    description: string;
    organizationId: string;
    isActive: boolean;
    // Permite guardar los IDs de los departamentos vinculados desde el formulario
    departmentIds?: string[];
}

export interface DepartmentSpecialityRelation {
    departmentId: string;
    specialityId: string;
    required: boolean;
    priority: number;
    minimum_staff: number;
    createdAt: string;
    department?: {
        id: string;
        name: string;
    };
}

export interface Speciality {
    id: string;
    name: string;
    code: string;
    description: string;
    organizationId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    departmentSpecialities?: DepartmentSpecialityRelation[];
    // nurses?: any[];
}