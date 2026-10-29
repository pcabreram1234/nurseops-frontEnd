import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertService, PaginatedAlerts } from "../services/alertService";
import { AlertFilters, OperationalAlert, ResolveAlertPayload, EscalateAlertPayload, AlertStats } from "../types";
import { toast } from "sonner";

export const ALERTS_KEY = "operational-alerts";

export function useAlerts(filters?: AlertFilters) {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [ALERTS_KEY] });

    const handleError = (e: any, fallback: string) => {
        const msg = e?.response?.data?.message || e?.message || fallback;
        toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    };

    // Lista paginada con placeholderData (sin flash al paginar/filtrar)
    const query = useQuery({
        queryKey: [ALERTS_KEY, filters?.departmentId, filters?.status, filters?.severity,
            filters?.search, filters?.page, filters?.limit],
        queryFn: async (): Promise<{ alerts: OperationalAlert[]; meta: PaginatedAlerts["meta"] | null }> => {
            const resp = await alertService.getAll(filters);
            if (Array.isArray(resp)) return { alerts: resp, meta: null };
            return { alerts: resp.data, meta: resp.meta };
        },
        placeholderData: (prev) => prev,
        retry: 1,
    });

    // Agregados (total, abiertas, críticas...) — independientes de la paginación
    const statsQuery = useQuery({
        queryKey: [ALERTS_KEY, "stats", filters?.departmentId, filters?.severity, filters?.search],
        queryFn: () => alertService.getStats(filters),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const resolveMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ResolveAlertPayload }) => alertService.resolve(id, payload),
        onSuccess: () => { invalidate(); toast.success("Alerta resuelta correctamente"); },
        onError: (e) => handleError(e, "Error al resolver la alerta"),
    });

    const escalateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: EscalateAlertPayload }) => alertService.escalate(id, payload),
        onSuccess: () => { invalidate(); toast.success("Alerta escalada a severidad crítica"); },
        onError: (e) => handleError(e, "Error al escalar la alerta"),
    });

    return {
        alerts: query.data?.alerts || [],
        meta: query.data?.meta || null,
        stats: (statsQuery.data ?? null) as AlertStats | null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        resolveAlert: resolveMutation.mutateAsync,
        isResolving: resolveMutation.isPending,
        escalateAlert: escalateMutation.mutateAsync,
        isEscalating: escalateMutation.isPending,
    };
}