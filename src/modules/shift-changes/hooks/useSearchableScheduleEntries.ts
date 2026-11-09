import { useState, useCallback } from "react";
import { apiInstance } from "@/services/axios";
import { SearchableOption } from "@/components/ui/searchable-select";

/**
 * Resultado de búsqueda de asignaciones de turno (ScheduleEntry)
 * adaptado a SearchableOption para selectores del módulo de intercambio.
 */
export interface SearchableScheduleEntry extends SearchableOption {
    id: string;
    date: string;
    status: string;
    shiftName: string;
    shiftType: string;
    startTime: string;
    endTime: string;
    isNightShift: boolean;
    assignedNurse?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    department?: { id: string; name: string } | null;
    branch?: { id: string; name: string } | null;
    scheduleMonth?: number;
    scheduleYear?: number;
}

/**
 * Filtros opcionales para la búsqueda de asignaciones.
 */
export interface SearchableScheduleEntryFilters {
    departmentId?: string;
    branchId?: string;
    nurseId?: string;
    shiftType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

/**
 * Función cargadora tipada para SearchableSelect.
 */
export type ScheduleEntryLoader = (
    search: string,
    filters?: Record<string, string | number | boolean | undefined>,
    page?: number,
    limit?: number,
) => Promise<{ items: SearchableScheduleEntry[]; totalPages: number }>;

const formatTime = (time?: string | null): string => {
    if (!time) return "—";
    if (time.includes("T")) {
        const t = time.split("T")[1];
        return t ? t.slice(0, 5) : "—";
    }
    return time.slice(0, 5);
};

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES");
};

/**
 * Hook para buscar asignaciones de turno (ScheduleEntry) bajo demanda con debounce.
 * El backend ya aplica el filtro de organizationId según el usuario autenticado.
 */
export function useSearchableScheduleEntries(filters?: SearchableScheduleEntryFilters) {
    const [items, setItems] = useState<SearchableScheduleEntry[]>([]);
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
        ): Promise<{ items: SearchableScheduleEntry[]; totalPages: number }> => {
            setIsLoading(true);
            setError(null);
            try {
                const params: Record<string, string> = {};
                if (search?.trim()) params.search = search.trim();
                if (filtersArg?.departmentId) params.departmentId = String(filtersArg.departmentId);
                if (filtersArg?.branchId) params.branchId = String(filtersArg.branchId);
                if (filtersArg?.nurseId) params.nurseId = String(filtersArg.nurseId);
                if (filtersArg?.shiftType) params.shiftType = String(filtersArg.shiftType);
                if (filtersArg?.status) params.status = String(filtersArg.status);
                if (filtersArg?.dateFrom) params.startDate = String(filtersArg.dateFrom);
                if (filtersArg?.dateTo) params.endDate = String(filtersArg.dateTo);
                params.page = String(page);
                params.limit = String(limit);

                const resp: any = await apiInstance.get("/schedule-entries", { params });
                const data = resp?.data ?? resp ?? [];
                const list = Array.isArray(data) ? data : data?.data ?? [];

                const entries: SearchableScheduleEntry[] = list.map((e: any) => {
                    const id = e.id;
                    const date = e.date;
                    const status = e.status || "—";
                    const shift = e.shift || {};
                    const shiftTemplate = e.shiftTemplate || {};
                    const shiftName = shift.name || shiftTemplate.name || "Sin nombre";
                    const shiftType = shift.type || shiftTemplate.type || "—";
                    const startTime = shift.startTime || shiftTemplate.startTime || "--:--";
                    const endTime = shift.endTime || shiftTemplate.endTime || "--:--";
                    const isNightShift = shift.isNightShift || shiftTemplate.isNightShift || false;
                    const nurse = e.nurse || null;
                    const dept = shiftTemplate.department || e.department || null;
                    const branch = e.branch || null;

                    const assignedNurseName = nurse
                        ? `${nurse.user?.firstName || ""} ${nurse.user?.lastName || ""}`.trim()
                        : null;

                    // Etiqueta principal: Turno (HH:MM - HH:MM)
                    const label = `${shiftName} (${formatTime(startTime)} - ${formatTime(endTime)})`;

                    // Descripción enriquecida: Fecha · Enfermera asignada · Departamento · Sede · Estado
                    const descriptionParts = [
                        date ? formatDate(date) : "—",
                        assignedNurseName || "Sin asignar",
                        dept?.name || "—",
                        branch?.name || "—",
                        status,
                    ];

                    return {
                        // Propiedades requeridas por SearchableOption
                        value: id,
                        label,
                        description: descriptionParts.join(" • "),

                        // Propiedades originales de dominio
                        id,
                        date,
                        status,
                        shiftName,
                        shiftType,
                        startTime: formatTime(startTime),
                        endTime: formatTime(endTime),
                        isNightShift,
                        assignedNurse: nurse
                            ? {
                                  id: nurse.id,
                                  firstName: nurse.user?.firstName || "",
                                  lastName: nurse.user?.lastName || "",
                              }
                            : null,
                        department: dept ? { id: dept.id, name: dept.name } : null,
                        branch: branch ? { id: branch.id, name: branch.name } : null,
                        scheduleMonth: e.schedule?.month,
                        scheduleYear: e.schedule?.year,
                    };
                });

                const meta = resp?.meta ?? {};
                const total = meta.total ?? list.length;
                const tp = Math.ceil(total / limit) || 1;

                setItems(entries);
                setTotalPages(tp);
                setCurrentPage(page);

                return { items: entries, totalPages: tp };
            } catch {
                setItems([]);
                setError("Error al buscar asignaciones de turno.");
                return { items: [], totalPages: 0 };
            } finally {
                setIsLoading(false);
            }
        },
        [filters],
    );

    const load: ScheduleEntryLoader = useCallback(doLoad, [doLoad]);

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
