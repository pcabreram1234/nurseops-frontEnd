"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "@/modules/schedule-entries/services/scheduleService";
import { scheduleEntryService } from "@/modules/schedule-entries/services/scheduleEntryService";
import { ScheduleEntry, ScheduleEntryFormData, ScheduleEntryFilters } from "@/modules/schedule-entries/types";
import { toast } from "sonner";

export const SCHEDULE_ENTRIES_KEY = "schedules";

export function useSchedules(filters?: ScheduleEntryFilters) {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [SCHEDULE_ENTRIES_KEY] });

    const query = useQuery({
        queryKey: [
            SCHEDULE_ENTRIES_KEY,
            filters?.startDate,
            filters?.endDate,
            filters?.departmentId,
            filters?.branchId,
            filters?.scheduleId,
            filters?.nurseId,
            filters?.shiftId,
            filters?.status,
            filters?.search,
            filters?.page,
            filters?.limit,
        ],
        queryFn: () => scheduleService.getAll(filters),
        placeholderData: (prev: any) => prev,
        retry: 1,
    });

    const createMutation = useMutation({
        mutationFn: scheduleService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SCHEDULE_ENTRIES_KEY] });
            toast.success("Asignación creada exitosamente");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al crear la asignación";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => scheduleService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Asignación actualizada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al actualizar la asignación";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => scheduleService.delete(id),
        onSuccess: () => { invalidate(); toast.success("Asignación eliminada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al eliminar la asignación";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        entries: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createEntry: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateEntry: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteEntry: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}

/**
 * Agregados de cobertura del conjunto filtrado (server-side). Se calculan
 * sobre TODAS las asignaciones que cumplen los filtros, no solo la página
 * visible, para que los indicadores y la distribución por turno sean exactos.
 */
export function useScheduleEntryStats(filters?: ScheduleEntryFilters) {
    const query = useQuery({
        queryKey: [
            SCHEDULE_ENTRIES_KEY,
            "stats",
            filters?.startDate,
            filters?.endDate,
            filters?.departmentId,
            filters?.branchId,
            filters?.scheduleId,
            filters?.nurseId,
            filters?.shiftId,
            filters?.status,
            filters?.search,
        ],
        queryFn: () => scheduleEntryService.getStats(filters),
        placeholderData: (prev: any) => prev,
        retry: 1,
    });

    return {
        stats: query.data ?? null,
        isLoadingStats: query.isLoading,
        isFetchingStats: query.isFetching,
        statsError: query.error,
    };
}