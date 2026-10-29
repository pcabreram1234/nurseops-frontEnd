import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftChangeService } from "../services/shiftChangeService";
import { ShiftChangeRequest, ShiftChangeFilters } from "../types";
import { toast } from "sonner";

export const SHIFT_CHANGES_KEY = "shift-change-requests";

export function useShiftChanges(filters?: ShiftChangeFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [SHIFT_CHANGES_KEY, filters?.status, filters?.requesterId, filters?.receiverId, filters?.search, filters?.page, filters?.limit],
        queryFn: () => shiftChangeService.getAll(filters),
        retry: 1,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_KEY] });

    const createMutation = useMutation({
        mutationFn: shiftChangeService.create,
        onSuccess: () => { invalidate(); toast.success("Solicitud de cambio creada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al crear solicitud";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { supervisorNotes?: string } }) => shiftChangeService.approve(id, payload),
        onSuccess: () => { invalidate(); toast.success("Solicitud aprobada"); },
        onError: (e: any) => {
            const msg = e?.response?.data?.message || e?.message || "Error al aprobar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { reason: string } }) => shiftChangeService.reject(id, payload),
        onSuccess: () => { invalidate(); toast.success("Solicitud rechazada"); },
        onError: (e: any) => {
            const msg = e?.response?.data?.message || e?.message || "Error al rechazar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const cancelMutation = useMutation({
        mutationFn: shiftChangeService.cancel,
        onSuccess: () => { invalidate(); toast.success("Solicitud cancelada"); },
        onError: (e: any) => {
            const msg = e?.response?.data?.message || e?.message || "Error al cancelar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        requests: query.data?.data || [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        error: query.error,
        createRequest: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        approveRequest: approveMutation.mutateAsync,
        isApproving: approveMutation.isPending,
        rejectRequest: rejectMutation.mutateAsync,
        isRejecting: rejectMutation.isPending,
        cancelRequest: cancelMutation.mutateAsync,
        isCancelling: cancelMutation.isPending,
    };
}