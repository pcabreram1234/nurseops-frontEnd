"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useActivityLogs } from "@/modules/audit-logs/hooks/useActivityLogs";
import { ActivityLog, ACTION_LABELS, ACTION_BADGE } from "@/modules/audit-logs/types";
import { useAuditLogs } from "@/modules/audit-logs/hooks/useAuditLogs";
import {
    AuditLogRecord, AUDIT_ACTION_LABELS, AUDIT_ACTION_BADGE, AuditAction,
} from "@/modules/audit-logs/types/audit-log";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Eye, Search, X, Loader2, ScrollText, AlertCircle, Filter,
    Calendar, User, Info, FileJson, Lock, Shield, Server, Fingerprint,
    ChevronLeft, ChevronRight, ArrowLeftRight, History
} from "lucide-react";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 25;

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "medium" });
}

function JsonBlock({ title, value, tone }: { title: string; value: any; tone: "old" | "new" }) {
    const isEmpty = !value || (typeof value === "object" && Object.keys(value).length === 0);
    return (
        <div className={`flex-1 min-w-0 p-3 rounded-xl border ${tone === "old" ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${tone === "old" ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                {tone === "old" ? "◀ " : "▶ "}{title}
            </p>
            {isEmpty ? (
                <p className="text-[11px] italic text-muted-foreground">No capturado por el sistema</p>
            ) : (
                <pre className="text-[10px] bg-white/70 dark:bg-slate-950/70 p-2 rounded overflow-x-auto max-h-52 whitespace-pre-wrap">
                    {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                </pre>
            )}
        </div>
    );
}

function AuditLogDetailModal({ isOpen, onClose, log }: { isOpen: boolean; onClose: () => void; log: AuditLogRecord | null }) {
    if (!log) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> Detalle de Registro de Auditoría
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Fecha</span>
                            <span className="font-semibold">{formatDateTime(log.createdAt)}</span></div>
                    </div>
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <User className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Usuario</span>
                            <span className="font-semibold">
                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : (log.userId || "Sistema")}
                            </span></div>
                    </div>
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <Server className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Módulo</span>
                            <span className="font-semibold">{log.module?.name || log.module?.code || log.moduleId}</span></div>
                    </div>
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <FileJson className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Acción</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AUDIT_ACTION_BADGE[log.action] || AUDIT_ACTION_BADGE.UNKNOWN}`}>
                                {AUDIT_ACTION_LABELS[log.action] || log.action}
                            </span></div>
                    </div>
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <Server className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Dirección IP</span>
                            <span className="font-mono text-xs font-semibold">{log.ipAddress || "—"}</span></div>
                    </div>
                    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <Fingerprint className="h-3.5 w-3.5 text-muted-foreground mt-1" />
                        <div><span className="text-[11px] font-bold uppercase text-muted-foreground block">Request ID</span>
                            <span className="font-mono text-xs font-semibold break-all">{log.requestId || "—"}</span></div>
                    </div>
                    <div className="col-span-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground block">Agente de usuario</span>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">{log.userAgent || "—"}</span>
                    </div>
                    {log.organization && (
                        <div className="col-span-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground block">Organización</span>
                            <span className="font-semibold text-xs">{log.organization.name}</span>
                        </div>
                    )}
                </div>

                {/* VALOR ANTERIOR / POSTERIOR */}
                <div className="pt-3 border-t">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Valores de la modificación
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <JsonBlock title="Valor anterior (old_value)" value={log.old_value} tone="old" />
                        <JsonBlock title="Valor nuevo (new_value)" value={log.new_value} tone="new" />
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ActivityLogDetailModal({ isOpen, onClose, log }: { isOpen: boolean; onClose: () => void; log: ActivityLog | null }) {
    if (!log) return null;

    let details: any = log.details;
    try {
        if (typeof details === "string") details = JSON.parse(details);
    } catch { /* dejar como string */ }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" /> Detalle de Actividad
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-1">
                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${ACTION_BADGE[log.action] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {ACTION_LABELS[log.action] || log.action}
                        </span>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <User className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Usuario</p>
                            <p className="text-sm font-semibold">
                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : log.userId}
                            </p>
                            {log.user?.email && <p className="text-xs text-muted-foreground">{log.user.email}</p>}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Fecha</p>
                            <p className="text-sm font-semibold">{formatDateTime(log.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                        <FileJson className="h-3 w-3" /> Detalles (JSON)
                    </p>
                    <pre className="text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg overflow-x-auto max-h-64 whitespace-pre-wrap">
                        {typeof details === "object" ? JSON.stringify(details, null, 2) : String(details || "Sin detalles")}
                    </pre>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function AuditLogsPage() {
    const [activeTab, setActiveTab] = useState("audit");

    // ---- Estado pestaña ACTIVIDAD ----
    const [actSearch, setActSearch] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("ALL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isActDetailOpen, setIsActDetailOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

    // ---- Estado pestaña AUDITORÍA ----
    const [auditAction, setAuditAction] = useState<string>("ALL");
    const [auditFrom, setAuditFrom] = useState("");
    const [auditTo, setAuditTo] = useState("");
    const [auditRequestId, setAuditRequestId] = useState("");
    const [auditPage, setAuditPage] = useState(1);
    const [isAuditDetailOpen, setIsAuditDetailOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<AuditLogRecord | null>(null);

    // Queries
    const actFilters = useMemo(() => ({
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
    }), [actionFilter, dateFrom, dateTo]);

    const { logs: activityLogs, isLoading: actLoading, error: actError } = useActivityLogs(actFilters);

    const auditFilters = useMemo(() => ({
        action: auditAction !== "ALL" ? auditAction : undefined,
        fromDate: auditFrom || undefined,
        toDate: auditTo || undefined,
        requestId: auditRequestId || undefined,
        page: auditPage,
        limit: PAGE_SIZE,
    }), [auditAction, auditFrom, auditTo, auditRequestId, auditPage]);

    const { logs: auditLogs, meta: auditMeta, isLoading: auditLoading, isFetching: auditFetching, error: auditError } = useAuditLogs(auditFilters);

    // Filtro de texto cliente sobre actividad (la pestaña de actividad no tiene search server)
    const filteredActivity = useMemo(() => {
        const q = actSearch.toLowerCase();
        return activityLogs.filter(l => {
            if (!q) return true;
            const userName = l.user ? `${l.user.firstName} ${l.user.lastName}`.toLowerCase() : "";
            const actionName = (ACTION_LABELS[l.action] || l.action).toLowerCase();
            return userName.includes(q) || actionName.includes(q) || (typeof l.details === "string" && l.details.toLowerCase().includes(q));
        });
    }, [activityLogs, actSearch]);

    const auditHasFilters = !!(auditAction !== "ALL" || auditFrom || auditTo || auditRequestId);
    const clearAuditFilters = () => { setAuditAction("ALL"); setAuditFrom(""); setAuditTo(""); setAuditRequestId(""); setAuditPage(1); };
    const clearActFilters = () => { setActSearch(""); setActionFilter("ALL"); setDateFrom(""); setDateTo(""); };

    const renderLoading = (label: string) => (
        <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> {label}
        </div>
    );

    const renderError = (error: any, what: string) => (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50">
            <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
            <p className="text-sm font-semibold text-red-700">Error al cargar {what}</p>
            <p className="text-xs text-red-600/80 mt-1">{error?.response?.data?.message || error?.message || "Error de conexión."}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
                    <p className="text-muted-foreground">Registros de auditoría y actividad para investigación de cambios operacionales.</p>
                </div>
            </div>

            {/* AVISO DE SOLO LECTURA */}
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                    <strong className="font-bold">Vista de solo lectura.</strong> Los registros de auditoría no pueden modificarse ni
                    eliminarse desde la interfaz: los endpoints <code className="font-mono">AuditLog</code> exponen únicamente
                    <code className="font-mono"> GET</code>, y la escritura ocurre exclusivamente en el backend
                    (interceptor → cola de auditoría → base de datos).
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="activity" className="gap-1.5">
                        <History className="h-4 w-4" /> Actividad
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-1.5">
                        <Shield className="h-4 w-4" /> Auditoría (AuditLog)
                    </TabsTrigger>
                </TabsList>

                {/* ==================== PESTAÑA ACTIVIDAD ==================== */}
                <TabsContent value="activity" className="space-y-4">
                    {(activityLogs.length > 0 || actLoading) && (
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por usuario, acción o detalle..." value={actSearch} onChange={(e) => setActSearch(e.target.value)} className="pl-9 pr-9" />
                                {actSearch && (
                                    <button onClick={() => setActSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[155px]" title="Fecha desde" />
                            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[155px]" title="Fecha hasta" />
                            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                                <option value="ALL">Todas las acciones</option>
                                {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            {(actSearch || actionFilter !== "ALL" || dateFrom || dateTo) && (
                                <Button variant="ghost" size="sm" onClick={clearActFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                            )}
                        </div>
                    )}

                    {actLoading ? renderLoading("Cargando registros de actividad...") :
                        actError ? renderError(actError, "los registros de actividad") :
                        activityLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                                <ScrollText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No existen registros de actividad.</p>
                            </div>
                        ) : filteredActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50">
                                <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-semibold">Sin coincidencias</p>
                                <Button variant="ghost" size="sm" className="mt-3" onClick={clearActFilters}>Limpiar filtros</Button>
                            </div>
                        ) : (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <ScrollText className="h-4 w-4 text-primary" /> Registros de Actividad ({filteredActivity.length}{filteredActivity.length !== activityLogs.length ? ` de ${activityLogs.length}` : ""})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Usuario</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acción</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Detalles</th>
                                                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredActivity.map(l => {
                                                    const detailsPreview = typeof l.details === "object"
                                                        ? (l.details?.message || l.details?.reason || JSON.stringify(l.details).substring(0, 80))
                                                        : String(l.details || "").substring(0, 80);
                                                    return (
                                                        <tr key={l.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                                                            <td className="px-4 py-3 text-xs font-semibold">
                                                                {l.user ? `${l.user.firstName} ${l.user.lastName}` : <span className="text-muted-foreground font-mono">{l.userId}</span>}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ACTION_BADGE[l.action] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                                    {ACTION_LABELS[l.action] || l.action}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[260px] truncate" title={detailsPreview}>{detailsPreview}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-1 justify-end">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle"
                                                                        onClick={() => { setSelectedActivity(l); setIsActDetailOpen(true); }}>
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
                                </CardContent>
                            </Card>
                        )}
                </TabsContent>

                {/* ==================== PESTAÑA AUDITLOG ==================== */}
                <TabsContent value="audit" className="space-y-4">
                    {/* Filtros server-side */}
                    <div className="flex flex-wrap gap-3">
                        <Input type="date" value={auditFrom} onChange={(e) => { setAuditFrom(e.target.value); setAuditPage(1); }} className="w-[155px]" title="Fecha desde" />
                        <Input type="date" value={auditTo} onChange={(e) => { setAuditTo(e.target.value); setAuditPage(1); }} className="w-[155px]" title="Fecha hasta" />
                        <select value={auditAction} onChange={(e) => { setAuditAction(e.target.value); setAuditPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todas las acciones</option>
                            {Object.entries(AUDIT_ACTION_LABELS).filter(([k]) => k !== "UNKNOWN").map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <div className="relative w-[240px]">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filtrar por Request ID..." value={auditRequestId}
                                onChange={(e) => { setAuditRequestId(e.target.value); setAuditPage(1); }} className="pl-9" />
                        </div>
                        {auditFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                        {auditHasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearAuditFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                        )}
                    </div>

                    {auditLoading ? renderLoading("Cargando registros de auditoría...") :
                        auditError ? renderError(auditError, "los registros de auditoría") :
                        auditLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                                <Shield className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    {auditHasFilters ? "Sin registros para los filtros aplicados." : "Aún no hay registros de auditoría (AuditLog)."}
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1 max-w-md">
                                    Se generan automáticamente al realizar operaciones de creación, edición o eliminación en el sistema.
                                </p>
                                {auditHasFilters && <Button variant="ghost" size="sm" className="mt-3" onClick={clearAuditFilters}>Limpiar filtros</Button>}
                            </div>
                        ) : (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Registros de Auditoría ({auditLogs.length}{auditMeta && auditMeta.total > auditLogs.length ? ` de ${auditMeta.total}` : ""})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Usuario</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Módulo</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acción</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">IP</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Request ID</th>
                                                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLogs.map(l => (
                                                    <tr key={l.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                                                        <td className="px-4 py-3 text-xs font-semibold">
                                                            {l.user ? `${l.user.firstName} ${l.user.lastName}` : <span className="text-muted-foreground font-mono">{l.userId || "—"}</span>}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs">{l.module?.name || l.module?.code || "—"}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${AUDIT_ACTION_BADGE[l.action] || AUDIT_ACTION_BADGE.UNKNOWN}`}>
                                                                {AUDIT_ACTION_LABELS[l.action] || l.action}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs">{l.ipAddress || "—"}</td>
                                                        <td className="px-4 py-3 font-mono text-[10px] max-w-[140px] truncate" title={l.requestId || ""}>
                                                            {l.requestId ? `${l.requestId.substring(0, 12)}…` : "—"}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-1 justify-end">
                                                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver valores"
                                                                    onClick={() => { setSelectedAudit(l); setIsAuditDetailOpen(true); }}>
                                                                    <Eye className="h-3 w-3 text-slate-500" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* PAGINACIÓN SERVER-SIDE */}
                                    {auditMeta && auditMeta.totalPages > 1 && (
                                        <Pagination
                                            currentPage={auditMeta.page}
                                            totalPages={auditMeta.totalPages}
                                            totalItems={auditMeta.total}
                                            onPageChange={setAuditPage}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}
                </TabsContent>
            </Tabs>

            <ActivityLogDetailModal
                isOpen={isActDetailOpen}
                onClose={() => { setIsActDetailOpen(false); setSelectedActivity(null); }}
                log={selectedActivity}
            />

            <AuditLogDetailModal
                isOpen={isAuditDetailOpen}
                onClose={() => { setIsAuditDetailOpen(false); setSelectedAudit(null); }}
                log={selectedAudit}
            />
        </div>
    );
}