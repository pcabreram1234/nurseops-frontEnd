"use client";

import { useState, useEffect, useMemo } from "react";
import { useAlerts } from "@/modules/alerts/hooks/useAlerts";
import {
    OperationalAlert, ALERT_STATUS_LABELS, ALERT_STATUS_BADGE,
    SEVERITY_LABELS, SEVERITY_BADGE, ALERT_TYPE_LABELS,
} from "@/modules/alerts/types";
import AlertDetailModal from "@/modules/alerts/components/AlertDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Eye, Search, X, Loader2, AlertTriangle, AlertCircle,
    Filter, CheckCircle2, BellRing, ShieldAlert, Activity,
    TrendingUp, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { useAuthStore } from "@/stores/auth.store";

const PAGE_SIZE = 25;

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

export default function AlertsPage() {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [severityFilter, setSeverityFilter] = useState<string>("ALL");
    const [deptFilter, setDeptFilter] = useState<string>("");
    const [fromDate, setDateFrom] = useState<string>("");
    const [toDate, setDateTo] = useState<string>("");
    const [page, setPage] = useState(1);

    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = currentUser?.id || currentUser?.sub || "";

    // Debounce: evita un request por tecla sobre 2.300+ alertas
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const filters = useMemo(() => ({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        severity: severityFilter !== "ALL" ? severityFilter : undefined,
        departmentId: deptFilter || undefined,
        search: search || undefined,
        fromDate,
        toDate,
        page,
        limit: PAGE_SIZE,
    }), [statusFilter, severityFilter, deptFilter, search, page, fromDate, toDate]);

    const {
        alerts, meta, stats, isLoading, isFetching, error,
        resolveAlert, isResolving, escalateAlert, isEscalating,
    } = useAlerts(filters);

    const { data: departments = [] } = useQuery({
        queryKey: ["form-departments"],
        queryFn: async () => (await apiInstance.get("/departments")).data,
    });

    const handleOpenDetail = (a: OperationalAlert) => { setSelectedAlert(a); setIsDetailOpen(true); };

    const hasFilters = !!(statusFilter !== "ALL" || severityFilter !== "ALL" || deptFilter || searchInput || fromDate || toDate);
    const clearFilters = () => {
        setStatusFilter("ALL"); setSeverityFilter("ALL"); setDeptFilter("");
        setSearchInput(""); setSearch(""); setPage(1); setDateFrom(""); setDateTo("");
    };

    const changePage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const isProcessing = isResolving || isEscalating;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alertas Operacionales</h1>
                    <p className="text-muted-foreground">Supervisa y gestiona las alertas del sistema de planificación.</p>
                </div>
            </div>

            {/* INDICADORES (agregados server-side) */}
            {(stats || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><BellRing className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats?.total ?? "—"}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg"><Activity className="h-4 w-4 text-amber-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Abiertas</p>
                            <p className="text-lg font-bold text-amber-600">{stats ? stats.open + stats.inProgress : "—"}</p></div>
                    </div>
                    <div className={`bg-white dark:bg-slate-950 p-3 rounded-xl border flex items-center gap-3 ${(stats?.criticalOpen ?? 0) > 0 ? "border-red-300 bg-red-50/50 dark:border-red-900" : "border-slate-200 dark:border-slate-800"}`}>
                        <div className={`p-2 rounded-lg ${(stats?.criticalOpen ?? 0) > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                            <ShieldAlert className={`h-4 w-4 ${(stats?.criticalOpen ?? 0) > 0 ? "text-red-600 dark:text-red-400 animate-pulse" : "text-slate-600"}`} />
                        </div>
                        <div><p className="text-xs text-muted-foreground">Críticas</p>
                            <p className={`text-lg font-bold ${(stats?.criticalOpen ?? 0) > 0 ? "text-red-600" : ""}`}>
                                {stats?.criticalOpen ?? "—"}
                            </p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Resueltas</p>
                            <p className="text-lg font-bold text-emerald-600">{stats?.resolved ?? "—"}</p></div>
                    </div>
                </div>
            )}

            {/* FILTROS (todos server-side) */}
            {(alerts.length > 0 || hasFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por mensaje de la alerta..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {searchInput && (
                                <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="">Todos los departamentos</option>
                            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todas las severidades</option>
                            {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los estados</option>
                            {Object.entries(ALERT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <Input type="datetime-local" value={fromDate} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" placeholder="Desde" />
                        <Input type="datetime-local" value={toDate} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" placeholder="Hasta" />
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENIDO */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando alertas...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las alertas</p>
                    <p className="text-xs text-red-600/80 mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || "Error de conexión."}</p>
                </div>
            ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                        {hasFilters ? "Sin alertas para los filtros aplicados." : "No hay alertas operacionales."}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        {hasFilters ? "Ajusta los filtros para ver más resultados." : "El sistema no ha detectado incidencias."}
                    </p>
                    {hasFilters && <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>Limpiar filtros</Button>}
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-primary" />
                            Alertas ({alerts.length}{meta && meta.total > alerts.length ? ` de ${meta.total}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Severidad</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Mensaje</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Departamento</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map(a => {
                                        const isHighSeverity = a.severity === "CRITICAL" || a.severity === "URGENT";
                                        return (
                                            <tr key={a.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors ${isHighSeverity && a.status !== "RESOLVED" ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[a.severity] || SEVERITY_BADGE.MEDIUM}`}>
                                                        {SEVERITY_LABELS[a.severity] || a.severity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold">
                                                    {ALERT_TYPE_LABELS[a.alertType] || a.alertType}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate" title={a.message}>{a.message}</td>
                                                <td className="px-4 py-3 text-xs font-semibold">
                                                    {a.department?.name || <span className="font-mono text-muted-foreground">{a.departmentId}</span>}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{formatDateTime(a.createdAt)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ALERT_STATUS_BADGE[a.status] || ALERT_STATUS_BADGE.OPEN}`}>
                                                        {ALERT_STATUS_LABELS[a.status] || a.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => handleOpenDetail(a)}>
                                                            <Eye className="h-3 w-3 text-slate-500" />
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
                                    Página {meta.page} de {meta.totalPages} · {meta.total} alertas en total
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={meta.page <= 1 || isFetching}
                                        onClick={() => changePage(Math.max(1, meta.page - 1))}
                                        className="gap-1 text-xs"
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
            )}

            <AlertDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedAlert(null); }}
                alert={selectedAlert}
                onResolve={async (id, payload) => { await resolveAlert({ id, payload }); }}
                onEscalate={async (id, payload) => { await escalateAlert({ id, payload }); }}
                isProcessing={isProcessing}
                currentUserId={currentUserId}
            />
        </div>
    );
}