"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShiftChangeRequest, REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE } from "@/modules/shift-changes/types";
import { Clock, User, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export default function ShiftChangeDetailModal({ isOpen, onClose, request }: { isOpen: boolean; onClose: () => void; request: ShiftChangeRequest | null }) {
    if (!request) return null;

    const status = request.status;
    const requesterName = request.requester?.user ? `${request.requester.user.firstName} ${request.requester.user.lastName}` : request.requesterId;
    const receiverName = request.receiver ? `${request.receiver?.user?.firstName} ${request.receiver?.user?.lastName}` : request.receiverId || "Sin asignar";

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
                            {request.sourceShift && (
                                <span className="ml-1 text-xs text-muted-foreground">{request.sourceShift.name}</span>
                            )}
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
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}