import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftTemplateService } from "../services/shiftTemplateService";
import { ShiftTemplateFormData } from "../types";
import { toast } from "sonner";

export function useShiftTemplates() {
    const queryClient = useQueryClient();

    const templatesQuery = useQuery({
        queryKey: ["shift-templates"],
        queryFn: shiftTemplateService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: shiftTemplateService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shift-templates"] });
            toast.success("Plantilla de turno creada exitosamente");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al crear la plantilla";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ShiftTemplateFormData> }) =>
            shiftTemplateService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shift-templates"] });
            toast.success("Plantilla de turno actualizada");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al actualizar la plantilla";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: shiftTemplateService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shift-templates"] });
            toast.success("Plantilla de turno eliminada");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al eliminar la plantilla";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        templates: templatesQuery.data || [],
        isLoading: templatesQuery.isLoading,
        createTemplate: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateTemplate: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteTemplate: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}