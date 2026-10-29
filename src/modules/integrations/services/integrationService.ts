import { apiInstance } from "@/services/axios";
import { Integration, IntegrationFormData, WebhookLog, IntegrationFilters, PaginatedIntegrations } from "../types";

export const integrationService = {
    getAll: async (filters?: IntegrationFilters): Promise<PaginatedIntegrations> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.provider) params.append("provider", filters.provider);
        if (filters?.name) params.append("name", filters.name);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp = await apiInstance.get("/integrations", { params });
        const data = (resp as any)?.data || resp;
        if (Array.isArray(data)) {
            return { data, meta: (resp as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedIntegrations;
    },

    getById: async (id: string): Promise<Integration> => {
        const resp = await apiInstance.get(`/integrations/${id}`);
        return (resp as any)?.data || resp;
    },

    create: async (data: IntegrationFormData): Promise<Integration> => {
        const resp = await apiInstance.post("/integrations", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: Partial<IntegrationFormData>): Promise<Integration> => {
        const resp = await apiInstance.patch(`/integrations/${id}`, data);
        return (resp as any)?.data || resp;
    },

    remove: async (id: string): Promise<void> => {
        await apiInstance.delete(`/integrations/${id}`);
    },

    getWebhookLogs: async (integrationId?: string): Promise<WebhookLog[]> => {
        const params = integrationId ? `?integrationId=${integrationId}` : "";
        const resp = await apiInstance.get(`/webhook-logs${params}`);
        const data = (resp as any)?.data || resp || [];
        return Array.isArray(data) ? data : [];
    },
};
