"use client";

import React, { useState, useMemo } from "react";
import { useSchedules, useScheduleEntryStats } from "@/modules/schedule-entries/hooks/useScheduleEntriesPage";
import { ScheduleEntry, ScheduleEntryStatus } from "@/modules/schedule-entries/types";
import ScheduleEntryFormModal from "@/modules/schedule-entries/components/ScheduleEntryFormModal";
import ScheduleEntryDetailModal from "@/modules/schedule-entries/components/ScheduleEntryDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, CalendarDays, XCircle, CheckCircle2, Moon, Sun, Sunrise,
    User, Clock, Building, ShieldAlert, Filter, Users, Percent,
    Eye, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";

const PAGE_SIZE = 25;
const DEFAULT_START_DATE = new Date().toISOString().slice(0, 10);
const DEFAULT_END_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const shiftTypeLabels: Record<string, string> = {
    MORNING: "Mañana",
    AFTERNOON: "Tarde",
    NIGHT: "Noche",
    MORNING_AFTERNOON: "Mañana-Tarde",
    MORNING_NIGHT: "Mañana-Noche",
    NIGHT_AFTERNOON: "Noche-Tarde",
    NIGTH_AFTERNOON: "Noche-Tarde",
    SIN_TURNO: "Sin turno",
};

const shiftTypeIcons: Record<string, React.ReactNode> = {
    MORNING: <Sunrise className="h-4 w-4 text-yellow-500" />,
    AFTERNOON: <Sun className="h-4 w-4 text-orange-500" />,
    NIGHT: <Moon className="h-4 w-4 text-purple-500" />,
    MORNING_AFTERNOON: <span className="text-sm">🌅/☀️</span>,
    MORNING_NIGHT: <span className="text-sm">🌅/🌙</span>,
    NIGHT_AFTERNOON: <span className="text-sm">☀️/🌙</span>,
    NIGTH_AFTERNOON: <span className="text-sm">☀️/🌙</span>,
};

const statusLabels: Record<ScheduleEntryStatus, string> = {
    ASSIGNED: "Asignado",
    CONFIRMED: "Confirmado",
    PENDING: "Pendiente",
    CANCELLED: "Cancelado",
    REPLACED: "Reemplazado",
    OPEN: "Abierto",
};

const statusBadgeColors: Record<ScheduleEntryStatus, string> = {
    ASSIGNED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400",
    CANCELLED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
    REPLACED: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400",
    OPEN: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
};

const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "2-digit" });
};

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

export default function ScheduleEntriesPage() {
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [branchFilter, setBranchFilter] = useState<string>("ALL");
    const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [dateFrom, setDateFrom] = useState<string>(DEFAULT_START_DATE);
    const [dateTo, setDateTo] = useState<string>(DEFAULT_END_DATE);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const baseFilters = useMemo(() => ({
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        departmentId: departmentFilter !== "ALL" ? departmentFilter : undefined,
        branchId: branchFilter !== "ALL" ? branchFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search || undefined,
    }), [dateFrom, dateTo, departmentFilter, branchFilter, statusFilter, search]);

    const filters = useMemo(() => ({
        ...baseFilters,
        page,
        limit: PAGE_SIZE,
    }), [baseFilters, page]);

    const { entries, meta, isLoading, isFetching, error, createEntry, isCreating, updateEntry, isUpdating, deleteEntry, isDeleting } = useSchedules(filters);
    const { stats: serverStats, isFetchingStats } = useScheduleEntryStats(baseFilters);

    const { data: departments = [] } = useQuery({
        queryKey: ["form-departments"],
        queryFn: async () => (await apiInstance.get("/departments")).data,
    });

    const departmentsMap = useMemo(
        () => new Map<string, string>(departments.map((d: {id: string, name: string}) => [d.id, d.name])),
        [departments]
    );

    const { data: nurses = [] } = useQuery({
        queryKey: ["form-nurses"],
        queryFn: async () => (await apiInstance.get("/nurses")).data,
    });

    const { data: shifts = [] } = useQuery({
        queryKey: ["form-shifts"],
        queryFn: async () => (await apiInstance.get("/shifts")).data,
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["form-branches"],
        queryFn: async () => (await apiInstance.get("/branches")).data,
    });

    const handleOpenCreate = () => { setSelectedEntry(null); setIsModalOpen(true); };
    const handleOpenEdit = (entry: ScheduleEntry) => { setSelectedEntry(entry); setIsModalOpen(true); };
    const handleOpenDetail = (entry: ScheduleEntry) => { setSelectedEntry(entry); setIsDetailOpen(true); };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta asignación? Esta acción no se puede deshacer.")) {
            await deleteEntry(id);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedEntry) {
            await updateEntry({ id: selectedEntry.id, ...data });
        } else {
            await createEntry(data);
        }
        setIsModalOpen(false);
        setSelectedEntry(null);
    };

    const filteredEntries = entries;

    const stats = serverStats ?? {
        total: 0,
        assigned: 0,
        vacant: 0,
        pending: 0,
        cancelled: 0,
        emergencies: 0,
        statusCounts: {} as Record<string, number>,
        byShift: [] as { id: string; name: string; total: number; assigned: number }[],
        coverage: 0,
    };

    const hasActiveFilters =
        !!searchInput ||
        departmentFilter !== "ALL" ||
        branchFilter !== "ALL" ||
        statusFilter !== "ALL" ||
        dateFrom !== DEFAULT_START_DATE ||
        dateTo !== DEFAULT_END_DATE;

    const clearFilters = () => {
        setSearchInput("");
        setSearch("");
        setDepartmentFilter("ALL");
        setBranchFilter("ALL");
        setStatusFilter("ALL");
        setDateFrom(DEFAULT_START_DATE);
        setDateTo(DEFAULT_END_DATE);
        setPage(1);
    };

    const changePage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Cargando asignaciones...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Asignaciones Diarias</h1>
                    <p className="text-muted-foreground">Visualiza y gestiona las asignaciones de turnos del personal.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva Asignación
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-3 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por enfermera, turno o notas..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={departmentFilter}
                                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800"
                            >
                                <option value="ALL">Todos los Departamentos</option>
                                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select
                                value={branchFilter}
                                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800"
                            >
                                <option value="ALL">Todas las Sedes</option>
                                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800"
                            >
                                <option value="ALL">Todos los Estados</option>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Desde</span>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                    className="w-[150px]"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Hasta</span>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                    className="w-[150px]"
                                />
                            </div>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                                    <X className="h-3 w-3" /> Limpiar
                                </Button>
                            )}
                            {(isFetching || isFetchingStats) && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Indicadores
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><CalendarDays className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total Posiciones</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Personal Asignado</p><p className="text-lg font-bold">{stats.assigned}</p></div>
                    </div>
                    <div className={`bg-white dark:bg-slate-950 p-3 rounded-xl border flex items-center gap-3 ${stats?.vacant > 0 ? "border-amber-300 bg-amber-50/50 dark:border-amber-900" : "border-slate-200 dark:border-slate-800"}`}>
                        <div className={`p-2 rounded-lg ${stats?.vacant > 0 ? "bg-amber-100 dark:bg-amber-950/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                            <XCircle className={`h-4 w-4 ${stats?.vacant > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-600"}`} />
                        </div>
                        <div><p className="text-xs text-muted-foreground">Vacantes</p><p className="text-lg font-bold">{stats.vacant}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg"><Percent className="h-4 w-4 text-indigo-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Cobertura General</p><p className="text-lg font-bold">{stats.coverage ?? 0}%</p></div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Distribución por Turno
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            {departmentFilter === "ALL"
                                ? "Consolidado por tipo de turno en todos los departamentos"
                                : "Consolidado por tipo de turno del departamento seleccionado"}
                        </p>
                    </div>
                    {isFetchingStats && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                    {stats.byShift && stats.byShift.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.byShift.map((s: any) => {
                                const pct = s.total > 0 ? Math.round((s.assigned / s.total) * 100) : 0;
                                return (
                                    <div key={s.id || s.name} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm flex items-center gap-1.5">
                                                {shiftTypeIcons[s.name]}
                                                {shiftTypeLabels[s.name] || s.name}
                                            </span>
                                            <span className={`text-xs font-bold ${pct >= 100 ? "text-emerald-600" : pct >= 75 ? "text-amber-600" : "text-red-600"}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {s.assigned} / {s.total} asignadas
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-3">No hay asignaciones para los filtros seleccionados.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Asignaciones ({meta?.total ?? entries.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 dark:bg-slate-900/40">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enfermera</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Turno</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sede</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departamento</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Horario</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredEntries.map((e: any) => {
                                    const status = e.status as ScheduleEntryStatus;
                                    return (
                                        <tr key={e.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors ${e.isEmergencyCoverage ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                                            <td className="px-4 py-3 font-mono text-xs">{formatDate(e.date)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{e.nurse?.user?.firstName} {e.nurse?.user?.lastName}</span>
                                                    {e.isEmergencyCoverage && <span className="text-red-500" title="Cobertura de emergencia">🚨</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {shiftTypeLabels[e.shiftTemplate?.name] || shiftTypeLabels[e.shift?.name] || e.shiftTemplate?.name || e.shift?.name}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                                                {e.branch?.name || e.nurse?.branch?.name || e.shift?.branch?.name || "Sin sede"}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {e.shiftTemplate?.department?.name || e.shift?.department?.name || "N/A"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColors[status] || statusBadgeColors.ASSIGNED}`}>
                                                    {statusLabels[status] || status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(e.shift?.startTime)} - {formatTime(e.shift?.endTime)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => handleOpenDetail(e)}>
                                                        <Eye className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar" onClick={() => handleOpenEdit(e)}>
                                                        <Edit2 className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Eliminar" onClick={() => handleDelete(e.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN SERVER-SIDE */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-900/20">
                            <span className="text-xs text-muted-foreground">
                                Página {meta.page} de {meta.totalPages} ({meta.total} asignaciones)
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    disabled={meta.page <= 1 || isFetching}
                                    onClick={() => changePage(Math.max(1, meta.page - 1))}
                                    className="text-xs rounded-lg"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    disabled={meta.page >= meta.totalPages || isFetching}
                                    onClick={() => changePage(Math.min(meta.totalPages, meta.page + 1))}
                                    className="gap-1 text-xs"
                                >
                                    Siguiente <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* MODAL DE EDICIÓN / CREACIÓN */}
            <ScheduleEntryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                entry={selectedEntry}
                isSubmitting={isCreating || isUpdating}
                departments={departments}
                nurses={nurses}
                shifts={shifts}
                departmentsMap={departmentsMap}
            />

            {/* MODAL DE DETALLE */}
            <ScheduleEntryDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                entry={selectedEntry}
            />
        </div>
    );
}
