import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vacationService } from "../services/vacationService";
import { VacationFilters, VacationStatus, PaginatedVacations } from "../types";
import { toast } from "sonner";

export const VACATIONS_KEY = "vacations";

export function useVacations(filters?: VacationFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedVacations>({
        queryKey: [VACATIONS_KEY, filters?.nurseId, filters?.branchId, filters?.status, filters?.startDate, filters?.endDate, filters?.page, filters?.limit],
        queryFn: () => vacationService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [VACATIONS_KEY] });

    const createMutation = useMutation({
        mutationFn: vacationService.create,
        onSuccess: () => { invalidate(); toast.success("Solicitud de vacaciones creada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al crear la solicitud";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => vacationService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Solicitud actualizada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al actualizar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { status: VacationStatus; rejectionReason?: string; notes?: string } }) =>
            vacationService.approve(id, payload),
        onSuccess: (_d, vars) => {
            invalidate();
            toast.success(vars.payload.status === "REJECTED" ? "Vacación rechazada" : "Vacación aprobada");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al procesar la solicitud";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: vacationService.remove,
        onSuccess: () => { invalidate(); toast.success("Solicitud eliminada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al eliminar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        vacations: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createVacation: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateVacation: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        approveVacation: approveMutation.mutateAsync,
        isApproving: approveMutation.isPending,
        deleteVacation: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
