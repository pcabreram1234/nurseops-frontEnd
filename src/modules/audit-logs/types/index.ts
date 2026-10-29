/**
 * Nota: El modelo `AuditLog` de Prisma (con ipAddress, userAgent, requestId,
 * old_value/new_value) NO tiene endpoint REST expuesto en el backend actual.
 *
 * Esta interfaz consulta `ActivityLog` vía `/api/v1/activity-logs`, que sí está
 * disponible y permite auditoría de actividad operacional (acciones, usuario, fecha).
 *
 * Dependencia pendiente: crear endpoint GET para `AuditLog` si se requiere
 * investigar cambios con valores anterior/posterior e IP.
 */
export type ActivityLogType =
    | "LOGIN" | "LOGOUT" | "VIEW_SCHEDULE" | "EXPORT_REPORT" | "CREATE_SHIFT"
    | "SEARCH_USER" | "OPEN_NOTIFICATION" | "SHIFT_APPROVED" | "RULE_VIOLATED"
    | "SHIFT_MODIFIED" | "SHIFT_DELETED" | "ENGINE_EXECUTED"
    | "SCHEDULE_PUBLISHED" | "SCHEDULE_GENERATION_STARTED" | "SCHEDULE_REGENERATED";

export interface ActivityLog {
    id: string;
    userId: string;
    action: ActivityLogType;
    details: any;
    createdAt: string;
    user?: { id: string; firstName: string; lastName: string; email: string };
}

export interface ActivityLogFilters {
    userId?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
}

export const ACTION_LABELS: Record<string, string> = {
    LOGIN: "Inicio de sesión",
    LOGOUT: "Cierre de sesión",
    VIEW_SCHEDULE: "Consulta de horario",
    EXPORT_REPORT: "Exportación de reporte",
    CREATE_SHIFT: "Creación de turno",
    SEARCH_USER: "Búsqueda de usuario",
    OPEN_NOTIFICATION: "Apertura de notificación",
    SHIFT_APPROVED: "Aprobación de turno",
    RULE_VIOLATED: "Violación de regla",
    SHIFT_MODIFIED: "Modificación de turno",
    SHIFT_DELETED: "Eliminación de turno",
    ENGINE_EXECUTED: "Ejecución del motor",
    SCHEDULE_PUBLISHED: "Publicación de horario",
    SCHEDULE_GENERATION_STARTED: "Inicio de generación de horario",
    SCHEDULE_REGENERATED: "Regeneración de horario",
};

export const ACTION_BADGE: Record<string, string> = {
    LOGIN: "bg-blue-50 text-blue-700 border-blue-200",
    LOGOUT: "bg-slate-100 text-slate-600 border-slate-200",
    VIEW_SCHEDULE: "bg-indigo-50 text-indigo-700 border-indigo-200",
    EXPORT_REPORT: "bg-purple-50 text-purple-700 border-purple-200",
    CREATE_SHIFT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SHIFT_APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SHIFT_MODIFIED: "bg-amber-50 text-amber-700 border-amber-200",
    SHIFT_DELETED: "bg-red-50 text-red-700 border-red-200",
    RULE_VIOLATED: "bg-red-50 text-red-700 border-red-200",
    ENGINE_EXECUTED: "bg-cyan-50 text-cyan-700 border-cyan-200",
    SCHEDULE_PUBLISHED: "bg-teal-50 text-teal-700 border-teal-200",
    SCHEDULE_GENERATION_STARTED: "bg-blue-50 text-blue-700 border-blue-200",
    SCHEDULE_REGENERATED: "bg-blue-50 text-blue-700 border-blue-200",
    SEARCH_USER: "bg-slate-100 text-slate-600 border-slate-200",
    OPEN_NOTIFICATION: "bg-slate-100 text-slate-600 border-slate-200",
};
