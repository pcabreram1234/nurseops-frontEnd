export type AlertStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "IGNORED" | "ESCALATED";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL" | "INFO";
export type AlertType =
    | "STAFF_SHORTAGE" | "OVERTIME_RISK" | "FATIGUE_RISK" | "RULE_VIOLATION"
    | "NO_NIGHT_COVERAGE" | "MULTIPLE_ABSENCES" | "OVERLOADED_NURSE"
    | "UNBALANCED_DISTRIBUTION" | "EMERGENCY_COVERAGE_REQUIRED"
    | "EMERGENCY_COVERAGE_FAILED" | "BURNOUT_CRITICAL" | "STAFFING_SHORTAGE"
    | "SYSTEM_WARNING";

export interface OperationalAlert {
    id: string;
    departmentId: string;
    message: string;
    alertType: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    createdAt: string;
    updatedAt: string;
    department?: { id: string; name: string };
}

export interface AlertFilters {
    departmentId?: string;
    status?: string;
    severity?: string;
    /** Búsqueda server-side sobre el mensaje de la alerta. */
    search?: string;
    /** Paginación server-side. */
    page?: number;
    limit?: number;
}

export interface ResolveAlertPayload {
    resolutionNotes: string;
    resolvedById: string;
}

export interface EscalateAlertPayload {
    targetTier: string;
    reason: string;
}

/** Respuesta de GET /operational-alerts/stats */
export interface AlertStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    ignored: number;
    escalated: number;
    criticalOpen: number;
    statusCounts: Record<string, number>;
    severityCounts: Record<string, number>;
}

/** Niveles de escalación disponibles */
export const ESCALATION_TIERS = [
    { value: "TIER_1_SUPERVISOR", label: "Nivel 1 — Supervisor de área" },
    { value: "TIER_2_CLINICAL_DIRECTOR", label: "Nivel 2 — Director clínico" },
    { value: "TIER_3_HOSPITAL_ADMIN", label: "Nivel 3 — Administración del hospital" },
] as const;

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
    OPEN: "Abierta",
    IN_PROGRESS: "En progreso",
    RESOLVED: "Resuelta",
    IGNORED: "Ignorada",
    ESCALATED: "Escalada",
};

export const ALERT_STATUS_BADGE: Record<AlertStatus, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    IGNORED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    ESCALATED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente",
    CRITICAL: "Crítica",
    INFO: "Info",
};

export const SEVERITY_BADGE: Record<AlertSeverity, string> = {
    LOW: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    HIGH: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    URGENT: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    CRITICAL: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 animate-pulse",
    INFO: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
    STAFF_SHORTAGE: "Falta de personal",
    OVERTIME_RISK: "Riesgo de horas extras",
    FATIGUE_RISK: "Riesgo de fatiga",
    RULE_VIOLATION: "Violación de regla",
    NO_NIGHT_COVERAGE: "Sin cobertura nocturna",
    MULTIPLE_ABSENCES: "Múltiples ausencias",
    OVERLOADED_NURSE: "Personal sobrecargado",
    UNBALANCED_DISTRIBUTION: "Distribución desbalanceada",
    EMERGENCY_COVERAGE_REQUIRED: "Cobertura de emergencia requerida",
    EMERGENCY_COVERAGE_FAILED: "Cobertura de emergencia fallida",
    BURNOUT_CRITICAL: "Agotamiento crítico",
    STAFFING_SHORTAGE: "Déficit de personal",
    SYSTEM_WARNING: "Advertencia del sistema",
};
