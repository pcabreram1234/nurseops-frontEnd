// Enums extraídos directamente de tu esquema Prisma
export enum NurseStatusType {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    VACATION = "VACATION",
    LICENSE = "LICENSE",
    SUSPENDED = "SUSPENDED",
}

export enum ContracTypeList {
    PERMANENT = "PERMANENT",
    TEMPORAL = "TEMPORAL",
    PER_DIEM = "PER_DIEM",
    PART_TIME = "PART_TIME",
}

export enum EducationLevelTypes {
    ASSISTANT = "ASSISTANT",
    TECHNICIAN = "TECHNICIAN",
    BACHELOR_DEGREE = "BACHELOR_DEGREE",
    SPECIALIZATION = "SPECIALIZATION",
    MASTER_DEGREE = "MASTER_DEGREE",
    DOCTORATE = "DOCTORATE",
}

// 🌟 Estructura auxiliar para los inputs de restricciones dentro del formulario
export interface NurseRestrictionFormInput {
    id: string; // Vacío ("") si es una nueva restricción a crear
    restrictionTypeId: string;
    startDate: string; // "YYYY-MM-DD" para interactuar con los inputs de HTML5
    endDate: string;
    isTemporary: boolean;
    isActive: boolean;
    notes: string;
}

// Data plana y sanitizada que enviaremos al Backend
export interface NurseFormData {
    userId: string;
    departmentId: string;
    specialityId?: string | null;
    organizationId: string;
    contract_type: ContracTypeList | string;
    hire_date: string;
    status: NurseStatusType | string;
    isCrossDepartmental: boolean;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };


    // Perfil asociado (NurseProfile)
    birthDate: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    educationLevel: EducationLevelTypes | string;
    yearsOfExperience?: number;
    notes?: string;

    // 🌟 RELACIÓN INTERMEDIA MULTIPLE: Estructura de payload adaptada a la conjunción
    restrictions: NurseRestrictionFormInput[];
}

// Tipo de lectura que devuelve la API (incluyendo relaciones Prisma)
export interface Nurse {
    id: string;
    userId: string;
    departmentId: string;
    organizationId: string;
    contract_type: string;
    hire_date: string;
    status: string;
    isCrossDepartmental: boolean;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    department?: { id: string; name: string };
    speciality?: { id: string; name: string };
    nurseProfiles?: {
        id: string;
        birthDate: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
        educationLevel: string;
        yearsOfExperience?: number;
        notes?: string;
    }[];

    // 🌟 RELACIÓN ACTUALIZADA: Colección de restricciones vinculadas en el Pivot
    nurseRestrictions?: NurseRestriction[];
}

// Interfaz para el objeto individual de la restricción (Reflejo fiel de Prisma)
export interface NurseRestriction {
    id: string;
    organizationId: string;
    nurseId: string;
    restrictionTypeId: string; // 🌟 Cambiado a obligatorio ya que es clave de conjunción
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    isTemporary: boolean;
    isActive: boolean;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;

    // Relación obligatoria con los metadatos y flags de la restricción paramétrica
    restrictionType?: NurseRestrictionType;
}

// Interfaz para la parametrización de las restricciones del sistema
export interface NurseRestrictionType {
    id: string;
    code: string;
    name: string;        // Mapea con el enum NurseRestrictionTypes
    description: string; // Mapea con el enum NurseRestrictionDescriptions
    severity: string;    // PriorityTypes (e.g., HIGH, MEDIUM, LOW)
    affects_scheduler: boolean;
    affects_overtime: boolean;
    affects_nights: boolean;
    isSystem: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// 🌟 INTERFAZ DE REACT HOOK FORM: Tipado adaptado para el useFieldArray del Modal
export interface NurseFormInputs {
    userId: string;
    departmentId: string;
    specialityId?: string;
    organizationId: string;
    contract_type: string;
    status: string;
    hire_date: string;
    isCrossDepartmental: boolean;
    birthDate: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    educationLevel: string;
    yearsOfExperience: number;
    notes: string;

    // 🌟 CAMBIO CRÍTICO: Ahora es un arreglo dinámico controlado por useFieldArray
    restrictions: NurseRestrictionFormInput[];
}