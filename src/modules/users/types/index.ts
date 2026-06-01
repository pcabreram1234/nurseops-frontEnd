export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string | null;
    departmentId: string | null;
    rolesId: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'VACATION' | 'LICENSE' | 'SUSPENDED'; // Mapeado a tu NurseStatusType
    lastLoginAt: string;
    createdAt: string;
    // Relaciones opcionales para renderizar en la tabla
    organization?: { name: string } | null;
    department?: { name: string } | null;
    roles?: { name: string } | null;
}

// Datos necesarios para los formularios
export type UserFormData = Omit<User, 'id' | 'lastLoginAt' | 'createdAt' | 'organization' | 'department' | 'roles'> & {
    password?: string; // Opcional en edición, obligatorio al crear
};