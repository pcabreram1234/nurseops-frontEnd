/**
 * Tipos del endpoint de SOLO LECTURA `GET /api/v1/audit-logs`.
 *
 * A diferencia de ActivityLog, AuditLog expone:
 * - valores anterior/posterior (old_value / new_value) de cada modificación
 * - dirección IP, agente de usuario y requestId
 * La escritura ocurre únicamente en el backend (AuditInterceptor → AuditProcessor);
 * no existen endpoints de creación/edición/borrado (inmutabilidad por diseño).
 */
export type AuditAction =
    | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT"
    | "PUBLISH" | "ASSIGN_SHIFT" | "CANCEL_SHIFT" | "AUTO_GENERATE";

export interface AuditLogRecord {
    id: string;
    userId?: string | null;
    organizationId?: string | null;
    action: AuditAction;
    moduleId: string;
    old_value: any;
    new_value: any;
    ipAddress?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
    createdAt: string;
    user?: { id: string; firstName: string; lastName: string; email: string } | null;
    module?: { id: string; code: string; name: string } | null;
    organization?: { id: string; name: string } | null;
}

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    moduleId?: string;
    requestId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedAuditLogs {
    data: AuditLogRecord[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
    CREATE: "Creación",
    UPDATE: "Actualización",
    DELETE: "Eliminación",
    APPROVE: "Aprobación",
    REJECT: "Rechazo",
    PUBLISH: "Publicación",
    ASSIGN_SHIFT: "Asignación de turno",
    CANCEL_SHIFT: "Cancelación de turno",
    AUTO_GENERATE: "Generación automática",
    UNKNOWN: "Desconocida",
};

export const AUDIT_ACTION_BADGE: Record<string, string> = {
    CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
    APPROVE: "bg-blue-50 text-blue-700 border-blue-200",
    REJECT: "bg-rose-50 text-rose-700 border-rose-200",
    PUBLISH: "bg-teal-50 text-teal-700 border-teal-200",
    ASSIGN_SHIFT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    CANCEL_SHIFT: "bg-orange-50 text-orange-700 border-orange-200",
    AUTO_GENERATE: "bg-cyan-50 text-cyan-700 border-cyan-200",
    UNKNOWN: "bg-slate-100 text-slate-600 border-slate-200",
};
