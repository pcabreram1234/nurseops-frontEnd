"use client";

import { useState, useMemo } from "react";
import {
    useShiftChanges,
    useReceivedShiftChanges,
    useCoverageOpportunities,
    useShiftChangeStats,
} from "@/modules/shift-changes/hooks/useShiftChanges";
import {
    ShiftChangeRequest,
    REQUEST_STATUS_LABELS,
    REQUEST_STATUS_BADGE,
    OPERATION_TYPE_LABELS,
    OPERATION_TYPE_BADGE,
    resolvePersonName,
    formatDateTime,
    formatTime,
} from "@/modules/shift-changes/types";
import ShiftChangeDetailModal from "@/modules/shift-changes/components/ShiftChangeDetailModal";
import ShiftChangeCreateModal from "@/modules/shift-changes/components/ShiftChangeCreateModal";
import ShiftChangeRespondModal from "@/modules/shift-changes/components/ShiftChangeRespondModal";
import ShiftChangeApplyModal from "@/modules/shift-changes/components/ShiftChangeApplyModal";
import CoverageApplicationModal from "@/modules/shift-changes/components/CoverageApplicationModal";
import CandidateSelectionModal from "@/modules/shift-changes/components/CandidateSelectionModal";
import {
    Button,
} from "@/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, X, Loader2, AlertCircle, Eye, Clock,
    CheckCircle2, ArrowLeftRight, Users, Building2,
    ShieldCheck, History, Timer, Activity
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";
import { toast } from "sonner";
import { shiftChangeService } from "@/modules/shift-changes/services/shiftChangeService";

const APPROVER_ROLES = ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"];

type TabKey = "my" | "received" | "opportunities" | "history" | "approvals";

const TABS: { key: TabKey; label: string; icon: any; requiredRoles?: string[] }[] = [
    { key: "my", label: "Mis Solicitudes", icon: Clock, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
    { key: "received", label: "Solicitudes Recibidas", icon: Users, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
    { key: "opportunities", label: "Oportunidades", icon: Activity, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
    { key: "history", label: "Historial", icon: History, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
    { key: "approvals", label: "Aprobaciones", icon: ShieldCheck, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
];

export default function ShiftChangesPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("my");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRespondOpen, setIsRespondOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isCoverageApplyOpen, setIsCoverageApplyOpen] = useState(false);
    const [isCandidateSelectOpen, setIsCandidateSelectOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ShiftChangeRequest | null>(null);

    const { user } = useAuthStore();
    const canApprove = !!user?.role && APPROVER_ROLES.includes(user.role);
    const canCreate = !!user?.role;

    // Filtros para cada pestaña
    const [mySearch, setMySearch] = useState("");
    const [myStatus, setMyStatus] = useState<string>("ALL");
    const [myPage, setMyPage] = useState(1);

    const [receivedSearch, setReceivedSearch] = useState("");
    const [receivedStatus, setReceivedStatus] = useState<string>("ALL");
    const [receivedPage, setReceivedPage] = useState(1);

    const [oppSearch, setOppSearch] = useState("");
    const [oppPage, setOppPage] = useState(1);

    const PAGE_SIZE = 25;

    const {
        requests: myRequests,
        meta: myMeta,
        isLoading: myLoading,
        error: myError,
        createRequest,
        isCreating,
        respondRequest,
        isResponding: isRespondingMy,
        approveRequest,
        isApproving,
        applyRequest,
        isApplying,
        rejectRequest,
        isRejecting,
        cancelRequest,
    } = useShiftChanges({
        status: myStatus !== "ALL" ? myStatus : undefined,
        search: mySearch || undefined,
        page: myPage,
        // limit: PAGE_SIZE,
    });

    const {
        requests: receivedRequests,
        meta: receivedMeta,
        isLoading: receivedLoading,
        respondRequest: respondReceivedRequest,
        isResponding: isRespondingReceived,
    } = useReceivedShiftChanges({
        status: receivedStatus !== "ALL" ? receivedStatus : undefined,
        search: receivedSearch || undefined,
        page: receivedPage,
        // limit: PAGE_SIZE,
    });

    const {
        opportunities,
        meta: opportunitiesMeta,
        isLoading: opportunitiesLoading,
    } = useCoverageOpportunities({
        search: oppSearch || undefined,
        page: oppPage,
        // limit: PAGE_SIZE,
    });

    const { stats: globalStats, isLoading: statsLoading } = useShiftChangeStats();

    const visibleTabs = TABS.filter(t => !t.requiredRoles || t.requiredRoles.includes(user?.role || ""));

    // Tab data
    const tabData = useMemo(() => {
        switch (activeTab) {
            case "my":
                return { requests: myRequests, meta: myMeta, loading: myLoading, error: myError, page: myPage, setPage: setMyPage };
            case "received":
                return { requests: receivedRequests, meta: receivedMeta, loading: receivedLoading, error: null, page: receivedPage, setPage: setReceivedPage };
            case "opportunities":
                return { requests: opportunities, meta: opportunitiesMeta, loading: opportunitiesLoading, error: null, page: oppPage, setPage: setOppPage };
            default:
                return { requests: myRequests, meta: myMeta, loading: myLoading, error: myError, page: myPage, setPage: setMyPage };
        }
    }, [activeTab, myRequests, myMeta, myLoading, myError, myPage, receivedRequests, receivedMeta, receivedLoading, receivedPage, opportunities, opportunitiesMeta, opportunitiesLoading, oppPage]);

    const handleOpenCreate = () => {
        setSelectedRequest(null);
        setIsModalOpen(true);
    };

    const handleOpenDetail = (r: ShiftChangeRequest) => {
        setSelectedRequest(r);
        setIsDetailOpen(true);
    };

    const handleOpenRespond = (r: ShiftChangeRequest) => {
        setSelectedRequest(r);
        setIsRespondOpen(true);
    };

    const handleOpenApply = (r: ShiftChangeRequest) => {
        setSelectedRequest(r);
        setIsApplyOpen(true);
    };

    const handleOpenCoverageApply = (r: ShiftChangeRequest) => {
        setSelectedRequest(r);
        setIsCoverageApplyOpen(true);
    };

    const handleOpenCandidateSelect = (r: ShiftChangeRequest) => {
        setSelectedRequest(r);
        setIsCandidateSelectOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            await createRequest(data);
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    const handleRespond = async (decision: "APPROVED" | "REJECTED", comments?: string) => {
        if (!selectedRequest) return;
        try {
            await respondRequest({ id: selectedRequest.id, payload: { decision, comments } });
            setIsRespondOpen(false);
            setSelectedRequest(null);
        } catch {
            /* error ya notificado */
        }
    };

    const handleApply = async () => {
        if (!selectedRequest) return;
        try {
            await applyRequest({ id: selectedRequest.id, payload: {} });
            setIsApplyOpen(false);
            setSelectedRequest(null);
        } catch {
            /* error ya notificado */
        }
    };

    const handleCoverageApply = async () => {
        if (!selectedRequest) return;
        try {
            await shiftChangeService.applyToCoverage(selectedRequest.id);
            setIsCoverageApplyOpen(false);
            setSelectedRequest(null);
        } catch {
            /* error ya notificado */
        }
    };

    const handleSelectCandidate = async (candidateNurseId: string) => {
        if (!selectedRequest) return;
        try {
            await shiftChangeService.selectCandidate(selectedRequest.id, { candidateNurseId });
            setIsCandidateSelectOpen(false);
            setSelectedRequest(null);
        } catch {
            /* error ya notificado */
        }
    };

    const statsData = globalStats || { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0, coverageOpportunities: 0 };

    const renderEmptyState = (Icon: any, title: string, subtitle: string, actionLabel?: string, onAction?: () => void) => (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
            <Icon className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            {actionLabel && onAction && (
                <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onAction}>
                    <Plus className="h-3.5 w-3.5" /> {actionLabel}
                </Button>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intercambio de Turnos</h1>
                    <p className="text-muted-foreground">
                        Gestione solicitudes de intercambio, cesión y cobertura de turnos de enfermería.
                    </p>
                </div>
                {canCreate && activeTab !== "approvals" && activeTab !== "history" && (
                    <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center" disabled={isCreating}>
                        <Plus className="h-4 w-4" /> Nueva Solicitud
                    </Button>
                )}
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    icon={Clock}
                    label="Mis Solicitudes"
                    value={statsData.total}
                    color="blue"
                />
                <StatCard
                    icon={Timer}
                    label="Pendientes"
                    value={statsData.pending}
                    color="amber"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Aprobadas"
                    value={statsData.approved}
                    color="emerald"
                />
                <StatCard
                    icon={Activity}
                    label="Oportunidades"
                    value={statsData.coverageOpportunities}
                    color="orange"
                />
            </div>

            {/* Pestañas */}
            <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon as React.ComponentType<any>;
                        return (
                            <TabsTrigger
                                key={tab.key}
                                value={tab.key}
                                className="flex flex-col items-center gap-1 px-2 py-3 text-sm"
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {activeTab === "my" && (
                    <TabsContent value="my" className="mt-4">
                        <MyRequestsSection />
                    </TabsContent>
                )}
                {activeTab === "received" && (
                    <TabsContent value="received" className="mt-4">
                        <ReceivedRequestsSection />
                    </TabsContent>
                )}
                {activeTab === "opportunities" && (
                    <TabsContent value="opportunities" className="mt-4">
                        <OpportunitiesSection />
                    </TabsContent>
                )}
                {activeTab === "history" && (
                    <TabsContent value="history" className="mt-4">
                        <HistorySection />
                    </TabsContent>
                )}
                {activeTab === "approvals" && canApprove && (
                    <TabsContent value="approvals" className="mt-4">
                        <ApprovalsSection />
                    </TabsContent>
                )}
            </Tabs>

            {/* Modales */}
            <ShiftChangeCreateModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedRequest(null); }}
                onSubmit={handleFormSubmit}
                shift={null}
                isSubmitting={isCreating}
                userRole={user?.role ?? null}
                currentUserId={user?.id ?? null}
            />

            <ShiftChangeDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedRequest(null); }}
                request={selectedRequest}
                canApprove={canApprove}
                onApprove={(notes) => approveRequest({ id: selectedRequest!.id, payload: { supervisorNotes: notes } }).then(() => {})}
                onReject={(reason) => rejectRequest({ id: selectedRequest!.id, payload: { reason } }).then(() => {})}
                isActing={isApproving || isRejecting}
            />

            <ShiftChangeRespondModal
                isOpen={isRespondOpen}
                onClose={() => { setIsRespondOpen(false); setSelectedRequest(null); }}
                request={selectedRequest}
                onResponded={() => { /* refresh handled by mutations */ }}
                isActing={isRespondingMy || isRespondingReceived}
            />

            <ShiftChangeApplyModal
                isOpen={isApplyOpen}
                onClose={() => { setIsApplyOpen(false); setSelectedRequest(null); }}
                request={selectedRequest}
                onApplied={() => { /* refresh handled by mutations */ }}
                isActing={isApplying}
            />

            <CoverageApplicationModal
                isOpen={isCoverageApplyOpen}
                onClose={() => { setIsCoverageApplyOpen(false); setSelectedRequest(null); }}
                request={selectedRequest}
                onApplied={() => { /* refresh handled by mutations */ }}
                isActing={false}
            />

            <CandidateSelectionModal
                isOpen={isCandidateSelectOpen}
                onClose={() => { setIsCandidateSelectOpen(false); setSelectedRequest(null); }}
                request={selectedRequest}
                onSelected={() => { /* refresh handled by mutations */ }}
                isActing={false}
            />
        </div>
    );

    /* ==================== SECCIONES DE PESTAÑAS ==================== */

    function MyRequestsSection() {
        const { requests, meta, loading, error, page, setPage } = tabData as any;

        const filtered = useMemo(() => {
            const q = mySearch.toLowerCase();
            const s = myStatus;
            return requests.filter((r: ShiftChangeRequest) => {
                const matchSearch = !q ||
                    resolvePersonName(r.requester, r.requesterId).toLowerCase().includes(q) ||
                    (r.reason || "").toLowerCase().includes(q);
                const matchStatus = s === "ALL" || r.status === s;
                return matchSearch && matchStatus;
            });
        }, [requests, mySearch, myStatus]);

        if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin" /> Cargando...</div>;
        if (error) return renderEmptyState(AlertCircle, "Error al cargar", error.message || "Error de conexión.");

        if (requests.length === 0) {
            return renderEmptyState(
                Clock,
                "No tiene solicitudes de cambio de turno.",
                "Cree su primera solicitud para intercambiar, ceder o solicitar cobertura de un turno.",
                "Crear Solicitud",
                handleOpenCreate,
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                    <Button variant="ghost" size="sm" onClick={() => { setMySearch(""); setMyStatus("ALL"); setMyPage(1); }}>
                        <X className="h-3 w-3" /> Limpiar filtros
                    </Button>
                </div>
            );
        }

        return (
            <div>
                <div className="flex flex-wrap gap-3 mb-4">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por enfermera o motivo..."
                            value={mySearch}
                            onChange={(e) => { setMySearch(e.target.value); setMyPage(1); }}
                            className="pl-9 pr-9"
                        />
                    </div>
                    <select value={myStatus} onChange={(e) => { setMyStatus(e.target.value); setMyPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                        <option value="ALL">Todos los Estados</option>
                        {Object.entries(REQUEST_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ArrowLeftRight className="h-4 w-4" /> Mis Solicitudes ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Solicitud</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Turno Origen</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Turno Destino</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r: ShiftChangeRequest) => (
                                        <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-xs">
                                                {resolvePersonName(r.requester, r.requesterId)}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${OPERATION_TYPE_BADGE[r.operationType as keyof typeof OPERATION_TYPE_BADGE] || OPERATION_TYPE_BADGE.SWAP}`}>
                                                    {OPERATION_TYPE_LABELS[r.operationType as keyof typeof OPERATION_TYPE_LABELS]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {r.sourceScheduleEntry?.shift?.name || r.sourceShiftId || "—"}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {r.targetScheduleEntry?.shift?.name || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE[r.status as keyof typeof REQUEST_STATUS_BADGE] || REQUEST_STATUS_BADGE.AWAITING_OTHER_NURSE}`}>
                                                    {REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS] || r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{formatDateTime(r.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDetail(r)}>
                                                        <Eye className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    {r.status === "AWAITING_OTHER_NURSE" && r.receiverId === user?.sub && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => handleOpenRespond(r)}>
                                                            <Clock className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    {canApprove && (r.status === "ACCEPTED_BY_NURSE" || r.status === "UNDER_SUPVERSION") && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleOpenApply(r)}>
                                                            <ShieldCheck className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                onPageChange={(p) => setMyPage(p)}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    function ReceivedRequestsSection() {
        const { requests, meta, loading } = tabData as any;

        const filtered = useMemo(() => {
            const q = receivedSearch.toLowerCase();
            const s = receivedStatus;
            return requests.filter((r: ShiftChangeRequest) => {
                const matchSearch = !q || resolvePersonName(r.requester, r.requesterId).toLowerCase().includes(q);
                const matchStatus = s === "ALL" || r.status === s;
                return matchSearch && matchStatus;
            });
        }, [requests, receivedSearch, receivedStatus]);

        if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin" /> Cargando...</div>;

        if (requests.length === 0) {
            return renderEmptyState(
                Users,
                "No tiene solicitudes recibidas.",
                "Las solicitudes de otros compañeros aparecerán aquí cuando le envíen una invitación.",
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                </div>
            );
        }

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" /> Solicitudes Recibidas ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Solicitante</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Turno</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha Límite</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r: ShiftChangeRequest) => (
                                    <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-xs">
                                            {resolvePersonName(r.requester, r.requesterId)}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${OPERATION_TYPE_BADGE[r.operationType as keyof typeof OPERATION_TYPE_BADGE] || OPERATION_TYPE_BADGE.SWAP}`}>
                                                {OPERATION_TYPE_LABELS[r.operationType as keyof typeof OPERATION_TYPE_LABELS]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {r.sourceScheduleEntry?.shift?.name || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE[r.status as keyof typeof REQUEST_STATUS_BADGE] || REQUEST_STATUS_BADGE.AWAITING_OTHER_NURSE}`}>
                                                {REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS] || r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {r.expiresAt ? formatDateTime(r.expiresAt) : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 justify-end">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDetail(r)}>
                                                    <Eye className="h-3 w-3 text-slate-500" />
                                                </Button>
                                                {r.status === "AWAITING_OTHER_NURSE" && r.receiverId === user?.sub && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => handleOpenRespond(r)}>
                                                        <Clock className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {meta && meta.totalPages > 1 && (
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={(p) => setReceivedPage(p)}
                        />
                    )}
                </CardContent>
            </Card>
        );
    }

    function OpportunitiesSection() {
        const { requests: opportunities, meta, loading } = tabData as any;

        const filtered = useMemo(() => {
            const q = oppSearch.toLowerCase();
            return opportunities.filter((r: ShiftChangeRequest) => {
                if (!q) return true;
                return (
                    resolvePersonName(r.requester, r.requesterId).toLowerCase().includes(q) ||
                    (r.sourceScheduleEntry?.shift?.name || "").toLowerCase().includes(q) ||
                    (r.sourceScheduleEntry?.shiftTemplate?.department?.name || "").toLowerCase().includes(q)
                );
            });
        }, [opportunities, oppSearch]);

        if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin" /> Cargando...</div>;

        if (opportunities.length === 0) {
            return renderEmptyState(
                Activity,
                "No hay oportunidades de cobertura disponibles.",
                "Las solicitudes de cobertura publicadas por otros compañeros aparecerán aquí.",
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                </div>
            );
        }

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Oportunidades de Cobertura ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="relative flex-1 min-w-[240px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por solicitud, turno o departamento..."
                                value={oppSearch}
                                onChange={(e) => { setOppSearch(e.target.value); setOppPage(1); }}
                                className="pl-9 pr-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((r: ShiftChangeRequest) => (
                            <div key={r.id} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${OPERATION_TYPE_BADGE[r.operationType as keyof typeof OPERATION_TYPE_BADGE] || OPERATION_TYPE_BADGE.COVERAGE}`}>
                                        {OPERATION_TYPE_LABELS[r.operationType as keyof typeof OPERATION_TYPE_LABELS]}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE.PUBLISHED.replace("bg-blue", "bg-emerald").replace("text-blue", "text-emerald")}`}>
                                        Disponible
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Turno</span>
                                        <p className="text-sm font-semibold">{r.sourceScheduleEntry?.shift?.name || "—"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Fecha</span>
                                        <p className="text-sm font-semibold">
                                            {r.sourceScheduleEntry?.date ? new Date(r.sourceScheduleEntry.date).toLocaleDateString("es-ES") : "—"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Horario</span>
                                        <p className="text-sm font-semibold">
                                            {formatTime(r.sourceScheduleEntry?.shift?.startTime)} - {formatTime(r.sourceScheduleEntry?.shift?.endTime)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Departamento</span>
                                        <p className="text-sm font-semibold">
                                            {r.sourceScheduleEntry?.shiftTemplate?.department?.name || "—"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Solicitante</span>
                                        <p className="text-sm font-semibold truncate max-w-[120px]">
                                            {resolvePersonName(r.requester, r.requesterId)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Límite</span>
                                        <p className="text-sm font-semibold">
                                            {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("es-ES") : "—"}
                                        </p>
                                    </div>
                                </div>

                                {r.reason && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-muted-foreground italic">{r.reason}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleOpenCoverageApply(r)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                        disabled={["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"].includes(user?.role || "") && r.requesterId === user?.sub}
                                    >
                                        Postularse
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenDetail(r)}
                                        className="flex-1 text-xs"
                                    >
                                        Ver Detalle
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {meta && meta.totalPages > 1 && (
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={(p) => setOppPage(p)}
                        />
                    )}
                </CardContent>
            </Card>
        );
    }

    function HistorySection() {
        // El historial usa las mismas solicitudes de "Mis solicitudes" pero mostrando todas las estados
        const { requests, meta, loading, page, setPage } = tabData as any;

        if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin" /> Cargando...</div>;

        if (requests.length === 0) {
            return renderEmptyState(
                History,
                "No hay historial de operaciones.",
                "Las operaciones completadas aparecerán aquí una vez que se aprueben y apliquen.",
            );
        }

        const completedRequests = requests.filter(
            (r: ShiftChangeRequest) =>
                r.status === "COMPLETED" || r.status === "REJECTED" || r.status === "CANCELLED" || r.status === "EXPIRED" || r.status === "ROLLED_BACK",
        );

        if (completedRequests.length === 0) {
            return renderEmptyState(
                History,
                "No hay operaciones finalizadas.",
                "Todas sus solicitudes están en curso o no se han completado aún.",
            );
        }

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" /> Historial de Operaciones ({completedRequests.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Solicitud</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Resultado</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Fecha</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedRequests.map((r: ShiftChangeRequest) => (
                                    <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-xs">
                                            {resolvePersonName(r.requester, r.requesterId)}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {OPERATION_TYPE_LABELS[r.operationType as keyof typeof OPERATION_TYPE_LABELS]}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                {REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{formatDateTime(r.updatedAt || r.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDetail(r)}>
                                                <Eye className="h-3 w-3 text-slate-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {meta && meta.totalPages > 1 && (
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={(p) => setPage(p)}
                        />
                    )}
                </CardContent>
            </Card>
        );
    }

    function ApprovalsSection() {
        const { requests, loading } = tabData as any;

        const pendingApprovals = requests.filter(
            (r: ShiftChangeRequest) =>
                r.status === "ACCEPTED_BY_NURSE" || r.status === "UNDER_SUPVERSION" || r.status === "AWAITING_OTHER_NURSE",
        );

        if (loading) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin" /> Cargando...</div>;

        if (pendingApprovals.length === 0) {
            return renderEmptyState(
                ShieldCheck,
                "No tiene solicitudes pendientes de aprobación.",
                "Todas las solicitudes bajo su supervisión han sido procesadas.",
            );
        }

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Solicitudes Pendientes de Aprobación ({pendingApprovals.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-3">
                        {pendingApprovals.map((r: ShiftChangeRequest) => (
                            <div key={r.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{resolvePersonName(r.requester, r.requesterId)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {OPERATION_TYPE_LABELS[r.operationType as keyof typeof OPERATION_TYPE_LABELS]} •
                                            {r.sourceScheduleEntry?.shift?.name || "—"}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE[r.status as keyof typeof REQUEST_STATUS_BADGE]}`}>
                                        {REQUEST_STATUS_LABELS[r.status as keyof typeof REQUEST_STATUS_LABELS]}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <p className="text-muted-foreground">
                                        {r.sourceScheduleEntry?.date ? new Date(r.sourceScheduleEntry.date).toLocaleDateString("es-ES") : "—"} •
                                        {formatTime(r.sourceScheduleEntry?.shift?.startTime)} - {formatTime(r.sourceScheduleEntry?.shift?.endTime)}
                                    </p>
                                    {r.reason && <p className="text-xs text-muted-foreground italic">{r.reason}</p>}
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" onClick={() => handleOpenDetail(r)} className="flex-1">
                                        Ver Detalle
                                    </Button>
                                    {r.status === "ACCEPTED_BY_NURSE" || r.status === "UNDER_SUPVERSION" ? (
                                        <Button size="sm" onClick={() => handleOpenApply(r)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                            Aplicar Cambio
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => handleOpenRespond(r)} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                                            Responder
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
        const colorConfig: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string; darkText: string }> = {
            blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", darkBg: "dark:bg-blue-950/10", darkBorder: "dark:border-blue-900", darkText: "dark:text-blue-400" },
            amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", darkBg: "dark:bg-amber-950/10", darkBorder: "dark:border-amber-900", darkText: "dark:text-amber-400" },
            emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", darkBg: "dark:bg-emerald-950/10", darkBorder: "dark:border-emerald-900", darkText: "dark:text-emerald-400" },
            orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", darkBg: "dark:bg-orange-950/10", darkBorder: "dark:border-orange-900", darkText: "dark:text-orange-400" },
        };
        const c = colorConfig[color] || colorConfig.blue;

        return (
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${c.bg} ${c.border} dark:${c.darkBg} dark:${c.darkBorder}`}>
                <div className={`p-2 rounded-lg ${c.text.replace("text-", "bg-")} ${c.darkText.replace("text-", "dark:bg-")}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400">{label}</p>
                    <p className="text-lg font-bold ${c.text} ${c.darkText}">{value}</p>
                </div>
            </div>
        );
    }
}
