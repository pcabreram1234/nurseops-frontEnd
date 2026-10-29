"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWorkloadMetrics } from "@/modules/workload-metrics/hooks/useWorkloadMetrics";
import { WorkLoadMetrics, MONTH_NAMES } from "@/modules/workload-metrics/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, ShieldCheck, AlertCircle, CalendarDays,
    User, Clock, Building, ShieldAlert, Filter, Users, Flame, BarChart3, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";

const formatDateTime = (iso?: string): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
};

function toNum(v: unknown): number {
    if (v === null || v === undefined) return 0;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return isNaN(n) ? 0 : n;
}

/** Barra de progreso con color invertido: mayor valor = más rojo (peor) */
function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const color = pct >= 70 ? "bg-red-500" : pct >= 40 ? "bg-amber-500" : "bg-emerald-500";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">{Math.round(value)}</span>
        </div>
    );
}

function SortDirection({ dir }: { dir: "asc" | "desc" }) {
    return dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

export default function WorkloadMetricsPage() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState<string>("ALL");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [sortField, setSortField] = useState<"totalHours" | "overtimeHours" | "nightHours" | "weekendHours" | "holidayHours" | "emergencyHours" | "fatigueScore" | "fairnessScore" | "workloadScore" | "burnoutRisk" | "totalHours">("fatigueScore");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        nurseId: search || undefined,
        month: monthFilter !== "ALL" ? Number(monthFilter) : undefined,
        year: yearFilter ? Number(yearFilter) : undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, monthFilter, yearFilter, page]);

    const { metrics, meta, isLoading, isFetching, error } = useWorkloadMetrics(filters);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Stats calculados server-side (usando los datos de la página actual)
    const stats = useMemo(() => {
        if (metrics.length === 0) return null;
        const avg = (fn: (m: WorkLoadMetrics) => number) => metrics.reduce((s, m) => s + fn(m), 0) / metrics.length;
        return {
            totalNurses: meta?.total ?? metrics.length,
            avgTotal: avg(m => toNum(m.total_hours)),
            avgOvertime: avg(m => toNum(m.overtime_hours)),
            avgNights: avg(m => toNum(m.nigth_hours)),
            avgFatigue: avg(m => toNum(m.fatigue_score)),
            avgFairness: avg(m => toNum(m.fairness_score)),
            avgWorkload: avg(m => toNum(m.workload_score)),
            avgBurnout: avg(m => toNum(m.burnout_risk)),
            highFatigue: metrics.filter(m => toNum(m.fatigue_score) >= 70).length,
            highBurnout: metrics.filter(m => toNum(m.burnout_risk) >= 0.7).length,
            lowFairness: metrics.filter(m => toNum(m.fairness_score) < 50).length,
        };
    }, [metrics, meta]);

    const clearFilters = () => { setMonthFilter("ALL"); setYearFilter(""); setSearchInput(""); setSearch(""); setPage(1); };
    const hasFilters = !!(monthFilter !== "ALL" || yearFilter || searchInput);

    const sortLabel = (field: string) => {
        const labels: Record<string, string> = {
            totalHours: "Horas totales",
            regularHours: "Horas regulares",
            overtimeHours: "Horas extra",
            nightHours: "Nocturnas",
            weekendHours: "Fines de semana",
            holidayHours: "Festivos",
            emergencyHours: "Emergencias",
            fatigueScore: "Fatiga",
            fairnessScore: "Equidad",
            workloadScore: "Carga laboral",
            burnoutRisk: "Agotamiento",
        };
        return labels[field] || field;
    };

    return (
        <div className="space-y-6">
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Carga de Trabajo y Fatiga</h1>
                    <p className="text-muted-foreground">Indicadores operacionales de carga laboral del personal de enfermería.</p>
                </div>
            </div>

            {/* INDICADORES PROMEDIOS */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Personal</p><p className="text-lg font-bold">{stats.totalNurses}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg"><Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Horas prom.</p><p className="text-lg font-bold">{stats.avgTotal.toFixed(1)}</p></div>
                    </div>
                    <div className={`bg-white dark:bg-slate-950 p-3 rounded-xl border flex items-center gap-3 ${stats.highFatigue > 0 ? "border-red-300 dark:border-red-900" : "border-slate-200 dark:border-slate-800"}`}>
                        <div className={`p-2 rounded-lg ${stats.highFatigue > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                            <Flame className={`h-4 w-4 ${stats.highFatigue > 0 ? "text-red-600" : "text-slate-600"}`} />
                        </div>
                        <div><p className="text-xs text-muted-foreground">Fatiga alta</p><p className={`text-lg font-bold ${stats.highFatigue > 0 ? "text-red-600" : ""}`}>{stats.highFatigue}</p></div>
                    </div>
                    <div className={`bg-white dark:bg-slate-950 p-3 rounded-xl border flex items-center gap-3 ${stats.highBurnout > 0 ? "border-red-300 dark:border-red-900" : "border-slate-200 dark:border-slate-800"}`}>
                        <div className={`p-2 rounded-lg ${stats.highBurnout > 0 ? "bg-red-100 dark:bg-red-900/50" : "bg-slate-50 dark:bg-slate-800"}`}>
                            <AlertTriangle className={`h-4 w-4 ${stats.highBurnout > 0 ? "text-red-600" : "text-slate-600"}`} />
                        </div>
                        <div><p className="text-xs text-muted-foreground">Riesgo agotamiento</p><p className={`text-lg font-bold ${stats.highBurnout > 0 ? "text-red-600" : ""}`}>{stats.highBurnout}</p></div>
                    </div>
                </div>
            )}

            {/* PROMEDIOS ORGANIZACIONALES */}
            {stats && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <BarChart3 className="h-3.5 w-3.5" /> Indicadores Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Fatiga</span>
                                <span className="text-[11px] font-bold">{stats.avgFatigue.toFixed(0)}/100</span>
                            </div>
                            <ScoreBar value={stats.avgFatigue} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Equidad de carga</span>
                                <span className="text-[11px] font-bold">{stats.avgFairness.toFixed(0)}/100</span>
                            </div>
                            <ScoreBar value={stats.avgFairness} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Carga laboral</span>
                                <span className="text-[11px] font-bold">{stats.avgWorkload.toFixed(0)}/100</span>
                            </div>
                            <ScoreBar value={stats.avgWorkload} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Riesgo agotamiento</span>
                                <span className="text-[11px] font-bold">{stats.avgBurnout * 100}</span>%
                            </div>
                            <ScoreBar value={stats.avgBurnout * 100} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* FILTROS */}
            {(metrics.length > 0 || hasFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por enfermera..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-9" />
                            {searchInput && (
                                <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los meses</option>
                            {MONTH_NAMES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </select>
                        <Input type="number" placeholder="Año" value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }} className="w-[110px]" min={2020} max={2100} />
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENIDO */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando métricas de carga laboral...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las métricas</p>
                    <p className="text-xs text-red-600/80 mt-1">{error?.message || "Error de conexión."}</p>
                </div>
            ) : metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Flame className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen métricas de carga laboral.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Las métricas se generan automáticamente al procesar los horarios.</p>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Flame className="h-4 w-4 text-primary" /> Métricas por Enfermera ({metrics.length}{meta && meta.total > metrics.length ? ` de ${meta.total}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("totalHours"); setSortDir(sortField === "totalHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Enfermera
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("totalHours"); setSortDir(sortField === "totalHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Horas totales {sortField === "totalHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("overtimeHours"); setSortDir(sortField === "overtimeHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Extra {sortField === "overtimeHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("nightHours"); setSortDir(sortField === "nightHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Nocturnas {sortField === "nightHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("weekendHours"); setSortDir(sortField === "weekendHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Fin de semana {sortField === "weekendHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("holidayHours"); setSortDir(sortField === "holidayHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Festivos {sortField === "holidayHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("emergencyHours"); setSortDir(sortField === "emergencyHours" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Emergencias {sortField === "emergencyHours" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("fatigueScore"); setSortDir(sortField === "fatigueScore" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Fatiga {sortField === "fatigueScore" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("fairnessScore"); setSortDir(sortField === "fairnessScore" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Equidad {sortField === "fairnessScore" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase cursor-pointer" onClick={() => { setSortField("burnoutRisk"); setSortDir(sortField === "burnoutRisk" && sortDir === "desc" ? "asc" : "desc"); }}>
                                            Agotamiento {sortField === "burnoutRisk" ? <SortDirection dir={sortDir} /> : ""}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map(m => {
                                        const fatigue = toNum(m.fatigue_score);
                                        const fatigueClass = fatigue >= 70 ? "text-red-600" : fatigue >= 40 ? "text-amber-600" : "text-emerald-600";
                                        const burnout = toNum(m.burnout_risk) * 100;
                                        const burnoutClass = burnout >= 70 ? "text-red-600" : burnout >= 40 ? "text-amber-600" : "text-emerald-600";
                                        const fatigueScore = toNum(m.fatigue_score);
                                        const fairnessScore = toNum(m.fairness_score);
                                        return (
                                            <tr key={m.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors ${fatigue >= 70 ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                                                <td className="px-4 py-3 font-semibold">
                                                    {m.nurse?.user ? `${m.nurse.user.firstName} ${m.nurse.user.lastName}` : <span className="text-muted-foreground italic">Sin asignar</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs">{MONTH_NAMES[m.month] || m.month} {m.year}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">{toNum(m.total_hours).toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{toNum(m.regular_hours).toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    <span className={toNum(m.overtime_hours) > 0 ? "text-amber-600 font-bold" : "text-muted-foreground"}>
                                                        {toNum(m.overtime_hours).toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    <span className={toNum(m.nigth_hours) > 0 ? "text-purple-600" : "text-muted-foreground"}>
                                                        {toNum(m.nigth_hours).toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">{toNum(m.weekend_hours).toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">{toNum(m.holidy_hours).toFixed(1)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    <span className={fatigueClass}>{fatigue.toFixed(1)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    <span className={toNum(m.fairness_score) < 50 ? "text-red-600" : toNum(m.fairness_score) < 70 ? "text-amber-600" : "text-emerald-600"}>
                                                        {fairnessScore.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">
                                                    <span className={burnoutClass}>{burnout.toFixed(1)}%</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN SERVER-SIDE */}
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

            {/* NOTA SOBRE INDICADORES */}
            {metrics.length > 0 && (
                <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Los indicadores de fatiga, equidad, carga laboral y riesgo de agotamiento son métricas operacionales calculadas a partir de los datos de horarios.
                    No representan valoraciones clínicas ni diagnósticos médicos.
                </p>
            )}
        </div>
    );
}