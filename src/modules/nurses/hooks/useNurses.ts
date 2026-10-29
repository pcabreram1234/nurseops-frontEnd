import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nurseService } from "../services/nurseService";
import { NurseFilters, PaginatedNurses } from "../types";
import { toast } from "sonner";

export const useNurses = (filters?: NurseFilters) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["nurses", filters?.search, filters?.status, filters?.departmentId, filters?.branchId, filters?.contractType, filters?.page, filters?.limit],
        queryFn: () => nurseService.getAll(filters),
        placeholderData: (prev: PaginatedNurses | undefined) => prev,
    });

    const createMutation = useMutation({
        mutationFn: nurseService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nurses"] });
            toast.success("Enfermera creada exitosamente");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al crear la enfermera";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: nurseService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nurses"] });
            toast.success("Enfermera eliminada");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al eliminar la enfermera";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        }
    });

    return {
        nurses: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createNurse: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        deleteNurse: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};