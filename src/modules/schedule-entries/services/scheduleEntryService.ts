import { apiInstance } from "@/services/axios";
import { ScheduleEntry, ScheduleEntryFormData, ScheduleEntryFilters, ScheduleEntriesStats } from "../types";

export interface PaginatedScheduleEntries {
    data: ScheduleEntry[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const scheduleEntryService = {
    /**
     * GET /schedule-entries
     * - Con page/limit → respuesta paginada `{ data, meta }` (rápido).
     * - Sin page/limit → array plano (backward compatible con el calendario).
     */
    getAll: async (filters?: ScheduleEntryFilters): Promise<ScheduleEntry[] | PaginatedScheduleEntries> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.scheduleId) params.append("scheduleId", filters.scheduleId);
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.shiftId) params.append("shiftId", filters.shiftId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.search) params.append("search", filters.search);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const resp: any = await apiInstance.get("/schedule-entries", { params });
        // El ResponseInterceptor del backend promueve `meta` como hermano de `data`
        if (resp?.data && resp?.meta) {
            return { data: resp.data, meta: resp.meta };
        }
        return resp?.data || resp || [];
    },

    /**
     * GET /schedule-entries/stats — agregados de cobertura del conjunto
     * filtrado (total, por estado, emergencias, distribución por turno).
     * Mantiene los indicadores exactos cuando la lista va paginada.
     */
    getStats: async (filters?: ScheduleEntryFilters): Promise<ScheduleEntriesStats> => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.departmentId) params.append("departmentId", filters.departmentId);
        if (filters?.branchId) params.append("branchId", filters.branchId);
        if (filters?.scheduleId) params.append("scheduleId", filters.scheduleId);
        if (filters?.nurseId) params.append("nurseId", filters.nurseId);
        if (filters?.shiftId) params.append("shiftId", filters.shiftId);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.search) params.append("search", filters.search);
        const resp = await apiInstance.get("/schedule-entries/stats", { params });
        return ((resp as any)?.data || resp) as ScheduleEntriesStats;
    },

    create: async (data: ScheduleEntryFormData): Promise<ScheduleEntry> => {
        const resp = await apiInstance.post("/schedule-entries", data);
        return (resp as any)?.data || resp;
    },

    createBulk: async (payload: { date: string; scheduleId: string; entries: { nurseId: string; shiftId: string; notes?: string; shiftTemplateId: string }[] }): Promise<ScheduleEntry[]> => {
        const resp = await apiInstance.post("/schedule-entries/bulk", payload);
        return (resp as any)?.data || resp || [];
    },

    update: async (id: string, data: { shiftId?: string; nurseId?: string; departmentId?: string; notes?: string; status?: string; isEmergencyCoverage?: boolean; shiftTemplateId?: string }): Promise<ScheduleEntry> => {
        const resp = await apiInstance.patch(`/schedule-entries/${id}`, data);
        return (resp as any)?.data || resp;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/schedule-entries/${id}`);
    },

    /**
     * Valida una asignación contra el motor de reglas del backend.
     */
    validateAssignment: async (payload: { nurseId: string; shiftId: string; date: string; entryId?: string }): Promise<{ canAssign: boolean; errors: string[]; warnings: string[] }> => {
        const resp = await apiInstance.post("/schedule-validation/single-assignment", payload);
        const data = (resp as any)?.data || resp;
        return {
            canAssign: Boolean(data?.canAssign),
            errors: data?.errors || [],
            warnings: data?.warnings || [],
        };
    },
};