"use client";

import { useState, useMemo } from "react";
import { useShiftTemplates } from "@/modules/shift-templates/hooks/useShiftTemplates";
import { ShiftTemplate } from "@/modules/shift-templates/types";
import ShiftTemplateModal from "@/modules/shift-templates/components/ShiftTemplateModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, ChevronLeft, ChevronRight, Clock,
    Users, Moon, Sun, Sunrise, AlertCircle, CheckCircle2,
    Building, Zap, Timer
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Pagination } from "@/components/Pagination";

const shiftTypeLabels: Record<string, string> = {
    MORNING: "Mañana",
    AFTERNOON: "Tarde",
    NIGHT: "Noche",
    MORNING_AFTERNOON: "Mañana-Tarde",
    MORNING_NIGHT: "Mañana-Noche",
    NIGHT_AFTERNOON: "Noche-Tarde",
};

const shiftTypeIcons: Record<string, string> = {
    MORNING: "🌅",
    AFTERNOON: "☀️",
    NIGHT: "🌙",
    MORNING_AFTERNOON: "🌅☀️",
    MORNING_NIGHT: "🌅🌙",
    NIGHT_AFTERNOON: "🌙☀️",
};

const shiftTypeBadgeColors: Record<string, string> = {
    MORNING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    AFTERNOON: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    NIGHT: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    MORNING_AFTERNOON: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    MORNING_NIGHT: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300",
    NIGHT_AFTERNOON: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
};

function formatTime(time: string): string {
    if (!time) return "--:--";
    return time.substring(0, 5);
}

export default function ShiftTemplatesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [branchFilter, setBranchFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const { templates, isLoading, createTemplate, isCreating, updateTemplate, isUpdating, deleteTemplate, isDeleting } = useShiftTemplates();

    const { data: departments = [] } = useQuery({
        queryKey: ["form-departments"],
        queryFn: async () => (await apiInstance.get("/departments")).data,
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["form-branches"],
        queryFn: async () => (await apiInstance.get("/branches")).data,
    });

    const { data: organizations = [] } = useQuery({
        queryKey: ["form-orgs"],
        queryFn: async () => (await apiInstance.get("/organizations")).data,
    });

    const handleOpenCreate = () => { setSelectedTemplate(null); setIsModalOpen(true); };
    const handleOpenEdit = (template: ShiftTemplate) => { setSelectedTemplate(template); setIsModalOpen(true); };

    const handleFormSubmit = async (data: any) => {
        try {
            const { id, createdAt, updatedAt, department, branch, ...cleanData } = data;
            if (!cleanData.departmentId) {
                cleanData.departmentId = undefined;
            }
            if (selectedTemplate) {
                await updateTemplate({ id: selectedTemplate.id, data: cleanData });
            } else {
                await createTemplate(cleanData);
            }
            setIsModalOpen(false);
        } catch (error) { /* manejado por el hook */ }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta plantilla de turno? Los turnos y schedules asociados se verán afectados.")) {
            await deleteTemplate(id);
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter((t) => {
            const matchesSearch =
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "ALL" || t.name === typeFilter;
            const matchesBranch = branchFilter === "ALL" || t.branchId === branchFilter || t.branch?.id === branchFilter;
            return matchesSearch && matchesType && matchesBranch;
        });
    }, [templates, searchTerm, typeFilter, branchFilter]);

    const stats = useMemo(() => {
        const total = templates.length;
        const active = templates.filter(t => t.isActive).length;
        const nightShifts = templates.filter(t => t.isNightShift).length;
        const totalMinStaff = templates.reduce((sum, t) => sum + t.minimum_staff, 0);
        return { total, active, nightShifts, totalMinStaff };
    }, [templates]);

    return (
        <div className="space-y-6">
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plantillas de Turnos</h1>
                    <p className="text-muted-foreground">Configura los esquemas de horarios, duración y requerimientos de personal por turno.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Plantilla
                </Button>
            </div>

            {/* STATS BAR */}
            {templates.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Activas</p><p className="text-lg font-bold">{stats.active}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg"><Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Nocturnos</p><p className="text-lg font-bold">{stats.nightShifts}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg"><Users className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
                        <div><p className="text-xs text-muted-foreground">Staff Mín Total</p><p className="text-lg font-bold">{stats.totalMinStaff}</p></div>
                    </div>
                </div>
            )}

            {/* FILTERS */}
            {templates.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, departamento o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todos los tipos</option>
                            {Object.entries(shiftTypeLabels).map(([key, label]) => (
                                <option key={key} value={key}>{shiftTypeIcons[key as keyof typeof shiftTypeLabels]} {label}</option>
                            ))}
                        </select>
                        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                            <option value="ALL">Todas las sedes</option>
                            {branches.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            {/* CONTENT */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando plantillas de turnos...
                </div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Clock className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen plantillas de turnos registradas.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Crea tu primera plantilla para configurar los esquemas de horarios.</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias para la búsqueda</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearchTerm(""); setTypeFilter("ALL"); }}>Limpiar filtros</Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Plantillas de Turno ({templates.length}{templates.length !== templates.length ? ` de ${templates.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Nombre</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Sede</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Departamento</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Horario</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Horas</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Staff Mín</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Prioridad</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTemplates.map((t) => (
                                        <tr key={t.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{shiftTypeIcons[t.name]}</span>
                                                    <span className="font-semibold text-sm">{shiftTypeLabels[t.name] || t.name}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${shiftTypeBadgeColors[t.name]}`}>
                                                        {t.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {t.branch?.name || "N/A"}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                {t.department?.name || "Toda la sede"}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="font-mono">{formatTime(t.startTime)} - {formatTime(t.endTime)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                                                {t.durationHours || 0}h
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                                                {t.minimum_staff || 1}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                                                {t.priority || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* PAGINACIÓN SERVER-SIDE */}
                        {templates.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-900/20">
                                <span className="text-xs text-muted-foreground">
                                    Página {page} de {Math.ceil(templates.length / PAGE_SIZE)} ({templates.length} turnos)
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={page <= 1 || isLoading}
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        className="text-xs gap-1"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                                    </Button>
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={page >= Math.ceil(templates.length / PAGE_SIZE) || isLoading}
                                        onClick={() => setPage(Math.min(Math.ceil(templates.length / PAGE_SIZE), page + 1))}
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

            <ShiftTemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                template={selectedTemplate}
                isSubmitting={isCreating || isUpdating}
                departments={departments}
                branches={branches}
                organizations={organizations}
            />
        </div>
    );
}