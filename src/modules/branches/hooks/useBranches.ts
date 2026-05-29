import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "../services/branch.services";
import { BranchFormData } from "../types";
import { toast } from "sonner";

export function useBranches() {
    const queryClient = useQueryClient();

    const branchesQuery = useQuery({
        queryKey: ["branches"],
        queryFn: branchService.getAll
    });

    const createMutation = useMutation({
        mutationFn: branchService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            toast.success("Sucursal registrada exitosamente");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: BranchFormData }) =>
            branchService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            toast.success("Estructura de la sede actualizada con éxito");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: branchService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
            toast.success("Sucursal eliminada del sistema");
        }
    });

    return {
        branches: branchesQuery.data || [],
        isLoading: branchesQuery.isLoading,
        createBranch: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateBranch: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteBranch: deleteMutation.mutateAsync
    };
}