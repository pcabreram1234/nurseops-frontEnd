import { apiInstance } from "@/services/axios";
import { Speciality, SpecialityFormData } from "@/modules/specialities/types";


export const specialityService = {
    /**
     * Obtiene la lista completa de especialidades
     */
    getAll: async (): Promise<Speciality[]> => {
        const response = await apiInstance.get<Speciality[]>('/specialities');
        return response.data;
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