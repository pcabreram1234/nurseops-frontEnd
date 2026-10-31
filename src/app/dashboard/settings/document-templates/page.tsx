"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
    Plus, FileText, Loader2, AlertCircle, Edit2, CheckCircle2,
    Star, Archive, Eye,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiInstance } from "@/services/axios";
import { useDocumentTemplates } from "@/modules/documents/hooks/useDocuments";
import DocumentTemplateModal from "@/modules/documents/components/DocumentTemplateModal";
import {
    DocumentTemplate,
    DOCUMENT_TYPE_LABELS,
    TEMPLATE_STATUS_LABELS,
} from "@/modules/documents/types";

export default function DocumentTemplatesPage() {
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<DocumentTemplate | null>(null);

    const {
        templates, isLoading, error,
        createTemplate, updateTemplate, activateTemplate, setDefaultTemplate, archiveTemplate,
        isCreating, isUpdating,
    } = useDocumentTemplates({
        documentType: typeFilter !== "ALL" ? typeFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

    const { data: branches = [] } = useQuery<any[]>({
        queryKey: ["form-branches"],
        queryFn: async () => (await apiInstance.get("/branches")).data,
    });

    const handleFormSubmit = async (data: any) => {
        if (selected) {
            await updateTemplate({ id: selected.id, data });
        } else {
            await createTemplate(data);
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
                    <h1 className="text-3xl font-bold tracking-tight">Plantillas de Documentos</h1>
                    <p className="text-muted-foreground">Configuración de plantillas institucionales: encabezados, campos dinámicos, numeración, firmas y retención</p>
                </div>
                <Button onClick={() => { setSelected(null); setIsModalOpen(true); }} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Plantilla
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "ALL")}>
                    <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los Tipos</SelectItem>
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "ALL")}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los Estados</SelectItem>
                        {Object.entries(TEMPLATE_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Contenido */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando plantillas...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las plantillas</p>
                </div>
            ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen plantillas de documentos registradas.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => { setSelected(null); setIsModalOpen(true); }}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera plantilla
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {templates.map((t) => (
                        <Card key={t.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 text-primary shrink-0" /> {t.name}
                                        </CardTitle>
                                        <p className="text-xs font-mono text-primary">{t.code} · v{t.version}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[t.status] || statusBadge.DRAFT}`}>
                                            {TEMPLATE_STATUS_LABELS[t.status] || t.status}
                                        </span>
                                        {t.isDefault && (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                <Star className="h-2.5 w-2.5" /> Predeterminada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                    <p><span className="font-semibold">Tipo:</span> {DOCUMENT_TYPE_LABELS[t.documentType] || t.documentType}</p>
                                    <p><span className="font-semibold">Formato:</span> {t.format}</p>
                                    {t.numberingPrefix && (
                                        <p><span className="font-semibold">Numeración:</span> <span className="font-mono">{t.numberingPrefix}{String(0).padStart(t.numberingDigits ?? 6, "0")}</span></p>
                                    )}
                                    {t.retentionDays != null && (
                                        <p><span className="font-semibold">Retención:</span> {t.retentionDays} días</p>
                                    )}
                                    <p className="line-clamp-2 text-slate-400">{t.body}</p>
                                </div>
                                <div className="flex gap-1 pt-2 border-t">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver / Editar" onClick={() => { setSelected(t); setIsModalOpen(true); }}>
                                        {t.status === "DRAFT" ? <Edit2 className="h-3.5 w-3.5 text-slate-500" /> : <Eye className="h-3.5 w-3.5 text-slate-500" />}
                                    </Button>
                                    {t.status === "DRAFT" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Activar" onClick={() => handleAction(() => activateTemplate(t.id))}>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        </Button>
                                    )}
                                    {t.status === "ACTIVE" && !t.isDefault && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Marcar predeterminada" onClick={() => handleAction(() => setDefaultTemplate(t.id))}>
                                            <Star className="h-3.5 w-3.5 text-amber-500" />
                                        </Button>
                                    )}
                                    {t.status !== "ARCHIVED" && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Archivar" onClick={() => handleAction(() => archiveTemplate(t.id), "¿Archivar esta plantilla? Dejará de estar disponible para generar documentos.")}>
                                            <Archive className="h-3.5 w-3.5 text-slate-500" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            <DocumentTemplateModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelected(null); }}
                onSubmit={handleFormSubmit}
                template={selected}
                branches={branches.map((b: any) => ({ id: b.id, name: b.name }))}
                isSubmitting={isCreating || isUpdating}
            />
        </div>
    );
}
