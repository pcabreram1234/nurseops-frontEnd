export type PreferredShift = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'MORNING_AFTERNOON' | 'MORNING_NIGHT' | 'NIGHT_AFTERNOON';

export interface ShiftTemplate {
    id: string;
    organizationId: string;
    branchId: string;
    departmentId?: string | null;
    name: PreferredShift;
    minimum_staff: number;
    durationHours: number;
    isNightShift: boolean;
    description: string;
    configuration: any;
    startTime: string;
    endTime: string;
    color?: string | null;
    isActive: boolean;
    autoAssignable: boolean;
    priority: number;
    department?: { id: string; name: string } | null;
    branch?: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
}

export interface ShiftTemplateFormData {
    organizationId: string;
    branchId: string;
    departmentId?: string;
    name: PreferredShift;
    minimum_staff: number;
    durationHours: number;
    isNightShift: boolean;
    description: string;
    configuration: any;
    startTime: string;
    endTime: string;
    color?: string;
    isActive: boolean;
    autoAssignable: boolean;
    priority: number;
}