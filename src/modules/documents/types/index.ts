export enum DocumentTemplateStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
}

export enum DocumentTemplateFormat {
    PDF = "PDF",
    DOCX = "DOCX",
}

export enum GeneratedDocumentStatus {
    GENERATED = "GENERATED",
    SUBSTITUTED = "SUBSTITUTED",
    VOID = "VOID",
}

export enum DocumentActionType {
    GENERATED = "GENERATED",
    VIEWED = "VIEWED",
    DOWNLOADED = "DOWNLOADED",
    SUBSTITUTED = "SUBSTITUTED",
    VOIDED = "VOIDED",
}

export interface DocumentTemplate {
    id: string;
    organizationId: string;
    branchId?: string | null;
    code: string;
    name: string;
    description?: string | null;
    documentType: string;
    format: DocumentTemplateFormat;
    header?: Record<string, any> | null;
    body: string;
    footer?: Record<string, any> | null;
    logoPath?: string | null;
    fields?: Record<string, any> | null;
    numberingPrefix?: string | null;
    numberingDigits?: number | null;
    nextSequence: number;
    signatureBlocks?: any[] | null;
    isDefault: boolean;
    status: DocumentTemplateStatus;
    version: number;
    effectiveFrom: string;
    effectiveTo?: string | null;
    supersedesTemplateId?: string | null;
    retentionDays?: number | null;
    createdById?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentAction {
    id: string;
    documentId: string;
    action: DocumentActionType;
    userId?: string | null;
    details?: Record<string, any> | null;
    createdAt: string;
}

export interface GeneratedDocument {
    id: string;
    organizationId: string;
    branchId?: string | null;
    templateId: string;
    templateVersion: number;
    documentType: string;
    documentNumber?: string | null;
    title: string;
    status: GeneratedDocumentStatus;
    filePath: string;
    mimeType: string;
    sizeBytes?: number | null;
    employeeId?: string | null;
    vacationId?: string | null;
    metadata?: Record<string, any> | null;
    generatedById?: string | null;
    retentionUntil?: string | null;
    substitutedById?: string | null;
    voidReason?: string | null;
    voidedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    template?: { id: string; code: string; name: string; version: number };
    employee?: {
        id: string;
        user?: { firstName: string; lastName: string };
    } | null;
    vacation?: { id: string; startDate: string; endDate: string } | null;
    actions?: DocumentAction[];
    substitutedBy?: { id: string; title: string; documentNumber?: string; createdAt: string } | null;
}

export interface DocumentFilter {
    documentType?: string;
    status?: GeneratedDocumentStatus;
    employeeId?: string;
    branchId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    VACATION_RECEIPT: "Comprobante de Vacaciones",
    ABSENCE_CERTIFICATE: "Certificado de Ausencia",
    SCHEDULE_REPORT: "Reporte de Horarios",
    STAFF_ASSIGNMENT: "Asignación de Personal",
    OPERATIONAL_REPORT: "Reporte Operacional",
    CUSTOM: "Personalizado",
};

export const TEMPLATE_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Borrador",
    ACTIVE: "Activa",
    ARCHIVED: "Archivada",
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
    GENERATED: "Generado",
    SUBSTITUTED: "Sustituido",
    VOID: "Anulado",
};

export const ACTION_LABELS: Record<string, string> = {
    GENERATED: "Generado",
    VIEWED: "Consultado",
    DOWNLOADED: "Descargado",
    SUBSTITUTED: "Sustituido",
    VOIDED: "Anulado",
};
