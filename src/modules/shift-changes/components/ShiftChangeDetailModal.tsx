"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShiftChangeRequest, REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE, isActionable, resolvePersonName } from "@/modules/shift-changes/types";
import { Clock, User, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ShiftChangeRequest | null;
    /** Rol actual para habilitar las acciones de aprobación (SUPER/ADMIN/SUPERVISOR). */
    canApprove?: boolean;
    onApprove?: (supervisorNotes?: string) => Promise<void>;
    onReject?: (reason: string) => Promise<void>;
    isActing?: boolean;
}

export default function ShiftChangeDetailModal({ isOpen, onClose, request, canApprove = false, onApprove, onReject, isActing = false }: Props) {
    const [mode, setMode] = useState<"view" | "approve" | "reject">("view");
    const [notes, setNotes] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    // Al cambiar de solicitud o de modo, reinicia el formulario de decisión.
    useEffect(() => {
        setMode("view");
        setNotes("");
        setRejectReason("");
        setLocalError(null);
    }, [request?.id, isOpen]);

    if (!request) return null;

    const status = request.status;
    const requesterName = resolvePersonName(request.requester, request.requesterId);
    const receiverName = resolvePersonName(request.receiver, request.receiverId);
    const actionable = isActionable(status);
    const showActions = canApprove && actionable && (onApprove || onReject);

    const handleApprove = async () => {
        setLocalError(null);
        try {
            await onApprove?.(notes.trim() || undefined);
            setMode("view");
        } catch { /* errores ya notificados por el interceptor global */ }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setLocalError("Debes indicar el motivo del rechazo.");
            return;
        }
        setLocalError(null);
        try {
            await onReject?.(rejectReason.trim());
            setMode("view");
        } catch { /* errores ya notificados por el interceptor global */ }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Detalle de Solicitud
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${REQUEST_STATUS_BADGE[status] || REQUEST_STATUS_BADGE.AWAITING_OTHER_NURSE}`}>
                        {REQUEST_STATUS_LABELS[status] || status}
                    </span>
                </div>

                <div className="space-y-3 py-2">
                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground">Solicitante</p>
                                <p className="text-sm font-semibold">{requesterName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground">Receptor</p>
                                <span className="text-sm font-semibold">{receiverName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno de Origen</span>
                            <span className="ml-1 text-xs text-muted-foreground">
                                {request.sourceShift?.name || request.sourceShiftId || "—"}
                            </span>
                        </div>
                    </div>

                    {request.targetShiftId && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno de Destino</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{request.targetShift?.name || request.targetShiftId}</span>
                        </div>
                    )}

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Estado</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${REQUEST_STATUS_BADGE[request.status] || REQUEST_STATUS_BADGE.AWAITING_OTHER_NURSE}`}>
                            {REQUEST_STATUS_LABELS[request.status] || request.status}
                        </span>
                    </div>

                    {request.reason && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{request.reason}</span>
                        </div>
                    )}

                    {request.supervisorNotes && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Notas del Supervisor</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{request.supervisorNotes}</span>
                        </div>
                    )}

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Fecha de creación</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(request.createdAt)}</span>
                        </div>
                        {request.createdBy && (
                            <div className="flex flex-col text-right">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Registrado por</span>
                                <span className="text-xs text-muted-foreground">{request.createdBy}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= PANEL DE DECISIÓN ================= */}
                {mode === "approve" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 space-y-2 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Aprobar solicitud</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas del supervisor (opcional)..."
                            rows={3}
                            disabled={isActing}
                        />
                    </div>
                )}

                {mode === "reject" && (
                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2 dark:border-red-900 dark:bg-red-950/30">
                        <Label className="text-xs font-bold text-red-700 dark:text-red-300">
                            Motivo del rechazo <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => { setRejectReason(e.target.value); setLocalError(null); }}
                            placeholder="Indica el motivo del rechazo (obligatorio)..."
                            rows={3}
                            disabled={isActing}
                        />
                        {localError && (
                            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{localError}</p>
                        )}
                    </div>
                )}

                <DialogFooter className="pt-4">
                    {mode === "view" ? (
                        <>
                            <Button variant="outline" onClick={onClose}>Cerrar</Button>
                            {showActions && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
                                        onClick={() => setMode("reject")}
                                        disabled={isActing}
                                    >
                                        <XCircle className="mr-1.5 h-4 w-4" /> Rechazar
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => setMode("approve")}
                                        disabled={isActing}
                                    >
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Aprobar
                                    </Button>
                                </>
                            )}
                        </>
                    ) : mode === "approve" ? (
                        <>
                            <Button variant="outline" onClick={() => { setMode("view"); setLocalError(null); }} disabled={isActing}>Volver</Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleApprove}
                                disabled={isActing}
                            >
                                {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                Confirmar aprobación
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => { setMode("view"); setLocalError(null); }} disabled={isActing}>Volver</Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleReject}
                                disabled={isActing}
                            >
                                {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                Confirmar rechazo
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
