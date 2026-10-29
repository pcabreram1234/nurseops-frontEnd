import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restrictionService } from "../services/restrictionService";
import { RestrictionFilters, PaginatedRestrictions } from "../types";
import { toast } from "sonner";

export const useRestrictions = (filters?: RestrictionFilters) => {
    const queryClient = useQueryClient();

    // ==========================================
    // 1. QUERIES (Consultas de datos automáticas)
    // ==========================================
    const query = useQuery<PaginatedRestrictions>({
        queryKey: ["nurse-restrictions", filters?.search, filters?.nurseId, filters?.restrictionTypeId, filters?.page, filters?.limit],
        queryFn: () => restrictionService.getAll(filters),
        placeholderData: (prev) => prev,
    });

    const { data: types = [], isLoading: isLoadingTypes } = useQuery({
        queryKey: ["restriction-types"],
        queryFn: restrictionService.getTypes,
    });

    // ==========================================
    // 2. MUTATIONS (Modificaciones de datos)
    // ==========================================

    // 🌟 Mutación adaptada para Sincronización Masiva
    const saveRestrictionMutation = useMutation({
        mutationFn: async ({ data }: { data: any; id?: string }) => {
            return await restrictionService.sync(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nurse-restrictions"] });
            toast.success("Asignaciones de restricciones actualizadas correctamente 🎉");
        },
        onError: (error: any) => {
            console.error("Error al guardar la restricción masiva:", error);
            toast.error(error.response?.data?.message || "Error al procesar la asignación masiva.");
        }
    });

    // Eliminar (Revocar una asignación individual)
    const removeRestrictionMutation = useMutation({
        mutationFn: restrictionService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nurse-restrictions"] });
            toast.success("Restricción removida con éxito.");
        },
        onError: (error) => {
            console.error("Error al eliminar restricción:", error);
            toast.error("No se pudo remover la restricción médica.");
        }
    });

    // Mutaciones del Catálogo
    const saveTypeMutation = useMutation({
        mutationFn: async ({ data, id }: { data: any; id?: string }) => {
            if (id) return await restrictionService.updateType(id, data);
            return await restrictionService.createType(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["restriction-types"] });
            toast.success("Tipo de restricción guardado en el catálogo.");
        },
        onError: (error) => {
            console.error("Error catálogo:", error);
            toast.error("Ocurrió un error en el catálogo.");
        }
    });

    const removeTypeMutation = useMutation({
        mutationFn: restrictionService.deleteType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["restriction-types"] });
            toast.success("Tipo de restricción eliminado del catálogo.");
        },
        onError: (error) => {
            console.error("Error al eliminar del catálogo:", error);
            toast.error("No se pudo eliminar el tipo del catálogo.");
        }
    });

    const saveRestriction = async (data: any, id?: string) => {
        await saveRestrictionMutation.mutateAsync({ data, id });
    };

    const removeRestriction = async (id: string) => {
        if (!window.confirm("¿Está seguro de remover permanentemente esta restricción médica?")) return;
        await removeRestrictionMutation.mutateAsync(id);
    };

    const saveType = async (data: any, id?: string) => {
        await saveTypeMutation.mutateAsync({ data, id });
    };

    const removeType = async (id: string) => {
        if (!window.confirm("¿Está seguro de eliminar este Tipo de Restricción del sistema? Eliminarlo podría afectar el historial.")) return;
        await removeTypeMutation.mutateAsync(id);
    };

    const loading =
        query.isLoading ||
        isLoadingTypes ||
        saveRestrictionMutation.isPending ||
        removeRestrictionMutation.isPending ||
        saveTypeMutation.isPending ||
        removeTypeMutation.isPending;

    return {
        restrictions: query.data?.data || [],
        meta: query.data?.meta || null,
        types,
        loading,
        isFetching: query.isFetching,
        error: query.error,
        fetchRestrictions: () => queryClient.invalidateQueries({ queryKey: ["nurse-restrictions"] }),
        fetchTypes: () => queryClient.invalidateQueries({ queryKey: ["restriction-types"] }),
        saveRestriction,
        removeRestriction,
        saveType,
        removeType
    };
};