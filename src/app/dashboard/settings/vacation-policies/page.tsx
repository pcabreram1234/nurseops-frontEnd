"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
    Plus, Loader2, AlertCircle, Edit2, CheckCircle2, Archive,
    UserPlus, FileText, Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVacationPolicies } from "@/modules/vacation-policies/hooks/useVacationPolicies";
import VacationPolicyModal from "@/modules/vacation-policies/components/VacationPolicyModal";
import AssignVacationProfileModal from "@/modules/vacation-policies/components/AssignVacationProfileModal";
import {
    VacationPolicy,
    POLICY_STATUS_LABELS,
    REGIME_LABELS,
} from "@/modules/vacation-policies/types";

export default function VacationPoliciesPage() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selected, setSelected] = useState<VacationPolicy | null>(null);

    const {
        policies, isLoading, error,
        createPolicy, updatePolicy, activatePolicy, archivePolicy,
        isCreating, isUpdating,
    } = useVacationPolicies({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

    const handleFormSubmit = async (data: any) => {
        if (selected) {
            await updatePolicy({ id: selected.id, data });
        } else {
            await createPolicy(data);
        }
        setIsModalOpen(false);
        setSelected(null);
    };

    const handleAction = async (action: () => Promise<any>, confirmMsg?: string) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;
        try {
            await action();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Error en la operación";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        }
    };

    const statusBadge: Record<string, string> = {
        DRAFT: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
        ARCHIVED: "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Políticas de Vacaciones</h1>
                    <p className="text-muted-foreground">Configuración de reglas, regímenes y saldos de vacaciones por antigüedad</p>
                </div>
                <div className="flex gap-2 self-start sm:self-center">
                    <Button variant="outline" onClick={() => setIsAssignOpen(true)} className="gap-2">
                        <UserPlus className="h-4 w-4" /> Asignar Perfil
                    </Button>
                    <Button onClick={() => { setSelected(null); setIsModalOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Nueva Política
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los Estados</SelectItem>
                        {Object.entries(POLICY_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Contenido */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando políticas...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las políticas</p>
                </div>
            ) : policies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen políticas de vacaciones registradas.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => { setSelected(null); setIsModalOpen(true); }}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera política
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {policies.map((p) => (
                        <Card key={p.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 text-primary shrink-0" /> {p.name}
                                        </CardTitle>
                                        <p className="text-xs font-mono text-primary">{p.code} · v{p.version}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[p.status] || statusBadge.DRAFT}`}>
                                            {POLICY_STATUS_LABELS[p.status] || p.status}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                    <p><span className="font-semibold">Régimen:</span> {REGIME_LABELS[p.regimeCode] || p.regimeCode}</p>
                                    <p><span className="font-semibold">Vigencia:</span> {new Date(p.effectiveFrom).toLocaleDateString()} {p.effectiveTo ? `→ ${new Date(p.effectiveTo).toLocaleDateString()}` : "→ indefinida"}</p>
                                    <p><span className="font-semibold">Arrastre máx:</span> {p.carryOverMaxDays} días</p>
                                    <p><span className="font-semibold">Máx. consecutivos:</span> {p.maxConsecutiveDays} días</p>
                                    <p className="flex items-center gap-1">
                                        <span className="font-semibold">Reglas:</span> {p.rules.length} por antigüedad
                                    </p>
                                </div>
                                <div className="flex gap-1 pt-2 border-t">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => { setSelected(p); setIsModalOpen(true); }}>
                                        <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                    </Button>
                                    {p.status === "DRAFT" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Activar" onClick={() => handleAction(() => activatePolicy(p.id))}>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        </Button>
                                    )}
                                    {p.status === "ACTIVE" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Asignar a enfermera" onClick={() => setIsAssignOpen(true)}>
                                            <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                                        </Button>
                                    )}
                                    {p.status !== "ARCHIVED" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Archivar" onClick={() => handleAction(() => archivePolicy(p.id), "¿Archivar esta política? Dejará de estar disponible para nuevas asignaciones.")}>
                                            <Archive className="h-3.5 w-3.5 text-slate-500" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modales */}
            <VacationPolicyModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelected(null); }}
                onSubmit={handleFormSubmit}
                policy={selected}
                isSubmitting={isCreating || isUpdating}
            />

            <AssignVacationProfileModal
                isOpen={isAssignOpen}
                onClose={() => setIsAssignOpen(false)}
            />
        </div>
    );
}
