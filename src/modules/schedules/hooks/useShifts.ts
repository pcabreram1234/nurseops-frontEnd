// @/modules/schedules/hooks/useShifts.ts
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { shiftService } from "../services/shiftService";

export const useShifts = (initialDepartmentId?: string) => {
    // Controlamos de forma reactiva la fecha seleccionada y el departamento
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [departmentId, setDepartmentId] = useState<string | undefined>(initialDepartmentId);

    // Formateamos la fecha a "YYYY-MM-DD" de forma segura para la clave de caché si existe
    const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : "";

    // 🌟 DECLARACIÓN DE TANSTACK QUERY
    const {
        data: shifts = [], // Valor por defecto vacío en concordancia con el estado anterior
        isLoading: isLoadingShifts,
        error,
        refetch
    } = useQuery({
        // La Query Key depende de la fecha y del departamento. Si cambian, TanStack Query actualiza la caché automáticamente.
        queryKey: ["shifts", "day", dateStr, departmentId],
        queryFn: async () => {
            if (!dateStr) return [];
            return await shiftService.getShiftsByDay(dateStr, departmentId);
        },
        // 🔒 IMPORTANTE: Evita que la query se ejecute en el montaje inicial. 
        // Solo correrá cuando tengamos una fecha válida seleccionada.
        enabled: !!dateStr,
        // Configuraciones profesionales recomendadas para dashboards en tiempo real:
        staleTime: 1000 * 60 * 5, // Los turnos del día se consideran válidos por 5 minutos
    });

    /**
     * Mapeo de la función imperativa anterior para que tu componente FullCalendar 
     * siga funcionando exactamente igual sin romper nada.
     */
    const fetchShiftsForDay = (date: Date, currentDepartmentId?: string) => {
        setSelectedDate(date);
        if (currentDepartmentId !== undefined) {
            setDepartmentId(currentDepartmentId);
        }
    };

    return {
        shifts,                         // Ahora viene directamente de la caché de TanStack Query
        isLoadingShifts,                // Estado de carga manejado automáticamente
        shiftsError: error ? (error as any).message || "Error al cargar los turnos." : null,
        fetchShiftsForDay,              // Sigue disparando la acción al hacer dateClick
        setSelectedDate,                // Utilidades extra por si necesitas resetear el estado
        setDepartmentId,
        refetchShifts: refetch          // Te permite forzar una recarga manual (ej: tras guardar cambios)
    };
};