// 📄 @/modules/schedules/hooks/useScheduleEntries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService"; // 🌟 Importamos tu servicio
import { schedulePublicationService } from "../services/schedulePublicationService";
import { GenerateSchedulePayload } from "../services/scheduleService";
import { toast } from "sonner"

interface UpdateEntryPayload {
  id: string;
  shiftId: string;
  nurseId: string;
  departmentId: string;
}

interface CreateEntriesPayload {
  date: string;
  scheduleId: string;
  entries: Array<{
    nurseId: string;
    shiftId: string;
    notes?: string;
    shiftTemplateId?: string
  }>;
}


// 🟢 NUEVA INTERFAZ: Reflejo exacto del PublishScheduleDto de tu Backend
export interface PublishSchedulePayload {
  scheduleId: string;
  notifyStaff?: boolean;
  createVersionSnapshot?: boolean;
  forcePublish?: boolean;
  validateBeforePublish?: boolean;
  sendPushNotifications?: NotificationValidationObject;
  sendEmails?: boolean;
  publicationNotes?: string;
}

export interface NotificationValidationObject {
  publish: boolean
  sendPushNotifications: boolean
  sendEmails: boolean
}


export const useScheduleEntries = () => {
  const queryClient = useQueryClient();

  // 🌟 MUTACIÓN 1: Actualizar asignación individual (Inline o Drag & Drop)
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, shiftId, nurseId, departmentId }: UpdateEntryPayload) => {
      try {
        // 🚀 Uso del servicio centralizado
        return await scheduleService.updateEntry(id, { shiftId, nurseId, departmentId });
      } catch (error: any) {
        const serverMessage = error?.response?.data?.message || "Error al actualizar la asignación.";
        toast.error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage)
        throw new Error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
      }
    },
    onSuccess: () => {
      // 🔄 Limpieza total de historial y caché para forzar redibujado instantáneo
      queryClient.resetQueries({ queryKey: ["global-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["global-calendar"] });
      toast.success("Turno actualizado")
    },
  });

  // 🌟 MUTACIÓN 2: Guardar asignaciones masivas (Bulk / Co-Piloto)
  const createEntriesMutation = useMutation({
    mutationFn: async (payload: CreateEntriesPayload) => {
      try {
        // 🚀 Uso del servicio centralizado
        return await scheduleService.createBulkEntries(payload);
      } catch (error: any) {
        const serverMessage = error?.response?.data?.message || "Error al guardar las asignaciones masivas.";
        Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage
        toast.error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage)
        throw new Error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
      }
    },
    onSuccess: () => {
      // 🔄 Resetea el historial del calendario para pintar los múltiples enfermeros agregados
      queryClient.resetQueries({ queryKey: ["global-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["global-calendar"] });
      toast.success("Turnos registrados")
    },
  });

  // 🌟 MUTACIÓN 3: Eliminar asignación/turno por completo
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // 🚀 Uso del servicio centralizado
        return await scheduleService.deleteEntry(id);
      } catch (error: any) {
        const serverMessage = error?.response?.data?.message || "Error al eliminar la asignación.";
        toast.error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage)
        throw new Error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
      }
    },
    onSuccess: () => {
      // 🔄 Remueve el cuadro del FullCalendar de inmediato al limpiar la caché vieja
      queryClient.resetQueries({ queryKey: ["global-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["global-calendar"] });
      toast.success("Turno eliminado")
    },
  });

  // 🌟 MUTACIÓN 4 (NUEVA): Publicación del Horario usando el endpoint independiente
  const publishScheduleMutation = useMutation({
    mutationFn: async (payload: PublishSchedulePayload) => {
      try {

        // 🚀 Petición directa al controlador bajo la ruta v1/schedules-publication/:id/publish
        // Se envía el scheduleId en el Body tal como exige el @Body() dto: PublishScheduleDto
        return await schedulePublicationService.publish(payload)
      } catch (error: any) {
        const serverMessage = error?.response?.data?.message || "Error al intentar publicar el horario.";
        toast.error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage)
        throw new Error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
      }
    },
    onSuccess: () => {
      // 🔄 Reseteamos las consultas del calendario global para que los estados cambien de DRAFT a PUBLISHED en la UI
      queryClient.resetQueries({ queryKey: ["global-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["global-calendar"] });
    },
  });


  // Dentro de tu hook de mutaciones:
  const generateEngineMutation = useMutation({
    mutationFn: async (payload: GenerateSchedulePayload) => {
      try {
        return await scheduleService.generateAutomatedSchedule(payload);
      } catch (error: any) {
        // Extrae el mensaje detallado o el array de conflictos devueltos por NestJS
        const serverMessage = error?.response?.data?.message || "Error al compilar el Schedule Engine.";
        throw new Error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Borrador generado con éxito.");
      // Refresca el calendario global instantáneamente para pintar el nuevo borrador simulado
      queryClient.invalidateQueries({ queryKey: ["global-calendar"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return {
    updateEntry: updateEntryMutation.mutateAsync,
    isUpdating: updateEntryMutation.isPending,
    updateError: updateEntryMutation.error,

    createEntries: createEntriesMutation.mutateAsync,
    isCreating: createEntriesMutation.isPending,
    createError: createEntriesMutation.error,

    deleteEntry: deleteEntryMutation.mutateAsync,
    isDeleting: deleteEntryMutation.isPending,
    deleteError: deleteEntryMutation.error,

    // 🚀 EXPOSICIÓN DE LA NUEVA MUTACIÓN DE PUBLICACIÓN
    publishSchedule: publishScheduleMutation.mutateAsync,
    isPublishing: publishScheduleMutation.isPending,
    publishError: publishScheduleMutation.error,

    genrateSchedule: generateEngineMutation.mutateAsync,
    isGenerating: generateEngineMutation.isPending,
    generateError: generateEngineMutation.error
  };
};