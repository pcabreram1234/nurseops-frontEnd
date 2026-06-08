// 📄 @/modules/schedules/services/scheduleService.ts
import { apiInstance } from "@/services/axios";
import { ScheduleEntry } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// 🟢 NUEVA INTERFAZ: Es el reflejo idéntico del GenerateScheduleDto de NestJS
export interface GenerateSchedulePayload {
    departmentId: string;
    month: number; // Número entre 1 y 12
    year: number;  // Año de planificación (Ej: 2026)
}

// 🟢 NUEVA INTERFAZ: Respuesta estandarizada del Backend tras compilar el Engine
export interface GenerateScheduleResponse {
    success: boolean;
    message: string;
    scheduleId: string;
}

export const scheduleService = {
    getEntriesByDateRange: async (startDate: string, endDate: string, departmentId?: string): Promise<ScheduleEntry[]> => {
        const params = new URLSearchParams({ startDate, endDate });
        if (departmentId) params.append("departmentId", departmentId);
        const response = await apiInstance.get<ScheduleEntry[]>(`${API_URL}/schedule-entries`, { params });
        return response.data;
    },

    getDepartments: async (): Promise<{ id: string, name: string }[]> => {
        const response = await apiInstance.get(`${API_URL}/departments`);
        return response.data;
    },

    validateAssignment: async (nurseId: string, shiftId: string, date: Date): Promise<any> => {
        const response = await apiInstance.get(`${API_URL}/schedule-validation/check`, {
            params: { nurseId, shiftId, date: date.toISOString() }
        });
        return response.data;
    },

    updateEntry: async (id: string, data: { shiftId: string; nurseId: string; departmentId: string }): Promise<ScheduleEntry> => {
        const response = await apiInstance.patch<ScheduleEntry>(`${API_URL}/schedule-entries/${id}`, data);
        return response.data;
    },

    createBulkEntries: async (payload: any): Promise<any> => {
        const response = await apiInstance.post(`${API_URL}/schedule-entries/bulk`, payload);
        return response.data;
    },

    deleteEntry: async (id: string): Promise<any> => {
        const response = await apiInstance.delete(`${API_URL}/schedule-entries/${id}`);
        return response.data;
    },

    /*
    |--------------------------------------------------------------------------
    | 🟢 NUEVA FUNCIÓN: DISPARADOR AUTOMÁTICO DEL SCHEDULE ENGINE
    |--------------------------------------------------------------------------
    | Golpea la ruta POST v1/schedules/generate enviando el departamento,
    | el mes y el año requeridos para la optimización algorítmica.
    */
    generateAutomatedSchedule: async (payload: GenerateSchedulePayload): Promise<GenerateScheduleResponse> => {
        // Apunta al endpoint controlado en NestJS bajo el prefijo general de schedules
        const response = await apiInstance.post<GenerateScheduleResponse>(
            `${API_URL}/schedules/generate`, 
            payload
        );
        return response.data;
    }
};