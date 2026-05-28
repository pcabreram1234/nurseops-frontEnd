import { apiInstance } from '@/services/axios';
import { ScheduleSummary, ScheduleSlot } from '@/modules/schedules/types/index';

export const scheduleService = {
    // Obtener el listado de cronogramas generados
    getSchedules: async (departmentId: string): Promise<ScheduleSummary[]> => {
        const { data } = await apiInstance.get(`/schedules?departmentId=${departmentId}`);
        return data;
    },

    // Obtener las ranuras/celdas de un cronograma específico para el tablero
    getScheduleBoard: async (scheduleId: string): Promise<ScheduleSlot[]> => {
        const { data } = await apiInstance.get(`/schedules/${scheduleId}/board`);
        return data;
    },

    // Disparar el motor de asignación automática (POST)
    generateSchedule: async (payload: { departmentId: string; targetDate: string }) => {
        const { data } = await apiInstance.post('/schedules/generate', payload);
        return data;
    }
};