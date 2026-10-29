import { apiInstance } from "@/services/axios";
import { ScheduleEntry, ScheduleEntryFormData, ScheduleEntryFilters, PaginatedScheduleEntries } from "../types";

export const scheduleService = {
    getAll: async (filters?: ScheduleEntryFilters): Promise<PaginatedScheduleEntries> => {
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
        // apiInstance interceptor returns response.data directly
        const result = await apiInstance.get("/schedule-entries", { params });
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
            return result as unknown as PaginatedScheduleEntries;
        }
        return { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } };
    },

    create: async (data: ScheduleEntryFormData): Promise<ScheduleEntry> => {
        const resp = await apiInstance.post("/schedule-entries", data);
        return (resp as any)?.data || resp;
    },

    update: async (id: string, data: { shiftId?: string; nurseId?: string; departmentId?: string; notes?: string; isEmergencyCoverage?: boolean }): Promise<ScheduleEntry> => {
        const resp = await apiInstance.patch(`/schedule-entries/${id}`, data);
        return (resp as any)?.data || resp;
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`/schedule-entries/${id}`);
    },
};