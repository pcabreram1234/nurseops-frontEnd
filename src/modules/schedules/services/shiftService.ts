// @/modules/schedules/services/shiftService.ts
import { apiInstance } from "@/services/axios";
import { Shift } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const shiftService = {
    /**
     * Obtiene los turnos instanciados por el motor filtrados por un día o rango específico.
     * Es ideal pasarle la fecha seleccionada en el calendario para optimizar la carga.
     */
    getShiftsByDateRange: async (startTime: string, endTime: string, departmentId?: string): Promise<Shift[]> => {
        const params = new URLSearchParams({ startTime, endTime });
        if (departmentId) params.append("departmentId", departmentId);

        const response = await apiInstance.get<Shift[]>(`${API_URL}/shifts`, { params });
        return response.data;
    },

    /**
     * Alternativo: Obtener los shifts de un día específico de manera rápida
     */
    getShiftsByDay: async (dateStr: string, departmentId?: string): Promise<Shift[]> => {
        // "2026-06-01" -> cubre desde las 00:00:00 hasta las 23:59:59
        const startTime = `${dateStr}T00:00:00.000Z`;
        const endTime = `${dateStr}T23:59:59.999Z`;
        return shiftService.getShiftsByDateRange(startTime, endTime, departmentId);
    }
};