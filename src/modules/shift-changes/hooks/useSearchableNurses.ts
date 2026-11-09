import { useState, useCallback } from "react";
import { apiInstance } from "@/services/axios";
import { SearchableOption } from "@/components/ui/searchable-select";

export interface SearchableNurse extends SearchableOption {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: { id: string; name: string } | null;
    branch?: { id: string; name: string } | null;
    status?: string;
}

export interface SearchableNursesFilters {
    departmentId?: string;
    branchId?: string;
    specialityId?: string;
    contractType?: string;
    status?: string;
}

export type NurseLoader = (
    search: string,
    filters?: Record<string, string | number | boolean | undefined>,
    page?: number,
    limit?: number,
) => Promise<{ items: SearchableNurse[]; totalPages: number }>;

export function useSearchableNurses(filters?: SearchableNursesFilters) {
    const [items, setItems] = useState<SearchableNurse[]>([]);
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
        ): Promise<{ items: SearchableNurse[]; totalPages: number }> => {
            setIsLoading(true);
            setError(null);
            try {
                const params: Record<string, string> = {};
                if (search?.trim()) params.search = search.trim();
                if (filtersArg?.departmentId) params.departmentId = String(filtersArg.departmentId);
                if (filtersArg?.branchId) params.branchId = String(filtersArg.branchId);
                if (filtersArg?.specialityId) params.specialityId = String(filtersArg.specialityId);
                if (filtersArg?.contractType) params.contractType = String(filtersArg.contractType);
                if (filtersArg?.status) params.status = String(filtersArg.status);
                params.page = String(page);
                params.limit = String(limit);

                const resp: any = await apiInstance.get("/nurses", { params });
                const data = resp?.data ?? resp ?? [];
                const list = Array.isArray(data) ? data : data?.data ?? [];

                const nurses: SearchableNurse[] = list.map((n: any) => {
                    const firstName = n?.user?.firstName ?? n.firstName ?? "";
                    const lastName = n?.user?.lastName ?? n.lastName ?? "";
                    const id = n?.id ?? n?.userId ?? n?.user?.id;
                    const deptName = n?.department?.name || "";
                    const branchName = n?.branch?.name || "";

                    return {
                        // Campos requeridos por SearchableOption
                        value: id,
                        label: `${firstName} ${lastName}`.trim() || "Sin nombre",
                        description: [deptName, branchName].filter(Boolean).join(" • "),

                        // Campos de dominio originales
                        id,
                        firstName,
                        lastName,
                        email: n?.user?.email ?? n.email,
                        department: n?.department ?? null,
                        branch: n?.branch ?? null,
                        status: n.status,
                    };
                });

                const meta = resp?.meta ?? {};
                const total = meta.total ?? list.length;
                const tp = Math.ceil(total / limit) || 1;

                setItems(nurses);
                setTotalPages(tp);
                setCurrentPage(page);
                return { items: nurses, totalPages: tp };
            } catch {
                setItems([]);
                setError("Error al buscar enfermeras.");
                return { items: [], totalPages: 0 };
            } finally {
                setIsLoading(false);
            }
        },
        [filters],
    );

    const load: NurseLoader = useCallback(doLoad, [doLoad]);

    const loadMore = useCallback(() => {
        if (isLoading || currentPage >= totalPages) return;
        load("", undefined, currentPage + 1).then(() => {});
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