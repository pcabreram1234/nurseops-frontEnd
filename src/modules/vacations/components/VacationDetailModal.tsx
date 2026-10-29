"use client";

import { Vacation, VACATION_STATUS_LABELS, VACATION_STATUS_BADGE } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, CheckCircle2, XCircle, Clock, Building } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vacation: Vacation | null;
}

function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.split("T")[0];
    return d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <div className="text-sm font-semibold mt-0.5 text-slate-900 dark:text-white">{children}</div>
            </div>
        </div>
    );
}

export default function VacationDetailModal({ isOpen, onClose, vacation }: Props) {
    if (!vacation) return null;

    const status = vacation.status;
    const nurseName = vacation.nurse?.user
        ? `${vacation.nurse.user.firstName} ${vacation.nurse.user.lastName}`
        : vacation.nurseId;
    const approverName = vacation.approvedBy
        ? `${vacation.approvedBy.firstName} ${vacation.approvedBy.lastName}`
        : vacation.approvedById || "—";
    const isRejected = status === "REJECTED";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> Detalle de Vacaciones
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${VACATION_STATUS_BADGE[status] || VACATION_STATUS_BADGE.DRAFT}`}>
                        {VACATION_STATUS_LABELS[status] || status}
                    </span>
                </div>

                <div>
                    <Row icon={<User className="h-4 w-4 text-muted-foreground" />} label="Enfermera">
                        {nurseName}
                        {vacation.nurse?.department?.name && (
                            <span className="block text-xs font-normal text-muted-foreground">Departamento: {vacation.nurse.department.name}</span>
                        )}
                        <span className="block text-xs font-normal text-muted-foreground">
                            Sede: {vacation.branch?.name || vacation.nurse?.branch?.name || "Sin sede"}
                        </span>
                    </Row>

                    <Row icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Período solicitado">
                        {formatDate(vacation.startDate)} — {formatDate(vacation.endDate)}
                    </Row>

                    {vacation.reason && (
                        <Row icon={<FileText className="h-4 w-4 text-muted-foreground" />} label="Motivo">
                            <span className="font-normal text-slate-600 dark:text-slate-300">{vacation.reason}</span>
                        </Row>
                    )}

                    {vacation.notes && (
                        <Row icon={<FileText className="h-4 w-4 text-muted-foreground" />} label="Notas del solicitante">
                            <span className="font-normal text-slate-600 dark:text-slate-300">{vacation.notes}</span>
                        </Row>
                    )}

                    <Row icon={<Clock className="h-4 w-4 text-muted-foreground" />} label="Fecha de registro">
                        {formatDateTime(vacation.createdAt)}
                    </Row>

                    {/* ==================== RESOLUCIÓN ==================== */}
                    {vacation.approvedAt && (
                        <div className="mt-4 p-3.5 rounded-xl border bg-blue-50/60 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                                {isRejected
                                    ? <><XCircle className="h-3.5 w-3.5" /> Resolución del supervisor</>
                                    : <><CheckCircle2 className="h-3.5 w-3.5" /> Resolución del supervisor</>
                                }
                            </p>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <span className="text-muted-foreground font-normal">Decisión: </span>
                                    <span className={`font-bold ${isRejected ? "text-red-600" : "text-emerald-600"}`}>
                                        {isRejected ? "Rechazada" : "Aprobada"}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-muted-foreground font-normal">Supervisor: </span>
                                    <span className="font-semibold">{approverName}</span>
                                </p>
                                <p>
                                    <span className="text-muted-foreground font-normal">Fecha de resolución: </span>
                                    <span className="font-semibold">{formatDateTime(vacation.approvedAt)}</span>
                                </p>
                                {vacation.rejectionReason && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900">
                                        <span className="text-[11px] font-bold uppercase text-red-600 block mb-0.5">Motivo de rechazo</span>
                                        <span className="text-xs text-red-700 dark:text-red-300">{vacation.rejectionReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!vacation.approvedAt && status !== "DRAFT" && (
                        <div className="mt-4 p-3 rounded-xl border bg-amber-50/60 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 flex items-start gap-2">
                            <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Esta solicitud aún no tiene resolución registrada de un supervisor.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}