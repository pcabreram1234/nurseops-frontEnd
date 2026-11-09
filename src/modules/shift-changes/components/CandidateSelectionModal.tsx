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
import { ShiftChangeRequest, resolvePersonName } from "../types";
import { shiftChangeService } from "../services/shiftChangeService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ShiftChangeRequest | null;
    onSelected: () => void;
    isActing?: boolean;
}

export default function CandidateSelectionModal({
    isOpen,
    onClose,
    request,
    onSelected,
    isActing = false,
}: Props) {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [comments, setComments] = useState("");

    if (!request) return null;

    const applications = (request.applications || []).filter(
        (a: any) => a.status === "PENDING",
    );

    if (applications.length === 0) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="p-6">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Candidata</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        No hay postulaciones pendientes para esta solicitud.
                    </p>
                    <DialogFooter>
                        <Button onClick={onClose}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    const handleSelect = async () => {
        if (!selectedCandidateId) {
            toast.error("Debe seleccionar una candidata.");
            return;
        }
        try {
            await shiftChangeService.selectCandidate(request.id, {
                candidateNurseId: selectedCandidateId,
                comments: comments.trim() || undefined,
            });
            toast.success("Candidata seleccionada correctamente");
            onClose();
            onSelected();
        } catch {
            /* error ya notificado por el interceptor global */
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>Seleccionar Candidata para Cobertura</DialogTitle>
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

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Candidatas Disponibles</Label>
                        {applications.map((app: any) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedCandidateId(app.nurseId)}
                                className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                                    selectedCandidateId === app.nurseId
                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            checked={selectedCandidateId === app.nurseId}
                                            onChange={() => setSelectedCandidateId(app.nurseId)}
                                            className="w-4 h-4 text-primary"
                                            readOnly
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-sm font-semibold">
                                                {resolvePersonName(app.nurse)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Postulado: {new Date(app.appliedAt).toLocaleDateString("es-ES")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1">
                        <Label>Comentarios para la candidata</Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Mensaje opcional para la candidata seleccionada..."
                            rows={3}
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
                        onClick={handleSelect}
                        disabled={isActing || !selectedCandidateId}
                    >
                        {isActing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Seleccionar Candidata
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
