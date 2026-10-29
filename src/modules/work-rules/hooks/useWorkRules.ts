import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workRuleService } from "../services/workRuleService";
import { toast } from "sonner";
import { WorkRuleFilters, PaginatedWorkRules } from "../types";

export const WORK_RULES_KEY = "work-rules";
export const RULE_GROUPS_KEY = "rule-groups";

export function useWorkRules(filters?: WorkRuleFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedWorkRules>({
        queryKey: [WORK_RULES_KEY, filters?.search, filters?.isActive, filters?.type, filters?.code, filters?.page, filters?.limit],
        queryFn: () => workRuleService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [WORK_RULES_KEY] });

    const handleError = (error: any, fallback: string) => {
        const msg = error?.response?.data?.message || error?.message || fallback;
        toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    };

    const createMutation = useMutation({
        mutationFn: workRuleService.create,
        onSuccess: () => { invalidate(); toast.success("Regla creada exitosamente"); },
        onError: (e) => handleError(e, "Error al crear la regla"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => workRuleService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Regla actualizada"); },
        onError: (e) => handleError(e, "Error al actualizar la regla"),
    });

    const deleteMutation = useMutation({
        mutationFn: workRuleService.remove,
        onSuccess: () => { invalidate(); toast.success("Regla eliminada"); },
        onError: (e) => handleError(e, "Error al eliminar la regla"),
    });

    // Condiciones
    const createConditionMutation = useMutation({
        mutationFn: workRuleService.createCondition,
        onSuccess: () => { invalidate(); toast.success("Condición agregada"); },
        onError: (e) => handleError(e, "Error al crear la condición"),
    });

    const updateConditionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => workRuleService.updateCondition(id, data),
        onSuccess: () => { invalidate(); toast.success("Condición actualizada"); },
        onError: (e) => handleError(e, "Error al actualizar la condición"),
    });

    const deleteConditionMutation = useMutation({
        mutationFn: workRuleService.removeCondition,
        onSuccess: () => { invalidate(); toast.success("Condición eliminada"); },
        onError: (e) => handleError(e, "Error al eliminar la condición"),
    });

    // Acciones
    const createActionMutation = useMutation({
        mutationFn: workRuleService.createAction,
        onSuccess: () => { invalidate(); toast.success("Acción agregada"); },
        onError: (e) => handleError(e, "Error al crear la acción"),
    });

    const updateActionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => workRuleService.updateAction(id, data),
        onSuccess: () => { invalidate(); toast.success("Acción actualizada"); },
        onError: (e) => handleError(e, "Error al actualizar la acción"),
    });

    const deleteActionMutation = useMutation({
        mutationFn: workRuleService.removeAction,
        onSuccess: () => { invalidate(); toast.success("Acción eliminada"); },
        onError: (e) => handleError(e, "Error al eliminar la acción"),
    });

    return {
        rules: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
        createRule: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateRule: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteRule: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        createCondition: createConditionMutation.mutateAsync,
        isCreatingCondition: createConditionMutation.isPending,
        updateCondition: updateConditionMutation.mutateAsync,
        isUpdatingCondition: updateConditionMutation.isPending,
        deleteCondition: deleteConditionMutation.mutateAsync,
        createAction: createActionMutation.mutateAsync,
        isCreatingAction: createActionMutation.isPending,
        updateAction: updateActionMutation.mutateAsync,
        isUpdatingAction: updateActionMutation.isPending,
        deleteAction: deleteActionMutation.mutateAsync,
    };
}

export function useRuleGroups() {
    const query = useQuery({
        queryKey: [RULE_GROUPS_KEY],
        queryFn: workRuleService.getGroups,
        retry: 1,
    });

    return {
        groups: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    };
}
