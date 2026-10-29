import { apiInstance } from "@/services/axios";
import { Speciality, SpecialityFormData, SpecialityFilters, PaginatedSpecialities } from "@/modules/specialities/types";


export const specialityService = {
    /**
     * Obtiene la lista completa de especialidades
     */
    getAll: async (filters?: SpecialityFilters): Promise<PaginatedSpecialities> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const response = await apiInstance.get('/specialities', { params });
        const data = (response as any)?.data || response;
        if (Array.isArray(data)) {
            return { data, meta: (response as any)?.meta || { total: data.length, page: filters?.page ?? 1, limit: filters?.limit ?? 25, totalPages: Math.ceil(data.length / (filters?.limit ?? 25)) } };
        }
        return data as PaginatedSpecialities;
    },

    /**
     * Crea una nueva especialidad médica
     */
    create: async (data: SpecialityFormData): Promise<Speciality> => {
        const response = await apiInstance.post<Speciality>('/specialities', data);
        return response.data;
    },

    /**
     * Actualiza una especialidad existente por su ID
     */
    update: async (id: string, data: SpecialityFormData): Promise<Speciality> => {
        const response = await apiInstance.patch<Speciality>(`/specialities/${id}`, data);
        return response.data;
    },

    /**
     * Opcional: Elimina una especialidad si lo necesitas en el futuro
     */
    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/specialities/${id}`);
    }
};