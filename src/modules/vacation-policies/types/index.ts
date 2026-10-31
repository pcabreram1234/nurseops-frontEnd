export enum VacationPolicyStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
}

export enum VacationRegimeCode {
    STANDARD = "STANDARD",
    SENIORITY_5 = "SENIORITY_5",
    SENIORITY_10 = "SENIORITY_10",
    SENIORITY_15 = "SENIORITY_15",
    SENIORITY_20 = "SENIORITY_20",
    CUSTOM = "CUSTOM",
}

export interface VacationPolicyRule {
    id?: string;
    minYears: number;
    maxYears?: number | null;
    daysEarned: number;
    description?: string | null;
}

export interface VacationPolicy {
    id: string;
    organizationId: string;
    code: string;
    name: string;
    description?: string | null;
    regimeCode: VacationRegimeCode;
    version: number;
    status: VacationPolicyStatus;
    supersedesPolicyId?: string | null;
    effectiveFrom: string;
    effectiveTo?: string | null;
    accrualMethod: string;
    accrualPeriod: string;
    carryOverMaxDays: number;
    carryOverExpiryMonths: number;
    minAdvanceNoticeDays: number;
    maxConsecutiveDays: number;
    requiresApproval: boolean;
    rules: VacationPolicyRule[];
    createdAt: string;
    updatedAt: string;
}

export interface VacationPolicyFormData {
    code: string;
    name: string;
    description?: string;
    regimeCode: VacationRegimeCode;
    effectiveFrom: string;
    effectiveTo?: string;
    accrualMethod?: string;
    accrualPeriod?: string;
    carryOverMaxDays?: number;
    carryOverExpiryMonths?: number;
    minAdvanceNoticeDays?: number;
    maxConsecutiveDays?: number;
    requiresApproval?: boolean;
    rules: VacationPolicyRule[];
}

export interface NurseVacationProfile {
    id: string;
    nurseId: string;
    policyId: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    isActive: boolean;
    nurse?: {
        id: string;
        user?: { firstName: string; lastName: string };
    };
    policy?: VacationPolicy;
}

export interface VacationBalance {
    id: string;
    nurseId: string;
    policyId: string;
    periodStart: string;
    periodEnd: string;
    openingBalance: number;
    accrued: number;
    consumed: number;
    expired: number;
    adjusted: number;
    available: number;
    reserved: number;
    version: number;
}

export const POLICY_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Borrador",
    ACTIVE: "Activa",
    ARCHIVED: "Archivada",
};

export const REGIME_LABELS: Record<string, string> = {
    STANDARD: "Estándar (14 días)",
    SENIORITY_5: "5+ años (16 días)",
    SENIORITY_10: "10+ años (18 días)",
    SENIORITY_15: "15+ años (20 días)",
    SENIORITY_20: "20+ años (22 días)",
    CUSTOM: "Personalizado",
};

export const ACCRUAL_METHOD_LABELS: Record<string, string> = {
    MONTHLY: "Mensual",
    ANNUAL: "Anual",
    UPFRONT: "Al inicio del período",
};

export const ACCRUAL_PERIOD_LABELS: Record<string, string> = {
    MONTHLY: "Mensual",
    ANNUAL: "Anual",
};
