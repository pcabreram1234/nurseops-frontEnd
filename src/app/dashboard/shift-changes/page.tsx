"use client";

import { useState, useMemo } from "react";
import { useShiftChanges } from "@/modules/shift-changes/hooks/useShiftChanges";
import { ShiftChangeRequest, REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE, ShiftChangeStatus } from "@/modules/shift-changes/types";
import ShiftChangeDetailModal from "@/modules/shift-changes/components/ShiftChangeDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, AlertCircle, Eye, Clock,
    User, AlertTriangle, Filter, CheckCircle2, ArrowLeftRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Pagination } from "@/components/Pagination";

export default function ShiftChangesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ShiftChangeRequest | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
    }), [statusFilter, search, page]);

    const {
        requests, meta, isLoading, error,
        createRequest, isCreating,
        approveRequest, isApproving,
        rejectRequest, isRejecting,
        cancelRequest, isCancelling,
    } = useShiftChanges(filters);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return requests.filter(r => {
            const requesterName = r.requester?.user ? `${r.requester.user.firstName} ${r.requester.user.lastName}`.toLowerCase() : "";
            return !q || requesterName.includes(q) || (r.reason || "").toLowerCase().includes(q);
        });
    }, [requests, search]);

    const stats = useMemo(() => {
        const total = requests.length;
        const pending = requests.filter(r => r.status === "AWAITING_OTHER_NURSE" || r.status === "UNDER_SUPVERSION").length;
        const approved = requests.filter(r => r.status === "APPROVED_BY_SUPERVISOR").length;
        const rejected = requests.filter(r => r.status === "REJECTED_BY_SUPERVISOR" || r.status === "REJECTED").length;
        return { total, pending, approved, rejected };
    }, [requests]);

    const handleOpenCreate = () => { setSelectedRequest(null); setIsModalOpen(true); };
    const handleOpenEdit = (r: ShiftChangeRequest) => { setSelectedRequest(r); setIsModalOpen(true); };
    const handleOpenDetail = (r: ShiftChangeRequest) => { setSelectedRequest(r); setIsDetailOpen(true); };

    const hasFilters = !!(statusFilter !== "ALL" || searchInput);
    const clearFilters = () => { setStatusFilter("ALL"); setSearchInput(""); setSearch(""); setPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intercambios de Turno</h1>
                    <p className="text-muted-foreground">Gestiona las solicitudes de cambio de turno entre enfermeras.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Solicitud
                </Button>
            </div>

            {(requests.length > 0 || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Clock className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg"><Clock className="h-4 w-4 text-amber-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Pendientes</p><p className="text-lg font-bold text-amber-600">{stats.pending}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Aprobadas</p><p className="text-lg font-bold text-emerald-600">{stats.approved}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg"><X className="h-4 w-4 text-red-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Rechazadas</p><p className="text-lg font-bold text-red-600">{stats.rejected}</p></div>
                    </div>
                </div>
            )}

            {(requests.length > 0 || hasFilters) && (
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por enfermera o motivo..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setPage(1); }} className="pl-9 pr-9" />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                        <option value="ALL">Todos los Estados</option>
                        {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando solicitudes...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las solicitudes</p>
                    <p className="text-xs text-red-600/80 mt-1">{error?.message || "Error de conexión."}</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Clock className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen solicitudes de cambio de turno.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera solicitud
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>Limpiar filtros</Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowLeftRight className="h-4 w-4 text-primary" /> Solicitudes ({filtered.length}{filtered.length !== requests.length ? ` de ${requests.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Solicitante</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Receptor</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Turno Origen</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Turno Destino</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(r => (
                                        <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-xs">
                                                {r.requester?.user ? `${r.requester.user.firstName} ${r.requester.user.lastName}` : <span className="text-muted-foreground italic">Sin asignar</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold">
                                                {r.receiver?.user ? `${r.receiver.user.firstName} ${r.receiver.user.lastName}` : <span className="text-muted-foreground italic">Sin asignar</span>}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{r.sourceShift?.name || "—"}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{r.targetShift ? r.targetShift.name : "—"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE[r.status] || REQUEST_STATUS_BADGE.AWAITING_OTHER_NURSE}`}>
                                                    {REQUEST_STATUS_LABELS[r.status] || r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{formatDateTime(r.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => handleOpenDetail(r)}>
                                                        <Eye className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

            <ShiftChangeDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
}

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}