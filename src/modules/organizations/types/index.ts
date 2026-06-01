export interface Organization {
    id: string;
    name: string;
    code: string;
    timezone: string;
    country: string;
    status: 'A' | 'I'; // Activo / Inactivo
    createdAt: string;
    updatedAt: string;
}

// Datos requeridos para Crear o Editar
export type OrganizationFormData = Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;