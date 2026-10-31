import { apiInstance } from "@/services/axios";
import {
    DocumentTemplate,
    GeneratedDocument,
    DocumentAction,
    DocumentFilter,
} from "../types";

function unwrap(resp: any) {
    return resp?.data ?? resp;
}

export const documentService = {
    // ── PLANTILLAS ──
    getTemplates: async (filters?: { documentType?: string; status?: string }): Promise<DocumentTemplate[]> => {
        const resp = await apiInstance.get("/document-templates", { params: filters || {} });
        return unwrap(resp);
    },

    getTemplate: async (id: string): Promise<DocumentTemplate> => {
        const resp = await apiInstance.get(`/document-templates/${id}`);
        return unwrap(resp);
    },

    createTemplate: async (data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
        const resp = await apiInstance.post("/document-templates", data);
        return unwrap(resp);
    },

    updateTemplate: async (id: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> => {
        const resp = await apiInstance.patch(`/document-templates/${id}`, data);
        return unwrap(resp);
    },

    activateTemplate: async (id: string): Promise<DocumentTemplate> => {
        const resp = await apiInstance.post(`/document-templates/${id}/activate`);
        return unwrap(resp);
    },

    setDefaultTemplate: async (id: string): Promise<DocumentTemplate> => {
        const resp = await apiInstance.post(`/document-templates/${id}/set-default`);
        return unwrap(resp);
    },

    archiveTemplate: async (id: string): Promise<DocumentTemplate> => {
        const resp = await apiInstance.post(`/document-templates/${id}/archive`);
        return unwrap(resp);
    },

    // ── DOCUMENTOS GENERADOS ──
    getDocuments: async (filters?: DocumentFilter): Promise<{ data: GeneratedDocument[]; meta: any }> => {
        const resp = await apiInstance.get("/documents", { params: filters || {} });
        return unwrap(resp);
    },

    getDocument: async (id: string): Promise<GeneratedDocument> => {
        const resp = await apiInstance.get(`/documents/${id}`);
        return unwrap(resp);
    },

    generateDocument: async (data: {
        templateId: string;
        employeeId?: string;
        vacationId?: string;
        branchId?: string;
        title?: string;
        values?: Record<string, any>;
    }): Promise<GeneratedDocument> => {
        const resp = await apiInstance.post("/documents/generate", data);
        return unwrap(resp);
    },

    downloadDocument: async (id: string): Promise<Blob> => {
        const resp = await apiInstance.get(`/documents/${id}/download`, { responseType: "blob" });
        return (resp as any)?.data ?? resp;
    },

    substituteDocument: async (id: string, data: {
        templateId?: string;
        employeeId?: string;
        vacationId?: string;
        title?: string;
        values?: Record<string, any>;
    }): Promise<{ original: GeneratedDocument; replacement: GeneratedDocument }> => {
        const resp = await apiInstance.post(`/documents/${id}/substitute`, data);
        return unwrap(resp);
    },

    voidDocument: async (id: string, reason?: string): Promise<GeneratedDocument> => {
        const resp = await apiInstance.post(`/documents/${id}/void`, { reason });
        return unwrap(resp);
    },

    getActions: async (id: string): Promise<DocumentAction[]> => {
        const resp = await apiInstance.get(`/documents/${id}/actions`);
        return unwrap(resp);
    },
};
