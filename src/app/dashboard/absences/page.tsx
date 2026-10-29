"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAbsences } from "@/modules/absences/hooks/useAbsences";
import { Absence, AbsenceStatus, ABSENCE_TYPE_LABELS, ABSENCE_STATUS_LABELS } from "@/modules/absences/types";
import AbsenceModal from "@/modules/absences/components/AbsenceModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Search, X, Loader2, CalendarDays, AlertCircle,
    UserX, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";

const statusBadge: Record<AbsenceStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    COVERED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
};

const typeBadge: Record<string, string> = {
    SICKNESS: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    EMERGENCY: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    NO_SHOW: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
    VACATION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    MEDICAL_LICENSE: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    PERSONAL: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    UNJUSTIFIED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
};

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return iso.split("T")[0];
}

export default function AbsencesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Absence | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [branchFilter, setBranchFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        branchId: branchFilter !== "ALL" ? branchFilter : undefined,
        page,
        limit: PAGE_SIZE,
    }), [statusFilter, typeFilter, branchFilter, page]);

    const {
        absences, meta, isLoading, isFetching, error,
        createAbsence, isCreating,
        updateAbsence, isUpdating,
    } = useAbsences(filters);

    const currentUser = useAuthStore((s) => s.user);

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
        return absences.filter((a) => {
            const nurseName = a.nurse?.user ? `${a.nurse.user.firstName} ${a.nurse.user.lastName}`.toLowerCase() : "";
            return !q || nurseName.includes(q) || (a.reason || "").toLowerCase().includes(q);
        });
    }, [absences, search]);

    const handleOpenCreate = () => { setSelected(null); setIsModalOpen(true); };
    const handleOpenEdit = (a: Absence) => { setSelected(a); setIsModalOpen(true); };

    const handleFormSubmit = async (data: any) => {
        try {
            const payload = { ...data, reporterById: currentUser?.id || currentUser?.sub };
            if (selected) {
                await updateAbsence({ id: selected.id, data: payload });
            } else {
                await createAbsence(payload);
            }
            setIsModalOpen(false);
        } catch { /* handled by hook */ }
    };

    const hasActiveFilters = !!(search || statusFilter !== "ALL" || typeFilter !== "ALL" || branchFilter !== "ALL");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setStatusFilter("ALL"); setTypeFilter("ALL"); setBranchFilter("ALL"); setPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ausencias y Licencias</h1>
                    <p className="text-muted-foreground">Registra y gestiona las ausencias del personal de enfermería.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Ausencia
                </Button>
            </div>

            {(absences.length > 0 || meta || hasActiveFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por enfermera o motivo..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-9" />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los Estados</option>
                            {Object.entries(ABSENCE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los Tipos</option>
                            {Object.entries(ABSENCE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
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
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando ausencias...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las ausencias</p>
                    <p className="text-xs text-red-600/80 mt-1 max-w-md">{error?.message || "Error de conexión."}</p>
                </div>
            ) : absences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <CalendarDays className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen ausencias registradas.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Registra la primera ausencia para comenzar.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera ausencia
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
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Ausencias ({filtered.length}{filtered.length !== absences.length ? ` de ${absences.length}` : ""})
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
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Motivo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Reportado por</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => {
                                        const status = a.status as AbsenceStatus;
                                        return (
                                            <tr key={a.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs">{formatDate(a.date)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{a.nurse?.user?.firstName} {a.nurse?.user?.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{a.nurse?.departmentId || "-"}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {a.branch?.name || a.nurse?.branch?.name || "Sin sede"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge[a.type] || typeBadge.SICKNESS}`}>
                                                        {(ABSENCE_TYPE_LABELS as any)[a.type] || a.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate" title={a.reason}>{a.reason}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[status] || statusBadge.PENDING}`}>
                                                        {ABSENCE_STATUS_LABELS[status] || status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {a.reporter ? `${a.reporter.firstName} ${a.reporter.lastName}` : <span className="text-muted-foreground">—</span>}
                                                </td>
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

            <AbsenceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                absence={selected}
                isSubmitting={isCreating || isUpdating}
                nurses={nurses}
            />
        </div>
    );
}