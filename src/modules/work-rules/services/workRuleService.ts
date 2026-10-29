import { apiInstance } from "@/services/axios";
import {
    WorkRule, WorkRuleCondition, WorkRuleAction, RuleGroup,
    WorkRuleFormData, WorkRuleConditionFormData, WorkRuleActionFormData,
    WorkRuleFilters, PaginatedWorkRules
} from "../types";

export const workRuleService = {
    getAll: async (filters?: WorkRuleFilters): Promise<PaginatedWorkRules> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
        if (filters?.type) params.append("type", filters.type);
        if (filters?.code) params.append("code", filters.code);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/work-rules", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedWorkRules;
    },

    getById: async (id: string): Promise<WorkRule> => {
        const resp = await apiInstance.get(`/work-rules/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (data: WorkRuleFormData): Promise<WorkRule> => {
        const resp = await apiInstance.post("/work-rules", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<WorkRuleFormData>): Promise<WorkRule> => {
        const resp = await apiInstance.patch(`/work-rules/${id}`, data);
        return (resp as any)?.data || resp;
    },

    remove: async (id: string): Promise<void> => {
        await apiInstance.delete(`/work-rules/${id}`);
    },

    // ---- CONDICIONES ----
    getConditions: async (workRuleId: string): Promise<WorkRuleCondition[]> => {
        const resp = await apiInstance.get(`/work-rule-conditions/${workRuleId}`);
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },

    createCondition: async (data: WorkRuleConditionFormData): Promise<WorkRuleCondition> => {
        const resp = await apiInstance.post("/work-rule-conditions", data);
        return (resp as any)?.data || resp;
    },

    updateCondition: async (id: string, data: Partial<WorkRuleConditionFormData>): Promise<WorkRuleCondition> => {
        const resp = await apiInstance.patch(`/work-rule-conditions/${id}`, data);
        return (resp as any)?.data || resp;
    },

    removeCondition: async (id: string): Promise<void> => {
        await apiInstance.delete(`/work-rule-conditions/${id}`);
    },

    // ---- ACCIONES ----
    getActions: async (workRuleId: string): Promise<WorkRuleAction[]> => {
        const resp = await apiInstance.get(`/work-rule-actions?workRuleId=${workRuleId}`);
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },

    createAction: async (data: WorkRuleActionFormData): Promise<WorkRuleAction> => {
        const resp = await apiInstance.post("/work-rule-actions", data);
        return (resp as any)?.data || resp;
    },

    updateAction: async (id: string, data: Partial<WorkRuleActionFormData>): Promise<WorkRuleAction> => {
        const resp = await apiInstance.patch(`/work-rule-actions/${id}`, data);
        return (resp as any)?.data || resp;
    },

    removeAction: async (id: string): Promise<void> => {
        await apiInstance.delete(`/work-rule-actions/${id}`);
    },

    // ---- GRUPOS ----
    getGroups: async (): Promise<RuleGroup[]> => {
        const resp = await apiInstance.get("/rule-groups");
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },
};
