export type WorkRuleType = "HARD" | "SOFT" | "CONFIGURABLE" | "EVENT";

export interface WorkRule {
    id: string;
    organizationId: string;
    code: string;
    name: string;
    type: WorkRuleType;
    description?: string | null;
    value: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    workRuleConditions?: WorkRuleCondition[];
    workRuleActions?: WorkRuleAction[];
    ruleGroupAssigments?: { ruleGroupId: string; priority: number; ruleGroup?: RuleGroup }[];
}

export interface WorkRuleCondition {
    id: string;
    workRuleId: string;
    condition_type: string;
    operator: string;
    value: string;
    logical_group?: string | null;
    priority: number;
    enabled: boolean;
    createdAt?: string;
}

export interface WorkRuleAction {
    id: string;
    workRuleId: string;
    action_type: string;
    action_value: string;
    priority: number;
    enabled: boolean;
    stop_execution: boolean;
    async_execution: boolean;
    metadata?: any;
    createdAt?: string;
}

export interface RuleGroup {
    id: string;
    organizationId: string;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkRuleFormData {
    organizationId: string;
    code: string;
    name: string;
    value: string;
    description?: string;
    isActive?: boolean;
}

export interface WorkRuleConditionFormData {
    workRuleId: string;
    condition_type: string;
    operator: string;
    value: string;
    logical_group?: string;
    priority?: number;
    enabled?: boolean;
}

export interface WorkRuleActionFormData {
    workRuleId: string;
    action_type: string;
    action_value?: string;
    priority?: number;
    enabled?: boolean;
    stop_execution?: boolean;
    async_execution?: boolean;
}

export const RULE_TYPE_LABELS: Record<WorkRuleType, string> = {
    HARD: "Obligatoria (Hard)",
    SOFT: "Preferencia (Soft)",
    CONFIGURABLE: "Configurable",
    EVENT: "Evento",
};

export const RULE_TYPE_BADGE: Record<WorkRuleType, string> = {
    HARD: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    SOFT: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    CONFIGURABLE: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    EVENT: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
};

/** Condiciones disponibles en el motor de reglas (código backend) */
export const CONDITION_TYPES = [
    "TOTAL_HOURS", "CONSECUTIVE_NIGHTS", "REST_HOURS", "FATIGUE_SCORE",
    "NIGHT_SHIFTS", "WEEKEND_SHIFTS", "MONTHLY_HOURS",
] as const;

export const CONDITION_OPERATORS = [
    "EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN",
    "GREATER_OR_EQUALS", "LESS_OR_EQUALS", "INCLUDES", "NOT_INCLUDES",
] as const;

/** Acciones disponibles en el motor de reglas (código backend) */
export const ACTION_TYPES = [
    "BLOCK_ASSIGNMENT", "SEND_ALERT", "NOTIFY_SUPERVISOR", "AUTO_REASSIGN",
    "CREATE_INCIDENT", "REMOVE_SHIFT", "REQUIRE_APPROVAL",
] as const;

export interface WorkRuleFilters {
    search?: string;
    isActive?: boolean;
    type?: WorkRuleType;
    code?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedWorkRules {
    data: WorkRule[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}
