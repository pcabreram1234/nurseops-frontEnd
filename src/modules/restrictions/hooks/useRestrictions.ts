import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restrictionService } from "../services/restrictionService";
import { toast } from "sonner"; 

export const useRestrictions = () => {
  const queryClient = useQueryClient();

  // ==========================================\n  // 1. QUERIES (Consultas de datos automáticas)\n  // ==========================================
  const { data: restrictions = [], isLoading: isLoadingRestrictions } = useQuery({
    queryKey: ["nurse-restrictions"],
    queryFn: restrictionService.getAll,
  });

  const { data: types = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ["restriction-types"],
    queryFn: restrictionService.getTypes,
  });

  // ==========================================\n  // 2. MUTATIONS (Modificaciones de datos)\n  // ==========================================

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
    isLoadingRestrictions || 
    isLoadingTypes || 
    saveRestrictionMutation.isPending || 
    removeRestrictionMutation.isPending || 
    saveTypeMutation.isPending || 
    removeTypeMutation.isPending;

  return {
    restrictions, 
    types, 
    loading,
    fetchRestrictions: () => queryClient.invalidateQueries({ queryKey: ["nurse-restrictions"] }),
    fetchTypes: () => queryClient.invalidateQueries({ queryKey: ["restriction-types"] }),
    saveRestriction, 
    removeRestriction,
    saveType, 
    removeType 
  };
};