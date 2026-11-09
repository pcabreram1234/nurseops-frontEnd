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
import { Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ShiftChangeRequest | null;
    onApplied: () => void;
    isActing?: boolean;
}

export default function CoverageApplicationModal({
    isOpen,
    onClose,
    request,
    onApplied,
    isActing = false,
}: Props) {
    const [comments, setComments] = useState("");

    if (!request) return null;

    const handleApply = async () => {
        try {
            await shiftChangeService.applyToCoverage(request.id, {
                comments: comments.trim() || undefined,
            });
            toast.success("Postulación enviada correctamente");
            onClose();
            onApplied();
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>Postularse a Cobertura</DialogTitle>
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
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Turno a cubrir</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">{request.sourceScheduleEntry?.shift?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(request.sourceScheduleEntry?.date || "").toLocaleDateString("es-ES")} •
                                {request.sourceScheduleEntry?.shift?.startTime?.slice(0, 5)} - {request.sourceScheduleEntry?.shift?.endTime?.slice(0, 5)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Fecha límite</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold">
                                {request.expiresAt ? new Date(request.expiresAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "—"}
                            </p>
                        </div>
                    </div>

                    {request.reason && (
                        <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label>Comentarios <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Indique por qué está interesado/a en esta cobertura..."
                            rows={4}
                            disabled={isActing}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isActing}>
                        Cancelar
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleApply}
                        disabled={isActing || !comments.trim()}
                    >
                        {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Enviar Postulación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
