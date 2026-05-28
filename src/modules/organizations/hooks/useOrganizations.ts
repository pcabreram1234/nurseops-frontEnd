import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../services/organization.service";
import { OrganizationFormData } from "../types";
import { toast } from "sonner";

export function useOrganizations() {
    const queryClient = useQueryClient();

    // Buscar todas las organizaciones
    const organizationsQuery = useQuery({
        queryKey: ["organizations"],
        queryFn: organizationService.getAll,
    });

    // Mutación: Crear Organizacion
    const createMutation = useMutation({
        mutationFn: organizationService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            toast.success("Organización creada exitosamente");
        }
    });

    // Mutación: Actualizar Organizacion
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<OrganizationFormData> }) =>
            organizationService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            toast.success("Organización actualizada correctamente");
        }
    });

    // Mutación: Eliminar / Desactivar Organizacion
    const deleteMutation = useMutation({
        mutationFn: organizationService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            toast.success("Organización eliminada");
        }
    });

    return {
        organizations: organizationsQuery.data || [],
        isLoading: organizationsQuery.isLoading,
        isError: organizationsQuery.isError,
        createOrganization: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateOrganization: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteOrganization: deleteMutation.mutateAsync,
    };
}