"use client"

import React, { useState, useMemo } from "react";
import { useRestrictions } from "@/modules/restrictions/hooks/useRestrictions";
import { RestrictionFormModal } from "@/modules/restrictions/components/RestrictionFormModal";
import { RestrictionTypeFormModal } from "@/modules/restrictions/components/RestrictionTypeFormModal";
import { useNurses } from "@/modules/nurses/hooks/useNurses";
import { RestrictionFilters } from "@/modules/restrictions/types";
import { Pagination } from "@/components/Pagination";
import { Search, X, Loader2, ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RestrictionsPage() {
    const [activeTab, setActiveTab] = useState<"assignments" | "catalog">("assignments");
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [nurseFilter, setNurseFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        nurseId: nurseFilter !== "all" ? nurseFilter : undefined,
        restrictionTypeId: typeFilter !== "all" ? typeFilter : undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, nurseFilter, typeFilter, page]);

    const {
        restrictions,
        types,
        meta,
        loading,
        isFetching,
        error,
        saveRestriction,
        saveType,
        removeType
    } = useRestrictions(filters);

    const { nurses } = useNurses();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Estados para el Modal de Asignaciones (Grupo estructurado)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestrictionGroup, setSelectedRestrictionGroup] = useState<any | null>(null);

    // Estados para el Modal del Catálogo (NurseRestrictionType)
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<any | null>(null);

    // AGRUPACIÓN VISUAL EN TIEMPO REAL
    const groupedAssignments = useMemo(() => {
        const groups: Record<string, any> = {};

        restrictions.forEach(curr => {
            const typeId = curr.restrictionTypeId;
            if (!groups[typeId]) {
                groups[typeId] = {
                    ...curr,
                    nursesData: [curr.nurse],
                    nurseIds: [curr.nurseId]
                };
            } else {
                groups[typeId].nursesData.push(curr.nurse);
                groups[typeId].nurseIds.push(curr.nurseId);
            }
        });

        return Object.values(groups);
    }, [restrictions]);

    const handleEditGroup = (group: any) => {
        setSelectedRestrictionGroup(group);
        setIsModalOpen(true);
    };

    const handleNewGroup = () => {
        setSelectedRestrictionGroup(null);
        setIsModalOpen(true);
    };

    const handleEditType = (type: any) => {
        setSelectedType(type);
        setIsTypeModalOpen(true);
    };

    const handleNewType = () => {
        setSelectedType(null);
        setIsTypeModalOpen(true);
    };

    // 🌟 NUEVA FUNCIÓN: Eliminar por completo el lote de asignaciones usando la lógica de sincronización masiva
    const handleRevokeGroup = async (group: any) => {
        const confirmClear = window.confirm(
            `¿Está seguro de revocar esta restricción (${group.restrictionType?.code}) para TODAS las enfermeras asignadas? \nEsta acción vaciará el lote por completo.`
        );
        if (!confirmClear) return;

        // Mandar el payload con "nurseIds" vacío limpia transaccionalmente el tipo en el backend
        const emptyPayload = {
            restrictionTypeId: group.restrictionTypeId,
            nurseIds: [],
            isTemporary: group.isTemporary,
            isActive: false,
            notes: "LOTE REVOCADO DESDE ADMINISTRACIÓN"
        };

        await saveRestriction(emptyPayload);
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300";
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300";
            case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300";
            default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
        }
    };

    const hasActiveFilters = !!(search || nurseFilter !== "all" || typeFilter !== "all");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setNurseFilter("all"); setTypeFilter("all"); setPage(1); };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Restricciones Operativas y de Salud</h1>
                    <p className="text-muted-foreground">Administración de condiciones clínicas y limitaciones del personal asistencial.</p>
                </div>
                <div>
                    {activeTab === "assignments" ? (
                        <button onClick={handleNewGroup} className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 font-medium shadow-sm transition-all flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Sincronizar Restricción Masiva
                        </button>
                    ) : (
                        <button onClick={handleNewType} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 font-medium shadow-sm transition-all flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Nuevo Tipo de Restricción
                        </button>
                    )}
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
                <button onClick={() => setActiveTab("assignments")} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === "assignments" ? "border-amber-600 text-amber-700 font-bold" : "border-transparent text-muted-foreground hover:text-slate-700"}`}>
                    Asignaciones Activas ({meta?.total || 0})
                </button>
                <button onClick={() => setActiveTab("catalog")} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === "catalog" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent text-muted-foreground hover:text-slate-700"}`}>
                    Catálogo del Sistema ({types.length})
                </button>
            </div>

            {/* BARRA DE CONTROLES Y FILTRADO */}
            {(restrictions.length > 0 || meta) && activeTab === "assignments" && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por enfermera o tipo..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full rounded-lg border p-2 pl-9 pr-9 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <Select value={nurseFilter} onValueChange={(value) => { setNurseFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Enfermera" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Enfermeras</SelectItem>
                                {nurses.map((n: any) => <SelectItem key={n.id} value={n.id}>{n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Tipo de Restricción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Tipos</SelectItem>
                                {types.filter(t => t.isActive).map((t: any) => <SelectItem key={t.id} value={t.id}>{t.description} ({t.code})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <X className="h-3 w-3" /> Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {loading && (
                <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-muted-foreground font-medium animate-pulse">
                    Procesando peticiones y sincronizando datos... <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mt-2" />
                </div>
            )}

            {!loading && (
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === "assignments" ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <th className="p-4">Enfermería Afectada</th>
                                        <th className="p-4">Limitación Operativa</th>
                                        <th className="p-4">Severidad</th>
                                        <th className="p-4">Impacto</th>
                                        <th className="p-4">Vigencia</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {groupedAssignments.map((group: any) => (
                                        <tr key={group.restrictionTypeId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-base">
                                                    {group.nurseIds.length} Usuarios Asignados
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 max-w-[220px] truncate" title={group.nursesData.map((n: any) => `${n?.user?.firstName || ""} ${n?.user?.lastName || ""}`).join(", ")}>
                                                    {group.nursesData.map((n: any) => n?.user?.firstName || "Asistencial").join(", ")}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800 dark:text-slate-200">{group.restrictionType?.description}</div>
                                                <span className="text-xs text-muted-foreground font-mono">{group.restrictionType?.code}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(group.restrictionType?.severity)}`}>
                                                    {group.restrictionType?.severity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                                                    {group.restrictionType?.affects_scheduler && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded dark:bg-purple-950 dark:text-purple-300">Calendario</span>}
                                                    {group.restrictionType?.affects_overtime && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded dark:bg-indigo-950 dark:text-indigo-300">No H. Extra</span>}
                                                    {group.restrictionType?.affects_nights && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">No Nocturno</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                {group.isTemporary ? (
                                                    <div>
                                                        <span className="text-amber-700 dark:text-amber-300 font-medium">Temporal</span>
                                                        <div className="text-muted-foreground font-mono">{group.startDate?.split('T')[0]} al {group.endDate?.split('T')[0]}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Permanente</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center h-2 w-2 rounded-full mr-2 ${group.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                <span className="text-xs font-medium">{group.isActive ? "Activa" : "Inactiva"}</span>
                                            </td>
                                            <td className="p-4 text-right space-x-3">
                                                <button onClick={() => handleEditGroup(group)} className="text-primary hover:underline font-medium text-sm">Editar Lote</button>
                                                <button onClick={() => handleRevokeGroup(group)} className="text-destructive hover:underline font-medium text-sm">Revocar Todo</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groupedAssignments.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground italic">No hay asignaciones masivas de restricciones en este momento.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <th className="p-4">Código</th>
                                        <th className="p-4">Nombre Técnico</th>
                                        <th className="p-4">Descripción Clinical</th>
                                        <th className="p-4">Severidad</th>
                                        <th className="p-4">Estado catálogo</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {types.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="p-4 font-mono text-xs font-bold text-slate-900 dark:text-white">{t.code}</td>
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{t.name}</td>
                                            <td className="p-4 text-sm max-w-xs truncate" title={t.description}>{t.description}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(t.severity)}`}>
                                                    {t.severity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                                    {t.isActive ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-3">
                                                <button onClick={() => handleEditType(t)} className="text-primary hover:underline font-medium text-sm">Editar</button>
                                                {!t.isSystem ? (
                                                    <button onClick={() => removeType(t.id)} className="text-destructive hover:underline font-medium text-sm">Eliminar</button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic cursor-not-allowed select-none" title="Bloqueado por el núcleo del sistema">Protegido</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {types.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground italic">No hay tipos de restricciones en el catálogo.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* PAGINACIÓN - Solo para Asignaciones */}
                    {activeTab === "assignments" && meta && meta.totalPages > 1 && (
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            totalItems={meta.total}
                            onPageChange={setPage}
                        />
                    )}
                </div>
            )}

            <RestrictionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveRestriction}
                restrictionGroup={selectedRestrictionGroup}
                types={types.filter(t => t.isActive)}
                nurses={nurses}
            />

            <RestrictionTypeFormModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onSave={saveType}
                typeItem={selectedType}
            />
        </div>
    );
}