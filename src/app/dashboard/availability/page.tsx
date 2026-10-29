"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAvailability } from "@/modules/availability/hooks/useAvailability";
import { NurseAvailability, AVAILABILITY_STATUS_LABELS, AVAILABILITY_STATUS_BADGE, SHIFT_PREFERENCE_LABELS, AvailabilityFilters, AvailabilityStatus } from "@/modules/availability/types";
import AvailabilityModal from "@/modules/availability/components/AvailabilityModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Search, X, Loader2, CalendarCheck, AlertCircle,
    CheckCircle2, UserX, Sun, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Pagination } from "@/components/Pagination";

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return iso.split("T")[0];
}

export default function AvailabilityPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<NurseAvailability | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("");
    const [branchFilter, setBranchFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        branchId: branchFilter !== "ALL" ? branchFilter : undefined,
        startDate: dateFilter || undefined,
        endDate: dateFilter || undefined,
        page,
        limit: PAGE_SIZE,
    }), [statusFilter, dateFilter, branchFilter, page]);

    const { availabilities, meta, isLoading, isFetching, error, createAvailability, isCreating, updateAvailability, isUpdating } = useAvailability(filters);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: nurses = [] } = useQuery({
        queryKey: ["form-nurses"],
        queryFn: async () => (await apiInstance.get("/nurses", { params: { limit: 500 } })).data?.data || (await apiInstance.get("/nurses")).data
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["form-branches"],
        queryFn: async () => (await apiInstance.get("/branches")).data
    });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return availabilities.filter((a) => {
            const nurseName = a.nurse?.user ? `${a.nurse.user.firstName} ${a.nurse.user.lastName}`.toLowerCase() : "";
            return !q || nurseName.includes(q) || (a.notes || "").toLowerCase().includes(q);
        });
    }, [availabilities, search]);

    const hasActiveFilters = !!(search || statusFilter !== "ALL" || dateFilter || branchFilter !== "ALL");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setStatusFilter("ALL"); setDateFilter(""); setBranchFilter("ALL"); setPage(1); };

    const handleOpenCreate = () => { setSelected(null); setIsModalOpen(true); };
    const handleOpenEdit = (a: NurseAvailability) => { setSelected(a); setIsModalOpen(true); };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selected) {
                await updateAvailability({ id: selected.id, data });
            } else {
                await createAvailability(data);
            }
            setIsModalOpen(false);
        } catch { /* manejado por el hook */ }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Disponibilidad de Enfermería</h1>
                    <p className="text-muted-foreground">Registra y gestiona la disponibilidad del personal por fecha.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Disponibilidad
                </Button>
            </div>

            {(availabilities.length > 0 || meta || hasActiveFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por enfermera o notas..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-9" />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los Estados</option>
                            {Object.entries(AVAILABILITY_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <Input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="w-[160px]" />
                        <select value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todas las Sedes</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                        )}
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando disponibilidad...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar la disponibilidad</p>
                    <p className="text-xs text-red-600/80 mt-1 max-w-md">{error?.message || "Error de conexión."}</p>
                </div>
            ) : availabilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen registros de disponibilidad.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Registra la primera disponibilidad para comenzar.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                        <Plus className="h-3.5 w-3.5" /> Crear primer registro
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias para los filtros aplicados</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>Limpiar filtros</Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-primary" />
                            Disponibilidad ({filtered.length}{filtered.length !== availabilities.length ? ` de ${availabilities.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Enfermera</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Sede</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Preferencia</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Emergencia</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Horas Extra</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Notas</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => {
                                        const status = a.status as AvailabilityStatus;
                                        return (
                                            <tr key={a.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs">{formatDate(a.date)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{a.nurse?.user?.firstName} {a.nurse?.user?.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{a.nurse?.department?.name}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {a.branch?.name || a.nurse?.branch?.name || "Sin sede"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AVAILABILITY_STATUS_BADGE[status] || AVAILABILITY_STATUS_BADGE.AVAILABLE}`}>
                                                        {AVAILABILITY_STATUS_LABELS[status] || status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{a.shiftPreference ? SHIFT_PREFERENCE_LABELS[a.shiftPreference] : "—"}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {a.availableForEmergency ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <UserX className="h-4 w-4 text-muted-foreground mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {a.availableForOvertime ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                                    ) : (
                                                        <UserX className="h-4 w-4 text-muted-foreground mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate" title={a.notes || ""}>{a.notes || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar" onClick={() => handleOpenEdit(a)}>
                                                            <Edit2 className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                onPageChange={setPage}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            <AvailabilityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                availability={selected}
                isSubmitting={isCreating || isUpdating}
                nurses={nurses}
            />
        </div>
    );
}