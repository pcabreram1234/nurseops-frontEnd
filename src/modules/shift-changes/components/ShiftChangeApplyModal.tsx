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
import { ShiftChangeRequest } from "../types";
import { shiftChangeService } from "../services/shiftChangeService";
import { toast } from "sonner";
import { Loader2, CheckCircle2, X } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ShiftChangeRequest | null;
    onApplied: () => void;
    isActing?: boolean;
}

export default function ShiftChangeApplyModal({
    isOpen,
    onClose,
    request,
    onApplied,
    isActing = false,
}: Props) {
    const [notes, setNotes] = useState("");
    const [mode, setMode] = useState<"view" | "confirm">("view");

    if (!request) return null;

    const handleApply = async () => {
        try {
            await shiftChangeService.apply(request.id, {
                approverNotes: notes.trim() || undefined,
            });
            toast.success("Cambio de turno aplicado correctamente");
            onClose();
            onApplied();
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    const handleReject = async () => {
        if (!notes.trim()) {
            toast.error("Debe indicar el motivo del rechazo.");
            return;
        }
        try {
            await shiftChangeService.reject(request.id, {
                reason: notes.trim(),
            });
            toast.success("Solicitud rechazada");
            onClose();
            onApplied();
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Aplicar Cambio de Turno
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Solicitante</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{request.requester?.firstName || ""} {request.requester?.lastName || ""}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Tipo de operación</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">
                                {request.operationType === "SWAP" ? "Intercambio" : request.operationType === "TRANSFER" ? "Cesión" : "Cobertura"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno Origen</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{request.sourceScheduleEntry?.shift?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                                {request.sourceScheduleEntry?.date ? new Date(request.sourceScheduleEntry.date).toLocaleDateString("es-ES") : "—"}
                            </p>
                        </div>
                    </div>

                    {request.targetScheduleEntry && (
                        <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno Destino</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold">{request.targetScheduleEntry.shift?.name || "—"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {request.targetScheduleEntry.date ? new Date(request.targetScheduleEntry.date).toLocaleDateString("es-ES") : "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    {request.operationType === "COVERAGE" && request.applications && request.applications.length > 0 && (
                        <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Candidata seleccionada</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold">
                                    {request.applications.find((a: any) => a.status === "SELECTED")?.nurse?.firstName || ""}
                                    {request.applications.find((a: any) => a.status === "SELECTED")?.nurse?.lastName || ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {request.applications.filter((a: any) => a.status === "PENDING").length} postulación(es) pendiente(s)
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">{request.reason || "Sin motivo especificado"}</p>
                        </div>
                    </div>
                </div>

                {mode === "confirm" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 space-y-2 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            Confirmar aplicación del cambio
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas del supervisor (opcional)..."
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
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950/40"
                                onClick={() => {
                                    setNotes("");
                                    setMode("confirm");
                                }}
                                disabled={isActing}
                            >
                                <X className="mr-1.5 h-4 w-4" /> Rechazar
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                    setNotes("");
                                    setMode("confirm");
                                }}
                                disabled={isActing}
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Aplicar Cambio
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setMode("view")} disabled={isActing}>
                                Volver
                            </Button>
                            {request.status === "REJECTED" || request.status === "CANCELLED" || request.status === "EXPIRED" ? (
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleReject}
                                    disabled={isActing}
                                >
                                    {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                    Confirmar Rechazo
                                </Button>
                            ) : (
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={handleApply}
                                    disabled={isActing}
                                >
                                    {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                                    Confirmar Aplicación
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
