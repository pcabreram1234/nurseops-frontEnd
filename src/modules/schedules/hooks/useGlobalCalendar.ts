// @/modules/schedules/hooks/useGlobalCalendar.ts
import { useState } from "react";
import { useQuery, useQueryClient, } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService";

export const useGlobalCalendar = () => {
    const queryClient = useQueryClient();
    // Almacenamos el rango de fechas actual que FullCalendar está mostrando en pantalla
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");

    // Query para los turnos asignados
    const { data: entries = [], isLoading: isLoadingEntries, isFetching } = useQuery({
        queryKey: ["global-calendar", dateRange.startDate, dateRange.endDate, selectedDepartment],
        queryFn: () => scheduleService.getEntriesByDateRange(dateRange.startDate, dateRange.endDate, selectedDepartment),
        // Solo ejecutamos si tenemos un rango de fecha válido (FullCalendar lo seteará al montar)
        enabled: !!dateRange.startDate && !!dateRange.endDate,
    });

    // Query para el filtro de departamentos
    const { data: departments = [] } = useQuery({
        queryKey: ["departments-list"],
        queryFn: scheduleService.getDepartments
    });



    return {
        entries,
        departments,
        isLoading: isLoadingEntries || isFetching,
        dateRange,
        setDateRange,
        selectedDepartment,
        setSelectedDepartment,
    };
};