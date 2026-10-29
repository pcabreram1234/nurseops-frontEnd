"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Speciality, SpecialityFilters } from "@/modules/specialities/types";
import { SpecialityModal } from "@/modules/specialities/components/SpecialityModal";
import { useSpecialities } from "@/modules/specialities/hooks/useSpecialities";
import { Search, X, Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SpecialitiesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, page]);

    const { specialities, meta, isLoading, isFetching, isError, createSpeciality, isCreating, updateSpeciality, isUpdating, deleteSpeciality, isDeleting } = useSpecialities(filters);

    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Consultas secundarias para alimentar los selects del modal
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: depts = [] } = useQuery({ queryKey: ["form-depts"], queryFn: async () => (await apiInstance.get("/departments")).data });

    const handleFormSubmit = async (rawFormValues: any) => {
        setIsSubmitting(true);
        try {
            if (selectedSpeciality) {
                await updateSpeciality({ id: selectedSpeciality.id, data: rawFormValues });
            } else {
                await createSpeciality(rawFormValues);
            }
            setIsModalOpen(false);
            setSelectedSpeciality(null);
        } catch (err) {
            console.error("Error al procesar el formulario de especialidades:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la especialidad "${name}"? Esta acción no se puede deshacer.`)) {
            try {
                if (deleteSpeciality) {
                    await deleteSpeciality(id);
                } else {
                    console.warn("La función deleteSpeciality no está implementada en useSpecialities");
                }
            } catch (err) {
                console.error("Error al eliminar la especialidad:", err);
            }
        }
    };

    const hasActiveFilters = !!(search || statusFilter !== "all");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setStatusFilter("all"); setPage(1); };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Especialidades</h1>
                    <p className="text-muted-foreground">Gestión de especializaciones de enfermería por departamento.</p>
                </div>
                <button
                    onClick={() => { setSelectedSpeciality(null); setIsModalOpen(true); }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors self-start sm:self-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Nueva Especialidad
                </button>
            </div>

            {/* BARRA DE BUSQUEDA Y FILTROS */}
            {(specialities.length > 0 || meta) && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código o descripción..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full rounded-lg border p-2 pl-9 pr-9 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as any); setPage(1); }}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <X className="h-3 w-3" /> Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Tabla de Datos */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando especialidades...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                        <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                        <p className="text-sm font-semibold text-red-700">Error al cargar las especialidades</p>
                        <p className="text-xs text-red-600/80 mt-1 max-w-md">{isError ? "Error de conexión." : ""}</p>
                    </div>
                ) : specialities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No existen especialidades registradas.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <th className="p-4">Código</th>
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Departamentos</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-center w-40">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                {specialities.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="p-4 font-mono text-xs text-muted-foreground">{item.code}</td>
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.departmentSpecialities && item.departmentSpecialities.length > 0 ? (
                                                    item.departmentSpecialities.map((ds) => (
                                                        <span
                                                            key={ds.departmentId}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
                                                            {ds.department?.name || "Dept. Relacionado"}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Ninguno</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"}`}>
                                                {item.isActive ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => { setSelectedSpeciality(item); setIsModalOpen(true); }}
                                                    className="text-primary hover:underline font-medium text-sm"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    className="text-destructive hover:underline font-medium text-sm"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* PAGINACIÓN */}
                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </div>

            <SpecialityModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedSpeciality(null); }}
                onSubmit={handleFormSubmit}
                speciality={selectedSpeciality}
                isSubmitting={isSubmitting}
                organizations={orgs}
                departments={depts}
            />
        </div>
    );
}