import { apiInstance } from "@/services/axios";
import { VacationPolicy, VacationPolicyFormData, NurseVacationProfile, VacationBalance } from "../types";

function unwrap(resp: any) {
    return resp?.data ?? resp;
}

export const vacationPolicyService = {
    // ── POLÍTICAS ──
    getAll: async (filters?: { status?: string; regimeCode?: string }): Promise<VacationPolicy[]> => {
        const resp = await apiInstance.get("/vacation-policies", { params: filters || {} });
        return unwrap(resp);
    },

    getById: async (id: string): Promise<VacationPolicy> => {
        const resp = await apiInstance.get(`/vacation-policies/${id}`);
        return unwrap(resp);
    },

    create: async (data: VacationPolicyFormData): Promise<VacationPolicy> => {
        const resp = await apiInstance.post("/vacation-policies", data);
        return unwrap(resp);
    },

    update: async (id: string, data: Partial<VacationPolicyFormData>): Promise<VacationPolicy> => {
        const resp = await apiInstance.patch(`/vacation-policies/${id}`, data);
        return unwrap(resp);
    },

    activate: async (id: string): Promise<VacationPolicy> => {
        const resp = await apiInstance.post(`/vacation-policies/${id}/activate`);
        return unwrap(resp);
    },

    archive: async (id: string): Promise<VacationPolicy> => {
        const resp = await apiInstance.post(`/vacation-policies/${id}/archive`);
        return unwrap(resp);
    },

    // ── ASIGNACIÓN A ENFERMERAS ──
    assignToNurse: async (policyId: string, data: {
        nurseId: string;
        effectiveFrom: string;
        isActive?: boolean;
    }): Promise<NurseVacationProfile> => {
        const resp = await apiInstance.post(`/vacation-policies/${policyId}/assign`, data);
        return unwrap(resp);
    },

    getNurseProfiles: async (nurseId: string): Promise<NurseVacationProfile[]> => {
        const resp = await apiInstance.get(`/vacation-policies/nurses/${nurseId}/profiles`);
        return unwrap(resp);
    },

    // ── SALDOS ──
    getBalance: async (nurseId: string, periodStart?: string): Promise<VacationBalance> => {
        const resp = await apiInstance.get(`/vacation-policies/nurses/${nurseId}/balance`, {
            params: periodStart ? { periodStart } : {},
        });
        return unwrap(resp);
    },

    simulate: async (policyId: string, data: {
        nurseId: string;
        startDate: string;
        endDate: string;
    }): Promise<{ available: number; requested: number; sufficient: boolean }> => {
        const resp = await apiInstance.post(`/vacation-policies/${policyId}/simulate`, data);
        return unwrap(resp);
    },
};
