"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useVacations } from "@/modules/vacations/hooks/useVacations";
import { Vacation, VacationStatus, APPROVABLE_STATUSES, VACATION_STATUS_LABELS, VACATION_STATUS_BADGE, VacationFilters } from "@/modules/vacations/types";
import VacationModal from "@/modules/vacations/components/VacationModal";
import VacationApprovalModal from "@/modules/vacations/components/VacationApprovalModal";
import VacationDetailModal from "@/modules/vacations/components/VacationDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Search, X, Loader2, CalendarDays, AlertCircle,
    Trash2, CheckCircle2, CalendarClock, Palmtree, Eye, FileText, Clock, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Pagination } from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return iso.split("T")[0];
}

function calculateDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function VacationsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [nurseFilter, setNurseFilter] = useState<string>("all");
    const [branchFilter, setBranchFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        nurseId: nurseFilter !== "all" ? nurseFilter : undefined,
        branchId: branchFilter !== "all" ? branchFilter : undefined,
        page,
        limit: PAGE_SIZE,
    }), [statusFilter, nurseFilter, branchFilter, page]);

    const {
        vacations, meta, isLoading, isFetching, error,
        createVacation, isCreating,
        updateVacation, isUpdating,
        approveVacation, isApproving,
        deleteVacation, isDeleting
    } = useVacations(filters);

    const { data: nurses = [] } = useQuery({
        queryKey: ["form-nurses"],
        queryFn: async () => (await apiInstance.get("/nurses", { params: { limit: 500 } })).data?.data || (await apiInstance.get("/nurses")).data
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["form-branches"],
        queryFn: async () => (await apiInstance.get("/branches")).data
    });

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleOpenCreate = () => { setSelectedVacation(null); setIsModalOpen(true); };
    const handleOpenEdit = (v: Vacation) => { setSelectedVacation(v); setIsModalOpen(true); };
    const handleOpenDetail = (v: Vacation) => { setSelectedVacation(v); setIsDetailOpen(true); };
    const handleOpenApproval = (v: Vacation) => { setSelectedVacation(v); setIsApprovalOpen(true); };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedVacation) {
                await updateVacation({ id: selectedVacation.id, data });
            } else {
                await createVacation(data);
            }
            setIsModalOpen(false);
        } catch { /* handled by hook */ }
    };

    const handleApprovalSubmit = async (payload: { status: VacationStatus; rejectionReason?: string; notes?: string }) => {
        if (!selectedVacation) return;
        try {
            await approveVacation({ id: selectedVacation!.id, payload });
            setIsApprovalOpen(false);
        } catch { /* handled by hook */ }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta solicitud de vacaciones? Esta acción no se puede deshacer.")) {
            await deleteVacation(id);
        }
    };

    const canApprove = selectedVacation && APPROVABLE_STATUSES.includes(selectedVacation.status);

    const hasActiveFilters = !!(search || statusFilter !== "ALL" || nurseFilter !== "all" || branchFilter !== "all");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setStatusFilter("ALL"); setNurseFilter("all"); setBranchFilter("all"); setPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Vacaciones</h1>
                    <p className="text-muted-foreground">Solicitudes, aprobación y control de días disponibles.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Solicitud
                </Button>
            </div>

            {/* BARRA DE CONTROLES Y FILTRADO */}
            {(vacations.length > 0 || meta) && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por enfermera o motivo..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Estados</SelectItem>
                                {Object.entries(VACATION_STATUS_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={nurseFilter} onValueChange={(value) => { setNurseFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Enfermera" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Enfermeras</SelectItem>
                                {nurses.map((n: any) => <SelectItem key={n.id} value={n.id}>{n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={branchFilter} onValueChange={(value) => { setBranchFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sede" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Sedes</SelectItem>
                                {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                    </div>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                            <X className="h-3 w-3" /> Limpiar filtros
                        </Button>
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
                    <p className="text-sm font-semibold text-red-700">Error al cargar las vacaciones</p>
                    <p className="text-xs text-red-600/80 mt-1 max-w-md">{error?.message || "Error de conexión."}</p>
                </div>
            ) : vacations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Palmtree className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen solicitudes de vacaciones registradas.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Crea la primera solicitud para comenzar.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera solicitud
                    </Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Palmtree className="h-4 w-4 text-primary" />
                            Solicitudes ({vacations.length}{vacations.length !== (meta?.total ?? vacations.length) ? ` de ${meta?.total}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Enfermera</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Sede</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Período</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Días</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Días Disponibles</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Motivo</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Resolución</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vacations.map((v) => {
                                        const days = calculateDays(v.startDate, v.endDate);
                                        const status = v.status as VacationStatus;
                                        const availableDays = v.nurse?.vacationDaysAvailable ?? 0;
                                        const takenDays = v.nurse?.vacationDaysTaken ?? 0;
                                        const showApproval = APPROVABLE_STATUSES.includes(status);
                                        const resolutionInfo = v.approvedById ? {
                                            by: v.approvedBy ? `${v.approvedBy.firstName} ${v.approvedBy.lastName}` : "—",
                                            at: v.approvedAt ? formatDate(v.approvedAt) : "—",
                                            reason: v.rejectionReason || v.notes || "—"
                                        } : null;

                                        return (
                                            <tr key={v.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{v.nurse?.user?.firstName} {v.nurse?.user?.lastName}</div>
                                                    <div className="text-xs text-muted-foreground">{v.nurse?.department?.name}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {v.branch?.name || v.nurse?.branch?.name || "Sin sede"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {formatDate(v.startDate)} - {formatDate(v.endDate)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-primary">{days}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{availableDays}</span>
                                                        <span className="text-muted-foreground mx-1">/</span>
                                                        <span className="text-rose-600 dark:text-rose-400">{takenDays}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm max-w-xs truncate" title={v.reason}>{v.reason || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${VACATION_STATUS_BADGE[status] || VACATION_STATUS_BADGE.DRAFT}`}>
                                                        {VACATION_STATUS_LABELS[status] || status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {resolutionInfo ? (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{resolutionInfo.by} · {resolutionInfo.at}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => handleOpenDetail(v)}>
                                                            <Eye className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar" onClick={() => handleOpenEdit(v)}>
                                                            <Edit2 className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                        {showApproval && canApprove && (
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Aprobar/Rechazar" onClick={() => handleOpenApproval(v)}>
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Eliminar" onClick={() => handleDelete(v.id)}>
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

            <VacationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                vacation={selectedVacation}
                isSubmitting={isCreating || isUpdating}
                nurses={nurses}
            />

            <VacationApprovalModal
                isOpen={isApprovalOpen}
                onClose={() => setIsApprovalOpen(false)}
                onApprove={(id, payload) => handleApprovalSubmit(payload as any)}
                isProcessing={isApproving}
                vacation={selectedVacation}
                
            />

            <VacationDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                vacation={selectedVacation}
            />
        </div>
    );
}