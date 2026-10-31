import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vacationPolicyService } from "../services/vacationPolicyService";
import { VacationPolicy, VacationPolicyFormData, NurseVacationProfile, VacationBalance } from "../types";

const POLICIES_KEY = "vacation-policies";
const PROFILES_KEY = "nurse-vacation-profiles";
const BALANCE_KEY = "vacation-balance";

export function useVacationPolicies(filters?: { status?: string; regimeCode?: string }) {
    const queryClient = useQueryClient();

    const query = useQuery<VacationPolicy[]>({
        queryKey: [POLICIES_KEY, filters?.status, filters?.regimeCode],
        queryFn: () => vacationPolicyService.getAll(filters),
        staleTime: 60 * 1000,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });

    const createMutation = useMutation({
        mutationFn: vacationPolicyService.create,
        onSuccess: () => { invalidate(); toast.success("Política de vacaciones creada exitosamente"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al crear la política"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<VacationPolicyFormData> }) =>
            vacationPolicyService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Política actualizada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al actualizar la política"),
    });

    const activateMutation = useMutation({
        mutationFn: vacationPolicyService.activate,
        onSuccess: () => { invalidate(); toast.success("Política activada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al activar la política"),
    });

    const archiveMutation = useMutation({
        mutationFn: vacationPolicyService.archive,
        onSuccess: () => { invalidate(); toast.success("Política archivada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al archivar la política"),
    });

    const assignMutation = useMutation({
        mutationFn: ({ policyId, data }: { policyId: string; data: any }) =>
            vacationPolicyService.assignToNurse(policyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROFILES_KEY] });
            queryClient.invalidateQueries({ queryKey: [BALANCE_KEY] });
            toast.success("Perfil de vacaciones asignado correctamente");
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al asignar el perfil"),
    });

    return {
        policies: query.data || [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createPolicy: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updatePolicy: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        activatePolicy: activateMutation.mutateAsync,
        archivePolicy: archiveMutation.mutateAsync,
        assignVacationPolicy: (policyId: string, data: any) => assignMutation.mutateAsync({ policyId, data }),
        isAssigning: assignMutation.isPending,
    };
}

export function useNurseVacationProfiles(nurseId: string) {
    return useQuery<NurseVacationProfile[]>({
        queryKey: [PROFILES_KEY, nurseId],
        queryFn: () => vacationPolicyService.getNurseProfiles(nurseId),
        enabled: !!nurseId,
    });
}

export function useVacationBalance(nurseId: string, periodStart?: string) {
    return useQuery<VacationBalance>({
        queryKey: [BALANCE_KEY, nurseId, periodStart],
        queryFn: () => vacationPolicyService.getBalance(nurseId, periodStart),
        enabled: !!nurseId,
    });
}
