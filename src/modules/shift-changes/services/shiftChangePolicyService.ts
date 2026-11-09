import { apiInstance } from "@/services/axios";

export interface ShiftChangePolicy {
    id: string;
    organizationId: string;
    branchId?: string | null;
    departmentId?: string | null;
    enabled: boolean;
    allowSwap: boolean;
    allowTransfer: boolean;
    allowCoverage: boolean;
    allowCrossDepartment: boolean;
    allowCrossBranch: boolean;
    requireJustification: boolean;
    requireDocument: boolean;
    requireSupervisorApproval: boolean;
    requireHrApproval: boolean;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    autoExpireHours: number;
    maxSimultaneousRequests: number;
    allowMultipleApplications: boolean;
    createdAt: string;
    updatedAt: string;
    organization?: {
        id: string;
        name: string;
        code: string;
    };
    branch?: {
        id: string;
        name: string;
    } | null;
    department?: {
        id: string;
        name: string;
    } | null;
}

export interface ShiftChangePolicyFilters {
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
    enabled?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ShiftChangePolicyFormData {
    organizationId?: string;
    branchId?: string;
    departmentId?: string;
    enabled?: boolean;
    allowSwap?: boolean;
    allowTransfer?: boolean;
    allowCoverage?: boolean;
    allowCrossDepartment?: boolean;
    allowCrossBranch?: boolean;
    requireJustification?: boolean;
    requireDocument?: boolean;
    requireSupervisorApproval?: boolean;
    requireHrApproval?: boolean;
    minAdvanceHours?: number;
    maxAdvanceDays?: number;
    autoExpireHours?: number;
    maxSimultaneousRequests?: number;
    allowMultipleApplications?: boolean;
}

export interface ShiftChangePolicyMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const shiftChangePolicyService = {
    getAll: async (filters?: ShiftChangePolicyFilters): Promise<{
        data: ShiftChangePolicy[];
        meta: ShiftChangePolicyMeta;
    }> => {
        const params = new URLSearchParams();
        if (filters?.organizationId) params.append("organizationId", filters.organizationId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.enabled !== undefined) params.append("enabled", String(filters.enabled));
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/shift-change-policies", { params });
        return (resp as any)?.data || { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    },

    getById: async (id: string): Promise<ShiftChangePolicy> => {
        const resp = await apiInstance.get(`/shift-change-policies/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (data: ShiftChangePolicyFormData): Promise<ShiftChangePolicy> => {
        const resp = await apiInstance.post("/shift-change-policies", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<ShiftChangePolicyFormData>): Promise<ShiftChangePolicy> => {
        const resp = await apiInstance.put(`/shift-change-policies/${id}`, data);
        return (resp as any)?.data || resp;
    },

    remove: async (id: string): Promise<void> => {
        await apiInstance.delete(`/shift-change-policies/${id}`);
    },
};
