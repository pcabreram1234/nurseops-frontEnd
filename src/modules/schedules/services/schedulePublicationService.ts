// 📄 @/modules/schedules/services/schedulePublicationService.ts
import { apiInstance } from "@/services/axios"; // Ajusta la ruta según la instancia de tu Axios global
import { PublishSchedulePayload } from "../hooks/useScheduleEntries";

export const schedulePublicationService = {
  /**
   * Envía la solicitud al backend para pasar el estado de un horario de DRAFT a PUBLISHED.
   * Ejecuta opcionalmente snapshots de versiones, validaciones de reglas y cola de notificaciones.
   * 
   * @param payload Datos estructurados que representan al PublishScheduleDto del Backend
   * @returns Promesa con el objeto Schedule actualizado { id, status, publishedAt, ... }
   */
  publish: async (payload: PublishSchedulePayload) => {
    const { scheduleId, ...dtoData } = payload;

    // Conectamos con el endpoint PATCH v1/schedules-publication/:id/publish
    const { data } = await apiInstance.patch(
      `/schedules-publication/${scheduleId}/publish`,
      {
        scheduleId,
        ...dtoData,
      }
    );

    return data;
  },
};