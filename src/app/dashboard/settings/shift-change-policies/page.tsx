"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    shiftChangePolicyService,
    ShiftChangePolicy,
    ShiftChangePolicyFilters,
} from "@/modules/shift-changes/services/shiftChangePolicyService";
import {
    Button,
} from "@/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Search, X, Loader2, AlertCircle, Edit2, Trash2, Eye,
    ToggleLeft, Settings2, Shield,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";
import ShiftChangePolicyModal from "./ShiftChangePolicyModal";

const APPROVER_ROLES = ["SUPER", "ADMIN"];

export default function ShiftChangePoliciesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<ShiftChangePolicy | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [branchFilter, setBranchFilter] = useState<string>("ALL");
    const [deptFilter, setDeptFilter] = useState<string>("ALL");
    const [enabledFilter, setEnabledFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;
    const [policiesData, setPoliciesData] = useState<{ data: ShiftChangePolicy[]; meta: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuthStore();
    const canManage = APPROVER_ROLES.includes(user?.role || "");

    const fetchPolicies = async (filters: ShiftChangePolicyFilters) => {
        setIsLoading(true);
        try {
            const result = await shiftChangePolicyService.getAll(filters);
            setPoliciesData(result);
        } catch {
            setPoliciesData({ data: [], meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 } });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const filters: ShiftChangePolicyFilters = {
            search: search || undefined,
            branchId: branchFilter !== "ALL" ? branchFilter : undefined,
            departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
            enabled: enabledFilter !== "ALL" ? enabledFilter === "true" : undefined,
            page,
            limit: PAGE_SIZE,
        };
        fetchPolicies(filters);
    }, [search, branchFilter, deptFilter, enabledFilter, page]);

    const policies = policiesData?.data || [];
    const meta = policiesData?.meta;

    const handleOpenCreate = () => { setSelectedPolicy(null); setIsModalOpen(true); };
    const handleOpenEdit = (p: ShiftChangePolicy) => { setSelectedPolicy(p); setIsModalOpen(true); };
    const handleOpenDetail = (p: ShiftChangePolicy) => { setSelectedPolicy(p); setIsDetailOpen(true); };

    const handleFormSubmit = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
        setIsModalOpen(false);
        setSelectedPolicy(null);
        // Recargar políticas
        const filters: ShiftChangePolicyFilters = {
            search: search || undefined,
            branchId: branchFilter !== "ALL" ? branchFilter : undefined,
            departmentId: deptFilter !== "ALL" ? deptFilter : undefined,
            enabled: enabledFilter !== "ALL" ? enabledFilter === "true" : undefined,
            page: 1,
            limit: PAGE_SIZE,
        };
        fetchPolicies(filters);
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta política? Esta acción no se puede deshacer.")) {
            try {
                await shiftChangePolicyService.remove(id);
                setPage(1);
            } catch { /* error manejado por interceptor global */ }
        }
    };

    const hasFilters = !!(
        search ||
        branchFilter !== "ALL" ||
        deptFilter !== "ALL" ||
        enabledFilter !== "ALL"
    );
    const clearFilters = () => {
        setSearchInput("");
        setSearch("");
        setBranchFilter("ALL");
        setDeptFilter("ALL");
        setEnabledFilter("ALL");
        setPage(1);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return policies.filter((p: ShiftChangePolicy) => {
            const matchesSearch = !q ||
                (p.organization?.name || "").toLowerCase().includes(q) ||
                (p.branch?.name || "").toLowerCase().includes(q) ||
                (p.department?.name || "").toLowerCase().includes(q);
            const matchesBranch = branchFilter === "ALL" || p.branchId === branchFilter;
            const matchesDept = deptFilter === "ALL" || p.departmentId === deptFilter;
            const matchesEnabled = enabledFilter === "ALL" ||
                (enabledFilter === "true" && p.enabled) ||
                (enabledFilter === "false" && !p.enabled);
            return matchesSearch && matchesBranch && matchesDept && matchesEnabled;
        });
    }, [policies, search, branchFilter, deptFilter, enabledFilter]);

    const stats = useMemo(() => ({
        total: policies.length,
        enabled: policies.filter(p => p.enabled).length,
        disabled: policies.filter(p => !p.enabled).length,
    }), [policies]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const scopeLabel = (p: ShiftChangePolicy) => {
        if (p.departmentId && p.department?.name) return `Depto: ${p.department.name}`;
        if (p.branchId && p.branch?.name) return `Sede: ${p.branch.name}`;
        return "Organización";
    };

    return (
        <>
            <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Políticas de Cambio de Turno</h1>
                    <p className="text-muted-foreground">
                        Administra las reglas que rigen los intercambios, cesiones y coberturas de turnos por organización, sede y departamento.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                        <Plus className="h-4 w-4" /> Nueva Política
                    </Button>
                )}
            </div>

            {(policies.length > 0 || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Settings2 className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><ToggleLeft className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Habilitadas</p><p className="text-lg font-bold text-emerald-600">{stats.enabled}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg"><ToggleLeft className="h-4 w-4 text-red-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Deshabilitadas</p><p className="text-lg font-bold text-red-600">{stats.disabled}</p></div>
                    </div>
                </div>
            )}

            {(policies.length > 0 || meta || hasFilters) && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por organización, sede o departamento..."
                                value={searchInput}
                                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                                className="pl-9 pr-9"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => { setSearchInput(""); setPage(1); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select
                            value={enabledFilter}
                            onChange={(e) => { setEnabledFilter(e.target.value); setPage(1); }}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800"
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="true">Habilitadas</option>
                            <option value="false">Deshabilitadas</option>
                        </select>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
                                <X className="h-3 w-3" /> Limpiar
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando políticas...
                </div>
            ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Settings2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                        No existen políticas de cambio de turno.
                    </p>
                    {canManage && (
                        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                            <Plus className="h-3.5 w-3.5" /> Crear primera política
                        </Button>
                    )}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
                        <X className="h-3 w-3" /> Limpiar filtros
                    </Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" /> Políticas ({filtered.length}{filtered.length !== policies.length ? ` de ${policies.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Organización</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Sede</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Departamento</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Alcance</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p: ShiftChangePolicy) => (
                                        <tr key={p.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-xs">
                                                {p.organization?.name || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {p.branch?.name || <span className="text-muted-foreground italic">Todas</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {p.department?.name || <span className="text-muted-foreground italic">Todos</span>}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {scopeLabel(p)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    p.enabled
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                                                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900"
                                                }`}>
                                                    {p.enabled ? "Habilitada" : "Deshabilitada"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title="Ver detalle"
                                                        onClick={() => handleOpenDetail(p)}
                                                    >
                                                        <Eye className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    {canManage && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Editar"
                                                            onClick={() => handleOpenEdit(p)}
                                                        >
                                                            <Edit2 className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                    )}
                                                    {canManage && p.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive"
                                                            title="Eliminar"
                                                            onClick={() => handleDelete(p.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
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
                                onPageChange={setPage}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>

        <ShiftChangePolicyModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedPolicy(null);
            }}
            onSuccess={handleFormSubmit}
            policy={selectedPolicy}
        />
        </>
    );
}
