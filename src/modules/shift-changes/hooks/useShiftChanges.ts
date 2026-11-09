import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftChangeService } from "../services/shiftChangeService";
import { ShiftChangeRequest, ShiftChangeFilters } from "../types";
import { toast } from "sonner";

export const SHIFT_CHANGES_KEY = "shift-change-requests";
export const SHIFT_CHANGES_RECEIVED_KEY = "shift-change-requests-received";
export const SHIFT_CHANGES_OPPORTUNITIES_KEY = "shift-change-opportunities";
export const SHIFT_CHANGES_STATS_KEY = "shift-change-stats";

export function useShiftChanges(filters?: ShiftChangeFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [SHIFT_CHANGES_KEY, filters],
        queryFn: () => shiftChangeService.getAll(filters),
        retry: 1,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_KEY] });
        queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_STATS_KEY] });
    };

    const createMutation = useMutation({
        mutationFn: shiftChangeService.create,
        onSuccess: () => {
            invalidate();
            toast.success("Solicitud de cambio creada");
        },
    });

    const respondMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { decision: "APPROVED" | "REJECTED"; comments?: string } }) =>
            shiftChangeService.respond(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Respuesta enviada");
        },
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { supervisorNotes?: string } }) =>
            shiftChangeService.approve(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Solicitud aprobada por supervisión");
        },
    });

    const applyMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { approverNotes?: string } }) =>
            shiftChangeService.apply(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Cambio de turno aplicado");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { reason: string } }) =>
            shiftChangeService.reject(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Solicitud rechazada");
        },
    });

    const cancelMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload?: { reason?: string } }) =>
            shiftChangeService.cancel(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Solicitud cancelada");
        },
    });

    const applyToCoverageMutation = useMutation({
        mutationFn: ({ requestId, payload }: { requestId: string; payload?: { comments?: string } }) =>
            shiftChangeService.applyToCoverage(requestId, payload),
        onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_OPPORTUNITIES_KEY] });
            toast.success("Postulación enviada");
        },
    });

    const selectCandidateMutation = useMutation({
        mutationFn: ({ requestId, payload }: { requestId: string; payload: { candidateNurseId: string; comments?: string } }) =>
            shiftChangeService.selectCandidate(requestId, payload),
        onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_OPPORTUNITIES_KEY] });
            toast.success("Candidata seleccionada");
        },
    });

    const withdrawApplicationMutation = useMutation({
        mutationFn: (applicationId: string) => shiftChangeService.withdrawApplication(applicationId),
        onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_OPPORTUNITIES_KEY] });
            toast.success("Postulación retirada");
        },
    });

    return {
        requests: query.data?.data || [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        error: query.error,
        createRequest: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        respondRequest: respondMutation.mutateAsync,
        isResponding: respondMutation.isPending,
        approveRequest: approveMutation.mutateAsync,
        isApproving: approveMutation.isPending,
        applyRequest: applyMutation.mutateAsync,
        isApplying: applyMutation.isPending,
        rejectRequest: rejectMutation.mutateAsync,
        isRejecting: rejectMutation.isPending,
        cancelRequest: cancelMutation.mutateAsync,
        isCancelling: cancelMutation.isPending,
        applyToCoverage: applyToCoverageMutation.mutateAsync,
        isApplyingToCoverage: applyToCoverageMutation.isPending,
        selectCandidate: selectCandidateMutation.mutateAsync,
        isSelectingCandidate: selectCandidateMutation.isPending,
        withdrawApplication: withdrawApplicationMutation.mutateAsync,
        isWithdrawing: withdrawApplicationMutation.isPending,
    };
}

export function useReceivedShiftChanges(filters?: ShiftChangeFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [SHIFT_CHANGES_RECEIVED_KEY, filters],
        queryFn: () => shiftChangeService.getReceived(filters),
        retry: 1,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [SHIFT_CHANGES_RECEIVED_KEY] });
    };

    const respondMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { decision: "APPROVED" | "REJECTED"; comments?: string } }) =>
            shiftChangeService.respond(id, payload),
        onSuccess: () => {
            invalidate();
            toast.success("Respuesta enviada");
        },
    });

    return {
        requests: query.data?.data || [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        error: query.error,
        respondRequest: respondMutation.mutateAsync,
        isResponding: respondMutation.isPending,
    };
}

export function useCoverageOpportunities(filters?: ShiftChangeFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [SHIFT_CHANGES_OPPORTUNITIES_KEY, filters],
        queryFn: () => shiftChangeService.getOpportunities(filters),
        retry: 1,
    });

    return {
        opportunities: query.data?.data || [],
        meta: query.data?.meta,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useShiftChangeStats() {
    const query = useQuery({
        queryKey: [SHIFT_CHANGES_STATS_KEY],
        queryFn: () => shiftChangeService.getStats(),
        retry: 1,
    });

    return {
        stats: query.data,
        isLoading: query.isLoading,
        error: query.error,
    };
}
