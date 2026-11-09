import { useState, useCallback } from "react";
import { apiInstance } from "@/services/axios";
import { SearchableOption } from "@/components/ui/searchable-select";

/**
 * Resultado de búsqueda de turnos adaptado a SearchableOption.
 */
export interface SearchableShift extends SearchableOption {
    id: string;
    name: string;
    code?: string;
    type?: string;
    startTime: string;
    endTime: string;
    durationHours?: number;
    department?: { id: string; name: string } | null;
    branch?: { id: string; name: string } | null;
}

/**
 * Resultado paginado de la búsqueda de turnos.
 */
export interface SearchableShiftsResult {
    items: SearchableShift[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Filtros opcionales para la búsqueda de turnos.
 */
export interface SearchableShiftsFilters {
    departmentId?: string;
    branchId?: string;
    type?: string;
    isNightShift?: boolean;
    isEmergencyShift?: boolean;
}

/**
 * Función cargadora tipada para SearchableSelect.
 */
export type ShiftLoader = (
    search: string,
    filters?: Record<string, string | number | boolean | undefined>,
    page?: number,
    limit?: number,
) => Promise<{ items: SearchableShift[]; totalPages: number }>;


const formatTime = (time?: string | null): string => {
    if (!time) return "—";

    // Si viene en formato ISO (contiene "T", ej: 2026-10-30T19:00:00.000Z)
    if (time.includes("T")) {
        const timePart = time.split("T")[1]; // Extrae "19:00:00.000Z"
        return timePart ? timePart.slice(0, 5) : "—"; // Devuelve "19:00"
    }

    // Si ya viene como un string de hora plano (ej: "19:00:00" o "19:00")
    return time.slice(0, 5);
};

/**
 * Hook para buscar turnos bajo demanda con debounce.
 * El backend ya aplica el filtro de organizationId según el usuario autenticado.
 */
export function useSearchableShifts(filters?: SearchableShiftsFilters) {
    const [items, setItems] = useState<SearchableShift[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const doLoad = useCallback(
        async (
            search: string,
            filtersArg?: Record<string, string | number | boolean | undefined>,
            page = 1,
            limit = 20,
        ): Promise<{ items: SearchableShift[]; totalPages: number }> => {
            setIsLoading(true);
            setError(null);
            try {
                const params: Record<string, string> = {};
                if (search?.trim()) params.search = search.trim();
                if (filtersArg?.departmentId) params.departmentId = String(filtersArg.departmentId);
                if (filtersArg?.branchId) params.branchId = String(filtersArg.branchId);
                if (filtersArg?.type) params.type = String(filtersArg.type);
                if (filtersArg?.isNightShift !== undefined) params.isNightShift = String(filtersArg.isNightShift);
                if (filtersArg?.isEmergencyShift !== undefined) params.isEmergencyShift = String(filtersArg.isEmergencyShift);
                params.page = String(page);
                params.limit = String(limit);

                const resp: any = await apiInstance.get("/shifts", { params });
                const data = resp?.data ?? resp ?? [];
                const list = Array.isArray(data) ? data : data?.data ?? [];

                const shifts: SearchableShift[] = list.map((s: any) => {
                    const id = s.id;
                    const type = s.type || "Turno";
                    const name = s.name || s.code || "";
                    const startTime = s.startTime ? formatTime(s.startTime) : "--:--";
                    const endTime = s.endTime ? formatTime(s.endTime) : "--:--";
                    const deptName = s.department?.name || "";
                    const branchName = s.branch?.name || "";

                    // Etiqueta principal clara: [Tipo] Nombre (HoraInicio - HoraFin)
                    const labelParts = [`[${type}]`, s.name,`(${startTime} - ${endTime})- ${deptName}`].filter(Boolean);

                    // Descripción detallada agrupando Departamento y Sede
                    const descriptionParts = [
                        deptName && `Dep: ${deptName}`,
                        branchName && `Sede: ${branchName}`
                    ].filter(Boolean);

                    return {
                        // Propiedades requeridas por SearchableOption
                        value: id,
                        label: labelParts.join(" "),
                        description: descriptionParts.join(" • "),

                        // Propiedades originales de dominio
                        id,
                        name,
                        code: s.code,
                        type: s.type,
                        startTime,
                        endTime,
                        durationHours: s.durationHours,
                        department: s.department ?? null,
                        branch: s.branch ?? null,
                    };
                });

                const meta = resp?.meta ?? {};
                const total = meta.total ?? list.length;
                const tp = Math.ceil(total / limit) || 1;

                setItems(shifts);
                setTotalPages(tp);
                setCurrentPage(page);

                return { items: shifts, totalPages: tp };
            } catch {
                setItems([]);
                setError("Error al buscar turnos.");
                return { items: [], totalPages: 0 };
            } finally {
                setIsLoading(false);
            }
        },
        [filters],
    );

    const load: ShiftLoader = useCallback(doLoad, [doLoad]);

    const loadMore = useCallback(() => {
        if (isLoading || currentPage >= totalPages) return;
        load("", undefined, currentPage + 1).then(() => { });
    }, [isLoading, currentPage, totalPages, load]);

    return {
        items,
        totalPages,
        currentPage,
        isLoading,
        error,
        load,
        loadMore,
        setCurrentPage,
    };
}