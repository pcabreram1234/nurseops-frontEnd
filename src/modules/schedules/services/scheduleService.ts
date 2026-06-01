// @/modules/schedules/services/scheduleService.ts
import { apiInstance } from "@/services/axios";
import { ScheduleEntry } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const scheduleService = {
    // Obtenemos los turnos en un rango de fechas. 
    // FullCalendar nos pasará 'start' y 'end' dinámicamente al cambiar de mes o semana.
    getEntriesByDateRange: async (startDate: string, endDate: string, departmentId?: string): Promise<ScheduleEntry[]> => {
        const params = new URLSearchParams({ startDate, endDate });
        if (departmentId) params.append("departmentId", departmentId);

        const response = await apiInstance.get<ScheduleEntry[]>(`${API_URL}/schedule-entries`, { params });
        return response.data;
    },

    // Obtenemos los departamentos para el filtro superior de la UI
    getDepartments: async (): Promise<{ id: string, name: string }[]> => {
        const response = await apiInstance.get(`${API_URL}/departments`);
        return response.data;
    },

    // Nuevo: Actualizar turno (para drag and drop)
    updateEntry: async (id: string, data: { date: string }): Promise<ScheduleEntry> => {
        const response = await apiInstance.put<ScheduleEntry>(`${API_URL}/schedule-entries/${id}`, data);
        return response.data;
    },

    validateAssignment: async (nurseId: string, shiftId: string, date: Date): Promise<any> => {
        const dateStr = date.toISOString();
        // Usamos apiInstance (axios) en lugar de fetch para consistencia con el proyecto
        const response = await apiInstance.get(`${API_URL}/schedule-validation/check`, {
            params: { nurseId, shiftId, date: dateStr }
        });
        return response.data; // Retorna el objeto { canAssign: boolean, errors: string[], monthlyHours: number }
    }
};