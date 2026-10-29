// @/modules/schedules/hooks/useGlobalCalendar.ts
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { scheduleService } from "../services/scheduleService";

/**
 * Query key compartida para el calendario global de schedules.
 * Las mutaciones deben invalidar esta key para refrescar los datos.
 */
export const SCHEDULE_CALENDAR_KEY = "schedule-calendar" as const;

export const useGlobalCalendar = () => {
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedBranch, setSelectedBranch] = useState<string>("");

    // Query para departments (carga estática, cacheada por 5 min)
    const { data: departments = [] } = useQuery({
        queryKey: ["departments"],
        queryFn: () => scheduleService.getDepartments(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: () => scheduleService.getBranches(),
        staleTime: 5 * 60 * 1000,
    });

    // Query principal del calendario
    // - keepPreviousData: mantiene datos del mes anterior durante la transición
    // - isLoading: solo true cuando NO hay datos Y se está haciendo fetch
    const { data: rawData, isLoading } = useQuery({
        queryKey: [SCHEDULE_CALENDAR_KEY, dateRange.startDate, dateRange.endDate, selectedDepartment, selectedBranch],
        queryFn: () => {
            if (!dateRange.startDate || !dateRange.endDate) return [];
            return scheduleService.getEntriesByDateRange(
                dateRange.startDate,
                dateRange.endDate,
                selectedDepartment || undefined,
                selectedBranch || undefined,
            );
        },
        enabled: !!dateRange.startDate && !!dateRange.endDate,
        staleTime: 2 * 60 * 1000,
    });

    const entries = rawData ?? [];

    return {
        entries,
        departments,
        branches,
        isLoading,
        dateRange,
        setDateRange,
        selectedDepartment,
        setSelectedDepartment,
        selectedBranch,
        setSelectedBranch,
    };
};