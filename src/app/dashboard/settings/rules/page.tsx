"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWorkRules, useRuleGroups } from "@/modules/work-rules/hooks/useWorkRules";
import { WorkRule, WorkRuleCondition, WorkRuleAction, RULE_TYPE_LABELS, RULE_TYPE_BADGE, WorkRuleFilters } from "@/modules/work-rules/types";
import WorkRuleModal from "@/modules/work-rules/components/WorkRuleModal";
import RuleDetailModal from "@/modules/work-rules/components/RuleDetailModal";
import { workRuleService } from "@/modules/work-rules/services/workRuleService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Eye, Search, X, Loader2, ScrollText,
    AlertCircle, Settings2, ShieldCheck, ToggleLeft, ChevronLeft, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";

export default function WorkRulesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<WorkRule | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        isActive: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
        type: typeFilter === "ALL" ? undefined : typeFilter as any,
        page,
        limit: PAGE_SIZE,
    }), [search, typeFilter, activeFilter, page]);

    const [detailConditions, setDetailConditions] = useState<WorkRuleCondition[]>([]);
    const [detailActions, setDetailActions] = useState<WorkRuleAction[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const currentUser = useAuthStore((s) => s.user);

    const {
        rules, meta, isLoading, isFetching, error,
        createRule, isCreating, updateRule, isUpdating, deleteRule,
        createCondition, isCreatingCondition, deleteCondition,
        createAction, isCreatingAction, deleteAction,
    } = useWorkRules(filters);

    const { groups } = useRuleGroups();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleOpenCreate = () => { setSelectedRule(null); setIsModalOpen(true); };
    const handleOpenEdit = (r: WorkRule) => { setSelectedRule(r); setIsModalOpen(true); };

    const handleOpenDetail = async (r: WorkRule) => {
        setSelectedRule(r);
        setIsDetailOpen(true);
        setIsLoadingDetail(true);
        try {
            const [conds, acts] = await Promise.all([
                workRuleService.getConditions(r.id).catch(() => []),
                workRuleService.getActions(r.id).catch(() => []),
            ]);
            setDetailConditions(conds);
            setDetailActions(acts);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                organizationId: data.organizationId || currentUser?.organizationId || "",
            };
            if (selectedRule) {
                await updateRule({ id: selectedRule.id, data: payload });
            } else {
                await createRule(payload);
            }
            setIsModalOpen(false);
        } catch { /* manejado por el hook */ }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta regla? Sus condiciones y acciones asociadas se eliminarán también.")) {
            await deleteRule(id);
        }
    };

    const hasFilters = !!(search || typeFilter !== "ALL" || activeFilter !== "ALL");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setTypeFilter("ALL"); setActiveFilter("ALL"); setPage(1); };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return rules.filter(r => {
            const matchesSearch = !q ||
                r.name.toLowerCase().includes(q) ||
                r.code.toLowerCase().includes(q) ||
                (r.description || "").toLowerCase().includes(q);
            const matchesType = typeFilter === "ALL" || r.type === typeFilter;
            const matchesActive = activeFilter === "ALL" ||
                (activeFilter === "ACTIVE" && r.isActive) ||
                (activeFilter === "INACTIVE" && !r.isActive);
            return matchesSearch && matchesType && matchesActive;
        });
    }, [rules, search, typeFilter, activeFilter]);

    const stats = useMemo(() => ({
        total: rules.length,
        active: rules.filter(r => r.isActive).length,
        hard: rules.filter(r => r.type === "HARD").length,
        groups: groups.length,
    }), [rules, groups]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reglas de Negocio</h1>
                    <p className="text-muted-foreground">Administra las reglas que intervienen en la planificación de turnos.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Regla
                </Button>
            </div>

            {(rules.length > 0 || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><ScrollText className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><ShieldCheck className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Activas</p><p className="text-lg font-bold text-emerald-600">{stats.active}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg"><ToggleLeft className="h-4 w-4 text-red-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Obligatorias</p><p className="text-lg font-bold text-red-600">{stats.hard}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg"><Settings2 className="h-4 w-4 text-purple-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Grupos</p><p className="text-lg font-bold">{stats.groups}</p></div>
                    </div>
                </div>
            )}

            {(rules.length > 0 || meta || hasFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por nombre, código o descripción..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-9" />
                            {searchInput && (
                                <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los tipos</option>
                            {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los estados</option>
                            <option value="ACTIVE">Activas</option>
                            <option value="INACTIVE">Inactivas</option>
                        </select>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                        )}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando reglas de negocio...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las reglas</p>
                    <p className="text-xs text-red-600/80 mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || "Error de conexión."}</p>
                </div>
            ) : rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <ScrollText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen reglas de negocio.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera regla
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
                            <ScrollText className="h-4 w-4 text-primary" /> Reglas ({filtered.length}{filtered.length !== rules.length ? ` de ${rules.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Código</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Nombre</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Valor</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(r => (
                                        <tr key={r.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-bold">{r.code}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{r.name}</p>
                                                {r.description && <p className="text-xs text-muted-foreground truncate max-w-[240px]" title={r.description}>{r.description}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${RULE_TYPE_BADGE[r.type] || RULE_TYPE_BADGE.CONFIGURABLE}`}>
                                                    {RULE_TYPE_LABELS[r.type] || r.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{r.value}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                    {r.isActive ? "Activa" : "Inactiva"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle y configuración" onClick={() => handleOpenDetail(r)}>
                                                        <Eye className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar" onClick={() => handleOpenEdit(r)}>
                                                        <Edit2 className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Eliminar" onClick={() => handleDelete(r.id)}>
                                                        <Trash2 className="h-3 w-3" />
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

            <WorkRuleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                rule={selectedRule}
                isSubmitting={isCreating || isUpdating}
            />

            <RuleDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedRule(null); }}
                rule={selectedRule}
                conditions={detailConditions}
                actions={detailActions}
                isLoadingDetail={isLoadingDetail}
                onCreateCondition={async (d) => { await createCondition(d); }}
                onDeleteCondition={async (id) => { await deleteCondition(id); handleOpenDetail(selectedRule!); }}
                onToggleCondition={async (id, enabled) => { await workRuleService.updateCondition(id, { enabled }); handleOpenDetail(selectedRule!); }}
                onCreateAction={async (d) => { await createAction(d); }}
                onDeleteAction={async (id) => { await deleteAction(id); handleOpenDetail(selectedRule!); }}
                onToggleAction={async (id, enabled) => { await workRuleService.updateAction(id, { enabled }); handleOpenDetail(selectedRule!); }}
                isSaving={isCreatingCondition || isCreatingAction}
            />
        </div>
    );
}