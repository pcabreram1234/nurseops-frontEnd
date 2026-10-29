"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOptimizationRuns } from "@/modules/optimization/hooks/useOptimization";
import { OptimizationRun, toNum, getRunStatus, RUN_STATUS_LABELS, RUN_STATUS_BADGE } from "@/modules/optimization/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Eye, Search, X, Loader2, AlertCircle, Cpu, CheckCircle2,
    Percent, AlertTriangle
} from "lucide-react";
import { Pagination } from "@/components/Pagination";

function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

function RunDetailModal({ isOpen, onClose, run }: { isOpen: boolean; onClose: () => void; run: OptimizationRun | null }) {
    if (!run) return null;
    const result = run.result || {};
    const status = getRunStatus(run);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" /> Detalle de Ejecución
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${RUN_STATUS_BADGE[status]}`}>
                        {RUN_STATUS_LABELS[status]}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Inicio</p>
                        <p className="text-sm font-semibold">{formatDateTime(run.startedAt)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Fin</p>
                        <p className="text-sm font-semibold">{formatDateTime(run.fineshedAt)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Duración</p>
                        <p className="text-sm font-semibold">{toNum(run.executionTimeMs).toFixed(0)} ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Cobertura</p>
                        <p className={`text-sm font-bold ${toNum(run.coveragePercentage) >= 90 ? "text-emerald-600" : toNum(run.coveragePercentage) >= 70 ? "text-amber-600" : "text-red-600"}`}>
                            {toNum(run.coveragePercentage).toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Slots procesados</p>
                        <p className="text-sm font-semibold">{run.totalSlotsProcessed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Slots cubiertos</p>
                        <p className="text-sm font-semibold">{run.slotsCovered}</p>
                    </div>
                </div>

                {/* Resultado JSON */}
                {result && Object.keys(result).length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Resultados del motor</p>
                        <div className="grid grid-cols-2 gap-2">
                            {result.fairness_score !== undefined && (
                                <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30">
                                    <span className="text-[11px] font-semibold">Equidad</span>
                                    <span className="text-sm font-bold text-emerald-700">{toNum(result.fairness_score).toFixed(0)}/100</span>
                                </div>
                            )}
                            {result.fatigue_score !== undefined && (
                                <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950/30">
                                    <span className="text-[11px] font-semibold">Fatiga</span>
                                    <span className="text-sm font-bold text-amber-700">{toNum(result.fatigue_score).toFixed(0)}/100</span>
                                </div>
                            )}
                            {result.unassigned_shifts !== undefined && (
                                <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200 dark:bg-red-950/30">
                                    <span className="text-[11px] font-semibold">Sin asignar</span>
                                    <span className="text-sm font-bold text-red-700">{result.unassigned_shifts}</span>
                                </div>
                            )}
                            {result.rule_violations !== undefined && (
                                <div className="flex items-center justify-between p-2 rounded bg-orange-50 border border-orange-200 dark:bg-orange-950/30">
                                    <span className="text-[11px] font-semibold">Violaciones</span>
                                    <span className="text-sm font-bold text-orange-700">{result.rule_violations}</span>
                                </div>
                            )}
                        </div>
                        {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                            <div className="p-2 rounded bg-amber-50 border border-amber-200 dark:bg-amber-950/30">
                                <p className="text-[11px] font-bold text-amber-700 mb-1">Advertencias:</p>
                                <ul className="text-xs text-amber-700 space-y-0.5">
                                    {result.warnings.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function OptimizationPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState<OptimizationRun | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, page]);

    const { runs, meta, isLoading, isFetching, error } = useOptimizationRuns(filters);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return runs.filter(r =>
            !q ||
            (r.department?.name || "").toLowerCase().includes(q) ||
            (r.schedule?.department?.name || "").toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)
        );
    }, [runs, search]);

    const stats = useMemo(() => {
        const total = runs.length;
        const completed = runs.filter(r => getRunStatus(r) === "completed").length;
        const failed = runs.filter(r => getRunStatus(r) === "failed").length;
        const avgCoverage = runs.length > 0
            ? runs.reduce((s, r) => s + toNum(r.coveragePercentage), 0) / runs.length
            : 0;
        return { total, completed, failed, avgCoverage };
    }, [runs]);

    const handleOpenDetail = (r: OptimizationRun) => { setSelectedRun(r); setIsDetailOpen(true); };

    const hasFilters = !!search;
    const clearFilters = () => { setSearchTerm(""); setSearch(""); setPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resultados de Optimización</h1>
                    <p className="text-muted-foreground">Ejecuciones de optimización de horarios y sus indicadores.</p>
                </div>
            </div>

            {(runs.length > 0 || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Cpu className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Completadas</p><p className="text-lg font-bold text-emerald-600">{stats.completed}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg"><AlertCircle className="h-4 w-4 text-red-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Fallidas</p><p className="text-lg font-bold text-red-600">{stats.failed}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg"><Percent className="h-4 w-4 text-indigo-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Cobertura prom.</p><p className="text-lg font-bold">{stats.avgCoverage.toFixed(1)}%</p></div>
                    </div>
                </div>
            )}

            {(runs.length > 0 || hasFilters) && (
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por departamento o ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-9" />
                        {searchTerm && (
                            <button onClick={() => { setSearchTerm(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando ejecuciones de optimización...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las ejecuciones</p>
                    <p className="text-xs text-red-600/80 mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || "Error de conexión."}</p>
                </div>
            ) : runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Cpu className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen ejecuciones de optimización.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Las ejecuciones se registran cuando el motor de optimización procesa un horario.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearchTerm(""); setSearch(""); }}>Limpiar búsqueda</Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-primary" /> Ejecuciones ({filtered.length}{filtered.length !== runs.length ? ` de ${runs.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Departamento</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Horario</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Inicio</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fin</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Duración</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Cobertura</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(r => {
                                        const status = getRunStatus(r);
                                        const cov = toNum(r.coveragePercentage);
                                        return (
                                            <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RUN_STATUS_BADGE[status]}`}>
                                                        {RUN_STATUS_LABELS[status]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold">
                                                    {r.department?.name || r.schedule?.department?.name || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {r.schedule ? `${r.schedule.month}/${r.schedule.year}` : "—"}
                                                    {r.schedule && (
                                                        <span className="ml-1 text-muted-foreground">({r.schedule.status})</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{formatDateTime(r.startedAt)}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{formatDateTime(r.fineshedAt)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-xs">{toNum(r.executionTimeMs).toFixed(0)} ms</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-bold text-xs ${cov >= 90 ? "text-emerald-600" : cov >= 70 ? "text-amber-600" : "text-red-600"}`}>
                                                        {cov.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => handleOpenDetail(r)}>
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

            {/* Nota: sin resultados ficticios */}
            <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Solo se muestran ejecuciones reales registradas por el motor de optimización. No se presentan recomendaciones artificiales.
            </p>

            <RunDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                run={selectedRun}
            />
        </div>
    );
}