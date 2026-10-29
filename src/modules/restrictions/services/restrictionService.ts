import { apiInstance } from "@/services/axios"
import { NurseRestriction, NurseRestrictionType, RestrictionFilters, PaginatedRestrictions } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

console.log(API_URL)

export const restrictionService = {
    // Obtener todas las restricciones activas o asignadas del hospital
    getAll: async (filters?: RestrictionFilters): Promise<PaginatedRestrictions> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.restrictionTypeId) params.append("restrictionTypeId", filters.restrictionTypeId);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const response = await apiInstance.get(`${API_URL}/nurse-restrictions`, { params });
        const data = (response as any)?.data || response;
        if (Array.isArray(data)) {
            return { data, meta: (response as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedRestrictions;
    },

    // 🌟 NUEVO: Sincronización en lote / Asignación masiva para un tipo de restricción
    sync: async (data: any): Promise<{ message: string }> => {
        // Sanitización de fechas antes de enviar al backend masivo
        const payload = {
            ...data,
            startDate: data.isTemporary && data.startDate ? new Date(data.startDate).toISOString() : null,
            endDate: data.isTemporary && data.endDate ? new Date(data.endDate).toISOString() : null,
            notes: data.notes?.toUpperCase() || null,
        };
        const response = await apiInstance.post<{ message: string }>(`${API_URL}/nurse-restrictions/sync`, payload);
        return response.data;
    },

    // Eliminar (o revocar) una restricción médica de forma individual
    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`${API_URL}/nurse-restrictions/${id}`);
    },

    // --- GESTIÓN DEL CATÁLOGO (NurseRestrictionType) ---
    getTypes: async (): Promise<NurseRestrictionType[]> => {
        const response = await apiInstance.get<NurseRestrictionType[]>(`${API_URL}/restriction-types`);
        return response.data;
    },
    createType: async (data: any): Promise<NurseRestrictionType> => {
        const payload = { ...data, code: data.code.toUpperCase() };
        const response = await apiInstance.post<NurseRestrictionType>(`${API_URL}/restriction-types`, payload);
        return response.data;
    },
    updateType: async (id: string, data: any): Promise<NurseRestrictionType> => {
        const payload = { ...data, code: data.code.toUpperCase() };
        const response = await apiInstance.patch<NurseRestrictionType>(`${API_URL}/restriction-types/${id}`, payload);
        return response.data;
    },
    deleteType: async (id: string): Promise<void> => {
        await apiInstance.delete(`${API_URL}/restriction-types/${id}`);
    }
};