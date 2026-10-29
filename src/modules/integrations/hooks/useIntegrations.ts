import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "../services/integrationService";
import { toast } from "sonner";
import { IntegrationFilters, PaginatedIntegrations } from "../types";

export const INTEGRATIONS_KEY = "integrations";
export const WEBHOOK_LOGS_KEY = "webhook-logs";

export function useIntegrations(filters?: IntegrationFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedIntegrations>({
        queryKey: [INTEGRATIONS_KEY, filters?.search, filters?.provider, filters?.name, filters?.page, filters?.limit],
        queryFn: () => integrationService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });

    const handleError = (e: any, fb: string) => {
        const msg = e?.response?.data?.message || e?.message || fb;
        toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    };

    const createMutation = useMutation({
        mutationFn: integrationService.create,
        onSuccess: () => { invalidate(); toast.success("Integración creada"); },
        onError: (e) => handleError(e, "Error al crear la integración"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => integrationService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Integración actualizada"); },
        onError: (e) => handleError(e, "Error al actualizar la integración"),
    });

    const deleteMutation = useMutation({
        mutationFn: integrationService.remove,
        onSuccess: () => { invalidate(); toast.success("Integración eliminada"); },
        onError: (e) => handleError(e, "Error al eliminar la integración"),
    });

    return {
        integrations: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createIntegration: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateIntegration: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteIntegration: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}

export function useWebhookLogs(integrationId?: string) {
    const query = useQuery({
        queryKey: [WEBHOOK_LOGS_KEY, integrationId || "all"],
        queryFn: () => integrationService.getWebhookLogs(integrationId),
        retry: 1,
    });

    return {
        logs: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
