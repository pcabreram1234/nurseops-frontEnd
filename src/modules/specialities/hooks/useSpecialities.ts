import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { specialityService } from "@/modules/specialities/services/specialityService";
import { Speciality, SpecialityFormData, SpecialityFilters, PaginatedSpecialities } from "@/modules/specialities/types";
import { toast } from "sonner";

export const useSpecialities = (filters?: SpecialityFilters) => {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedSpecialities>({
        queryKey: ["specialities", filters?.search, filters?.page, filters?.limit],
        queryFn: () => specialityService.getAll(filters),
        placeholderData: (prev) => prev,
    });

    const createMutation = useMutation({
        mutationFn: specialityService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad Creada");
        },
        onError: (error) => {
            console.error("Error al crear la especialidad a través del servicio:", error);
            toast.error("Error al crear la especialidad");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: SpecialityFormData }) =>
            specialityService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad actualizada");
        },
        onError: (error) => {
            console.error("Error al actualizar la especialidad:", error);
            toast.error("Error al actualizar la especialidad");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: specialityService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad eliminada");
        },
        onError: (error) => {
            console.error("Error al eliminar la especialidad:", error);
            toast.error("Error al eliminar la especialidad");
        },
    });

    return {
        specialities: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        createSpeciality: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateSpeciality: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteSpeciality: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        refetch: query.refetch,
    };
};