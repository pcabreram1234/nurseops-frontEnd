// types.ts

export type PriorityTypes = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Catálogo maestro de Severidades para la UI
export const PRIORITY_LEVELS: PriorityTypes[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// Lista completa basada en tu Prisma Enum (Puedes agregar más si lo requieres)
export const RESTRICTION_TYPE_NAMES = [
    'NO_NIGHT_SHIFTS',
    'ONLY_NIGHT_SHIFTS',
    'ONLY_DAY_SHIFTS',
    'ONLY_MORNING_SHIFTS',
    'ONLY_AFTERNOON_SHIFTS',
    'NO_WEEKENDS',
    'WEEKENDS_ONLY',
    'NO_HOLIDAYS',
    'NO_DOUBLE_SHIFTS',
    'NO_CONSECUTIVE_SHIFTS',
    'NO_CONSECUTIVE_NIGHTS',
    'LIMITED_CONSECUTIVE_DAYS',
    'LIMITED_HOURS',
    'NO_OVERTIME',
    'MAX_40_HOURS_WEEK',
    'MAX_8_HOURS_DAY',
    'REDUCED_WORKLOAD',
    'PART_TIME_ONLY',
    'PREGNANCY_RESTRICTION',
    'MEDICAL_RESTRICTION',
    'NO_HEAVY_PATIENTS',
    'NO_STANDING_LONG_HOURS',
    'FATIGUE_RECOVERY',
    'POST_SURGERY_LIMITATION',
    'TEMPORARY_HEALTH_LIMITATION',
    'CHRONIC_CONDITION',
    'MENTAL_HEALTH_RESTRICTION',
    'ONLY_ICU',
    'ONLY_ER',
    'ONLY_PEDIATRICS',
    'NO_ICU',
    'NO_ER',
    'NO_SURGERY',
    'RESTRICTED_DEPARTMENT_ACCESS',
    'UNDER_TRAINING',
    'SUPERVISION_REQUIRED',
    'NO_CRITICAL_PATIENTS',
    'JUNIOR_LIMITATION',
    'INTERN_RESTRICTION',
    'PROBATION_PERIOD',
    'UNION_RESTRICTION',
    'CONTRACT_LIMITATION',
    'TEMPORARY_EMPLOYEE',
    'AGENCY_STAFF_ONLY',
    'NO_EXTRA_SHIFTS',
    'FIXED_SCHEDULE_ONLY',
    'NO_EMERGENCY_COVERAGE',
    'LAST_MINUTE_UNAVAILABLE',
    'CANNOT_BE_ON_CALL',
    'RESTRICTED_MOBILITY',
    'NO_FLOATING',
    'HIGH_FATIGUE_RISK',
    'LABOR_LAW_LIMITATION',
    'MINIMUM_REST_REQUIRED',
    'MAX_MONTHLY_HOURS_REACHED',
    'LICENSE_RESTRICTION',
    'CERTIFICATION_EXPIRED',
    'TEMPORARY_AVAILABILITY',
    'VACATION_TRANSITION',
    'RETURNING_FROM_LEAVE',
    'RECENT_OVERTIME_BLOCK',
    'HIGH_RISK_PATIENT_RESTRICTION',
    'INFECTIOUS_AREA_RESTRICTION',
    'ISOLATION_AREA_RESTRICTION',
    'BIOHAZARD_LIMITATION',

];

export const RESTRICTION_DESCRIPTIONS = [
    'NO_PUEDE_HACER_AMANECIDAS',
    'SOLO_TRABAJA_NOCHES',
    'SOLO_TRABAJA_DIAS',
    'SOLO_MAÑANAS',
    'SOLO_TARDES',
    'NO_TRABAJA_FINES_DE_SEMANA',
    'SOLO_FINES_DE_SEMANA',
    'NO_TRABAJA_FERIADOS',
    'NO_PUEDE_HACER_DOBLE_TURNO',
    'NO_TURNOS_SEGUIDOS',
    'NO_NOCHES_CONSECUTIVAS',
    'MAXIMO_DIAS_SEGUIDOS',
    'HORAS_LIMITADAS',
    'NO_OVERTIME',
    'MAXIMO_40H',
    'MAXIMO_8H_POR_DIA',
    'CARGA_REDUCIDA',
    'SOLO_MEDIO_TIEMPO',
    'RESTRICCION_EMBARAZO',
    'RESTRICCION_MEDICA_GENERAL',
    'NO_PACIENTES_PESADOS',
    'NO_LARGAS_HORAS_DE_PIE',
    'RECUPERACION_FISICA',
    'RECUPERACION_CIRUGIA',
    'RESTRICCION_TEMPORAL',
    'CONDICION_CRONICA',
    'SALUD_MENTAL',
    'SOLO_UCI',
    'SOLO_EMERGENCIAS',
    'SOLO_PEDIATRIA',
    'NO_UCI',
    'NO_EMERGENCIAS',
    'NO_CIRUGIA',
    'ACCESO_LIMITADO',
    'EN_ENTRENAMIENTO',
    'REQUIERE_SUPERVISION',
    'NO_CRITICOS',
    'RESTRICCION_JUNIOR',
    'PASANTIA',
    'PERIODO_PRUEBA',
    'SINDICATO',
    'RESTRICCION_CONTRACTUAL',
    'TEMPORAL',
    'PERSONAL_EXTERNO',
    'NO_TURNOS_EXTRA',
    'HORARIO_FIJO',
    'NO_COBERTURA_URGENTE',
    'NO_DISPONIBILIDAD_URGENTE',
    'NO_GUARDIAS',
    'NO_MOVERSE_ENTRE_DEPARTAMENTOS',
    'NO_SOPORTE_CRUZADO',
    'ALTO_RIESGO_FATIGA',
    'RESTRICCION_LEGAL',
    'DESCANSO_OBLIGATORIO',
    'LIMITE_MENSUAL_ALCANZADO',
    'LICENCIA_LIMITADA',
    'CERTIFICACION_VENCIDA',
    'DISPONIBILIDAD_TEMPORAL',
    'CERCA_VACACIONES',
    'REINTEGRACION',
    'BLOQUEADA_POR_OVERTIME_RECIENTE',
    'NO_PACIENTES_ALTO_RISGO',
    'NO_AREAS_INFECCIOSAS',
    'NO_AISLAMIENTO',
    'RESTRICCION_BIOSEGURIDAD',

];

export interface NurseRestrictionType {
    id: string;
    code: string;
    name: string;
    description: string;
    severity: PriorityTypes;
    affects_scheduler: boolean;
    affects_overtime: boolean;
    affects_nights: boolean;
    isSystem: boolean;
    isActive: boolean;
}

export interface NurseRestriction {
    id: string;
    organizationId: string;
    nurseId: string;
    nurse?: { id: string; userId: string; user?: { firstName: string; lastName: string; }; };
    restrictionTypeId: string;
    restrictionType?: NurseRestrictionType;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    isTemporary: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface RestrictionFormInput {
    nurseIds: string[];
    restrictionTypeId: string;
    startDate: string;
    endDate: string;
    isTemporary: boolean;
    isActive: boolean;
    notes: string;
}

// NUEVO: Input para crear/editar un Tipo en el Catálogo
export interface RestrictionTypeFormInput {
    code: string;
    name: string;
    description: string;
    severity: PriorityTypes;
    affects_scheduler: boolean;
    affects_overtime: boolean;
    affects_nights: boolean;
    isSystem: boolean;
    isActive: boolean;
}