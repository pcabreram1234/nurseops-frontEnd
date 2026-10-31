"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
    Plus, FileText, Loader2, AlertCircle, Download, Eye, Ban,
    RefreshCw, History, Search, X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiInstance } from "@/services/axios";
import { Pagination } from "@/components/Pagination";
import { useDocuments, useDocumentTemplates } from "@/modules/documents/hooks/useDocuments";
import { documentService } from "@/modules/documents/services/documentService";
import {
    GeneratedDocument,
    DOCUMENT_TYPE_LABELS,
    DOCUMENT_STATUS_LABELS,
    ACTION_LABELS,
} from "@/modules/documents/types";

export default function DocumentsPage() {
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 25;

    // Generar
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [genTemplateId, setGenTemplateId] = useState("");
    const [genEmployeeId, setGenEmployeeId] = useState("");
    const [genVacationId, setGenVacationId] = useState("");
    const [genTitle, setGenTitle] = useState("");
    const [genValues, setGenValues] = useState("");

    // Detalle / historial
    const [selected, setSelected] = useState<GeneratedDocument | null>(null);
    const [detail, setDetail] = useState<GeneratedDocument | null>(null);
    const [voidReason, setVoidReason] = useState("");
    const [isVoidOpen, setIsVoidOpen] = useState(false);

    const { documents, meta, isLoading, generateDocument, isGenerating, substituteDocument, voidDocument, isVoiding } = useDocuments({
        documentType: typeFilter !== "ALL" ? typeFilter : undefined,
        status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
        search: search || undefined,
        page,
        limit,
    });

    const { templates } = useDocumentTemplates({ status: "ACTIVE" });

    const { data: nurses = [] } = useQuery<any[]>({
        queryKey: ["doc-nurses"],
        queryFn: async () => {
            const resp: any = await apiInstance.get("/nurses", { params: { limit: 500 } });
            return resp?.data?.data || resp?.data || [];
        },
        enabled: isGenerateOpen,
    });

    const { data: vacations = [] } = useQuery<any[]>({
        queryKey: ["doc-vacations", genEmployeeId],
        queryFn: async () => {
            const resp: any = await apiInstance.get("/vacations", { params: { limit: 100, ...(genEmployeeId ? { nurseId: genEmployeeId } : {}) } });
            return resp?.data?.data || resp?.data || [];
        },
        enabled: isGenerateOpen && !!genEmployeeId,
    });

    const openDetail = async (doc: GeneratedDocument) => {
        try {
            const full = await documentService.getDocument(doc.id);
            setDetail(full);
        } catch {
            setDetail(doc);
        }
    };

    const handleDownload = async (doc: GeneratedDocument) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${doc.documentNumber || doc.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Descarga iniciada");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error al descargar el documento");
        }
    };

    const handleGenerate = async () => {
        if (!genTemplateId) {
            toast.error("Seleccione una plantilla");
            return;
        }
        let values: Record<string, any> | undefined;
        if (genValues.trim()) {
            try {
                values = JSON.parse(genValues);
            } catch {
                toast.error("Los valores adicionales no son JSON válido");
                return;
            }
        }
        try {
            await generateDocument({
                templateId: genTemplateId,
                employeeId: genEmployeeId || undefined,
                vacationId: genVacationId || undefined,
                title: genTitle || undefined,
                values,
            });
            setIsGenerateOpen(false);
            setGenTemplateId("");
            setGenEmployeeId("");
            setGenVacationId("");
            setGenTitle("");
            setGenValues("");
        } catch {
            // error toast ya manejado por el hook
        }
    };

    const handleSubstitute = async (doc: GeneratedDocument) => {
        if (!window.confirm("Se generará un documento nuevo que sustituye al actual. El original se conserva como histórico. ¿Continuar?")) return;
        try {
            await substituteDocument({ id: doc.id, data: {} });
        } catch {
            // error toast ya manejado por el hook
        }
    };

    const handleVoid = async () => {
        if (!selected) return;
        try {
            await voidDocument({ id: selected.id, reason: voidReason || undefined });
            setIsVoidOpen(false);
            setSelected(null);
            setVoidReason("");
        } catch {
            // error toast ya manejado por el hook
        }
    };

    const statusBadge: Record<string, string> = {
        GENERATED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        SUBSTITUTED: "bg-amber-50 text-amber-700 border-amber-200",
        VOID: "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
                    <p className="text-muted-foreground">Generación, consulta, descarga y administración de documentos institucionales</p>
                </div>
                <Button onClick={() => setIsGenerateOpen(true)} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Generar Documento
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título o número..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                        className="pl-9 pr-9"
                    />
                    {searchInput && (
                        <button onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v || "ALL"); setPage(1); }}>
                    <SelectTrigger className="w-[230px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los Tipos</SelectItem>
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v || "ALL"); setPage(1); }}>
                    <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los Estados</SelectItem>
                        {Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Tabla */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando documentos...
                </div>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No hay documentos generados.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> Generar el primero
                    </Button>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Número</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Título</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Empleado</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Emitido</th>
                                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((d) => (
                                        <tr key={d.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="px-4 py-3 font-mono text-primary text-xs">{d.documentNumber || "—"}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold max-w-[260px] truncate">{d.title}</div>
                                                <div className="text-xs text-muted-foreground">{d.template?.code} v{d.templateVersion}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{DOCUMENT_TYPE_LABELS[d.documentType] || d.documentType}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {d.employee?.user ? `${d.employee.user.firstName} ${d.employee.user.lastName}` : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[d.status] || ""}`}>
                                                    {DOCUMENT_STATUS_LABELS[d.status] || d.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1 justify-end">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle e historial" onClick={() => openDetail(d)}>
                                                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                                                    </Button>
                                                    {d.status !== "VOID" && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Descargar" onClick={() => handleDownload(d)}>
                                                            <Download className="h-3.5 w-3.5 text-slate-500" />
                                                        </Button>
                                                    )}
                                                    {d.status === "GENERATED" && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Sustituir" onClick={() => handleSubstitute(d)}>
                                                                <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Anular" onClick={() => { setSelected(d); setIsVoidOpen(true); }}>
                                                                <Ban className="h-3.5 w-3.5 text-rose-600" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {meta && meta.totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    onPageChange={setPage}
                />
            )}

            {/* MODAL: GENERAR DOCUMENTO */}
            <Dialog open={isGenerateOpen} onOpenChange={(open) => !open && setIsGenerateOpen(false)}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Generar Documento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Plantilla *</Label>
                            <Select value={genTemplateId || undefined} onValueChange={(v) => setGenTemplateId(v || "")}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar plantilla activa" /></SelectTrigger>
                                <SelectContent>
                                    {templates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.code} — {t.name} (v{t.version})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Empleado / Enfermera (opcional)</Label>
                            <Select value={genEmployeeId || "__NONE__"} onValueChange={(v) => { setGenEmployeeId(v === "__NONE__" ? "" : v || ""); setGenVacationId(""); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__NONE__">Sin empleado asociado</SelectItem>
                                    {nurses.map((n: any) => (
                                        <SelectItem key={n.id} value={n.id}>
                                            {n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {genEmployeeId && (
                            <div className="space-y-1">
                                <Label>Solicitud de vacaciones (opcional)</Label>
                                <Select value={genVacationId || "__NONE__"} onValueChange={(v) => setGenVacationId(v === "__NONE__" ? "" : v || "")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__NONE__">Sin vacación asociada</SelectItem>
                                        {vacations.map((v: any) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {(v.startDate || "").split("T")[0]} → {(v.endDate || "").split("T")[0]} ({v.status})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label>Título (opcional, por defecto el de la plantilla)</Label>
                            <Input value={genTitle} onChange={(e) => setGenTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Valores adicionales (JSON opcional)</Label>
                            <Textarea rows={3} value={genValues} onChange={(e) => setGenValues(e.target.value)} placeholder='{"documento": {"referencia": "REF-001"}}' />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancelar</Button>
                        <Button onClick={handleGenerate} disabled={isGenerating || !genTemplateId}>
                            {isGenerating && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                            Generar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL: DETALLE + HISTORIAL AUDITABLE */}
            <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
                <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Documento: {detail?.documentNumber || detail?.title}</DialogTitle>
                    </DialogHeader>
                    {detail && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div><span className="font-semibold text-muted-foreground">Título:</span> {detail.title}</div>
                                <div><span className="font-semibold text-muted-foreground">Tipo:</span> {DOCUMENT_TYPE_LABELS[detail.documentType] || detail.documentType}</div>
                                <div><span className="font-semibold text-muted-foreground">Plantilla:</span> {detail.template?.code} v{detail.templateVersion}</div>
                                <div><span className="font-semibold text-muted-foreground">Estado:</span> {DOCUMENT_STATUS_LABELS[detail.status]}</div>
                                <div><span className="font-semibold text-muted-foreground">Empleado:</span> {detail.employee?.user ? `${detail.employee.user.firstName} ${detail.employee.user.lastName}` : "—"}</div>
                                <div><span className="font-semibold text-muted-foreground">Emitido:</span> {new Date(detail.createdAt).toLocaleString()}</div>
                                {detail.retentionUntil && (
                                    <div><span className="font-semibold text-muted-foreground">Retención hasta:</span> {new Date(detail.retentionUntil).toLocaleDateString()}</div>
                                )}
                                {detail.substitutedBy && (
                                    <div className="col-span-2 text-amber-600">
                                        Sustituido por: <button className="underline" onClick={() => openDetail(detail.substitutedBy as any)}>{detail.substitutedBy.documentNumber || detail.substitutedBy.title}</button>
                                    </div>
                                )}
                                {detail.voidReason && (
                                    <div className="col-span-2 text-rose-600">
                                        <span className="font-semibold">Motivo de anulación:</span> {detail.voidReason}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <History className="h-3.5 w-3.5" /> Historial Auditable
                                </p>
                                <div className="border rounded-lg divide-y">
                                    {(detail.actions || []).map((a) => (
                                        <div key={a.id} className="flex items-center justify-between px-3 py-2 text-xs">
                                            <span className="font-medium">{ACTION_LABELS[a.action] || a.action}</span>
                                            <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {(!detail.actions || detail.actions.length === 0) && (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">Sin acciones registradas.</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {detail.status !== "VOID" && (
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload(detail)}>
                                        <Download className="h-3.5 w-3.5" /> Descargar
                                    </Button>
                                )}
                                {detail.status === "GENERATED" && (
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSelected(detail); setIsVoidOpen(true); }}>
                                        <Ban className="h-3.5 w-3.5" /> Anular
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* MODAL: ANULAR */}
            <Dialog open={isVoidOpen} onOpenChange={(open) => !open && setIsVoidOpen(false)}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle>Anular Documento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            El documento se marcará como anulado. La copia emitida y su historial se conservan para auditoría.
                        </p>
                        <div className="space-y-1">
                            <Label>Motivo de anulación</Label>
                            <Textarea rows={3} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="Describa el motivo..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVoidOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleVoid} disabled={isVoiding}>
                            {isVoiding && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                            Anular Documento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
