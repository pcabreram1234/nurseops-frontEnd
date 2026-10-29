"use client";

import { useState } from "react";
import { Vacation, VacationStatus, VACATION_STATUS_LABELS, VACATION_STATUS_BADGE } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Calendar, User, FileText } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vacation: Vacation | null;
    onApprove: (id: string, payload: { status: string; rejectionReason?: string }) => Promise<void>;
    isProcessing: boolean;
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.split("T")[0];
    return d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

export default function VacationApprovalModal({ isOpen, onClose, vacation, onApprove, isProcessing }: Props) {
    const [rejectionReason, setRejectionReason] = useState("");

    if (!vacation) return null;

    const status: VacationStatus = vacation.status;
    const nurseName = vacation.nurse?.user
        ? `${vacation.nurse.user.firstName} ${vacation.nurse.user.lastName}`
        : "Sin asignar";

    const handleApprove = async () => {
        await onApprove(vacation.id, { status: "APPROVED" });
        setRejectionReason("");
        onClose();
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Debes indicar un motivo de rechazo.");
            return;
        }
        await onApprove(vacation.id, { status: "REJECTED", rejectionReason });
        setRejectionReason("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Revisar Solicitud de Vacaciones
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${VACATION_STATUS_BADGE[status] || VACATION_STATUS_BADGE.DRAFT}`}>
                            {VACATION_STATUS_LABELS[status] || status}
                        </span>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <User className="h-4 w-4 text-muted-foreground mt-1" />
                        <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Enfermera</p>
                            <p className="text-sm font-semibold">{nurseName}</p></div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                        <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Período</p>
                            <p className="text-sm font-semibold">{formatDate(vacation.startDate)} — {formatDate(vacation.endDate)}</p></div>
                    </div>

                    {vacation.reason && (
                        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                            <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                            <div><p className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-normal">{vacation.reason}</p></div>
                        </div>
                    )}

                    {vacation.rejectionReason && (
                        <div className="mt-3 p-3 rounded-xl border border-red-200 bg-red-50/70 dark:bg-red-950/30">
                            <p className="text-[11px] font-bold uppercase text-red-600 mb-1">Motivo de rechazo</p>
                            <p className="text-xs text-red-700 dark:text-red-300">{vacation.rejectionReason}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="rejectionReason">Motivo de rechazo (si aplica)</Label>
                    <Textarea
                        id="rejectionReason"
                        placeholder="Indica el motivo si deseas rechazar la solicitud..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </div>

                <DialogFooter className="pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="gap-1.5"
                    >
                        <XCircle className="h-4 w-4" /> Rechazar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Aprobar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
