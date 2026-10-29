import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService } from "../services/absenceService";
import { AbsenceFilters, PaginatedAbsences } from "../types";
import { toast } from "sonner";

export const ABSENCES_KEY = "absences";

export function useAbsences(filters?: AbsenceFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedAbsences>({
        queryKey: [ABSENCES_KEY, filters?.nurseId, filters?.branchId, filters?.type, filters?.status, filters?.startDate, filters?.endDate, filters?.page, filters?.limit],
        queryFn: () => absenceService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const createMutation = useMutation({
        mutationFn: absenceService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ABSENCES_KEY] });
            toast.success("Ausencia registrada exitosamente");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al registrar la ausencia";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => absenceService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ABSENCES_KEY] });
            toast.success("Ausencia actualizada");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al actualizar la ausencia";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        absences: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createAbsence: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateAbsence: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
