import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nurseService } from "../services/nurseService";
import { Nurse } from "../types";
import { toast } from "sonner";

interface MutationParams {
  data: any;
  nurseToEdit?: Nurse | null;
}

export const useNurseMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, nurseToEdit }: MutationParams) => {
      if (nurseToEdit) {
        const nurseId = nurseToEdit.id;
        const profileId = nurseToEdit.nurseProfiles?.[0]?.id;
        // 🌟 Pasamos el arreglo de restricciones existentes para que el servicio haga el Diff
        const existingRestrictions = nurseToEdit.nurseRestrictions || [];
        
        return await nurseService.update(nurseId, profileId, data, existingRestrictions);
      } else {
        return await nurseService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
      queryClient.invalidateQueries({ queryKey: ["form-users"] });
      
      toast.success("Ficha de enfermería guardada correctamente 🎉");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any) => {
      console.error("Error guardando la ficha:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error inesperado al procesar la ficha.");
    }
  });
};