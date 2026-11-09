"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShiftChangeRequest, REQUEST_STATUS_LABELS } from "../types";
import { shiftChangeService } from "../services/shiftChangeService";
import { toast } from "sonner";
import { Loader2, X, CheckCircle2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ShiftChangeRequest | null;
    onResponded: () => void;
    isActing?: boolean;
}

export default function ShiftChangeRespondModal({
    isOpen,
    onClose,
    request,
    onResponded,
    isActing = false,
}: Props) {
    const [mode, setMode] = useState<"view" | "respond">("view");
    const [comments, setComments] = useState("");

    if (!request) return null;

    const handleRespond = async (decision: "APPROVED" | "REJECTED") => {
        if (decision === "REJECTED" && !comments.trim()) {
            toast.error("Debe indicar el motivo del rechazo.");
            return;
        }

        try {
            await shiftChangeService.respond(request.id, {
                decision,
                comments: comments.trim() || undefined,
            });
            toast.success(
                decision === "APPROVED"
                    ? "Solicitud aceptada"
                    : "Solicitud rechazada",
            );
            onClose();
            onResponded();
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === "view" ? (
                            <>
                                <span className="h-5 w-5 text-primary" />
                                Detalle de Solicitud
                            </>
                        ) : (
                            <>
                                <span className="h-5 w-5 text-primary" />
                                Responder Solicitud
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border`}>
                        {REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS] || request.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-200 text-indigo-700 dark:border-indigo-900 dark:text-indigo-300`}>
                        {request.operationType === "SWAP" ? "Intercambio" : request.operationType === "TRANSFER" ? "Cesión" : "Cobertura"}
                    </span>
                </div>

                <div className="space-y-3 py-2">
                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Solicitante</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{request.requester?.firstName || ""} {request.requester?.lastName || ""}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno de Origen</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{request.sourceScheduleEntry?.shift?.name || request.sourceShiftId || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(request.sourceScheduleEntry?.date)} • {formatTime(request.sourceScheduleEntry?.shift?.startTime)} - {formatTime(request.sourceScheduleEntry?.shift?.endTime)}
                            </p>
                        </div>
                    </div>

                    {request.targetScheduleEntry && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno de Destino</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold">{request.targetScheduleEntry.shift?.name || "—"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(request.targetScheduleEntry.date)} • {formatTime(request.targetScheduleEntry.shift?.startTime)} - {formatTime(request.targetScheduleEntry.shift?.endTime)}
                                </p>
                            </div>
                        </div>
                    )}

                    {request.reason && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Fecha límite</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{formatDateTime(request.expiresAt)}</p>
                        </div>
                    </div>
                </div>

                {mode === "respond" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2 dark:border-amber-900 dark:bg-amber-950/30">
                        <Label className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            {request.operationType === "SWAP" || request.operationType === "TRANSFER"
                                ? "¿Acepta este cambio de turno?"
                                : "¿Desea postularse a esta cobertura?"}
                        </Label>
                        <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder={
                                decisionPlaceholder(request.operationType)
                            }
                            rows={3}
                            disabled={isActing}
                        />
                    </div>
                )}

                <DialogFooter className="pt-4">
                    {mode === "view" ? (
                        <>
                            <Button variant="outline" onClick={onClose}>Cerrar</Button>
                            <Button
                                variant="outline"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900 dark:hover:bg-amber-950/40"
                                onClick={() => setMode("respond")}
                                disabled={isActing}
                            >
                                Responder
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setMode("view")} disabled={isActing}>
                                Volver
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleRespond("REJECTED")}
                                disabled={isActing}
                            >
                                {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                <X className="mr-1.5 h-4 w-4" />
                                Rechazar
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleRespond("APPROVED")}
                                disabled={isActing}
                            >
                                {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Aceptar
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function decisionPlaceholder(operationType: string): string {
    if (operationType === "SWAP") {
        return "Comentarios sobre el intercambio (opcional)...";
    }
    if (operationType === "TRANSFER") {
        return "Comentarios sobre la cesión (opcional)...";
    }
    return "Comentarios sobre su postulación a la cobertura (opcional)...";
}

function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES");
}

function formatTime(iso?: string | null): string {
    if (!iso) return "—";
    if (iso.includes("T")) {
        const t = iso.split("T")[1];
        return t ? t.slice(0, 5) : "—";
    }
    return iso.slice(0, 5);
}

function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}
