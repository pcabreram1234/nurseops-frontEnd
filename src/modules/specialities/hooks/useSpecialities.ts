import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { specialityService } from "@/modules/specialities/services/specialityService";
import { Speciality, SpecialityFormData } from "@/modules/specialities/types";
import { toast } from "sonner";

export const useSpecialities = () => {
    const queryClient = useQueryClient();

    // 1. Query para listar especialidades utilizando el servicio
    const {
        data: specialities = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<Speciality[]>({
        queryKey: ["specialities"],
        queryFn: specialityService.getAll,
    });

    // 2. Mutation para crear utilizando el servicio
    const createMutation = useMutation({
        mutationFn: specialityService.create,
        onSuccess: () => {
            // Invalida la caché para forzar que la tabla se actualice sola
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad Creada")

        },
        onError: (error) => {
            console.error("Error al crear la especialidad a través del servicio:", error);
        },
    });

    // 3. Mutation para actualizar utilizando el servicio
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: SpecialityFormData }) =>
            specialityService.update(id, data),
        onSuccess: () => {
            // Invalida la caché para reflejar los cambios editados en la UI
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad actualizada")
        },
        onError: (error) => {
            console.error("Error al actualizar la especialidad a través del servicio:", error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: specialityService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["specialities"] });
            toast.success("Especialidad borrada")
        }
    });

    // Retornamos la misma interfaz para mantener compatibilidad con tu vista (page.tsx)
    return {
        specialities,
        isLoading: isLoading || createMutation.isPending || updateMutation.isPending,
        isError,
        createSpeciality: createMutation.mutateAsync,
        updateSpeciality: async (id: string, data: SpecialityFormData) => {
            return updateMutation.mutateAsync({ id, data });
        },
        deleteSpeciality: deleteMutation.mutateAsync,
        refetch,
    };
};