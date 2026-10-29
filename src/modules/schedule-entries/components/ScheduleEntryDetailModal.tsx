"use client";

import { useState } from "react";
import { ScheduleEntry, ScheduleEntryStatus } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Calendar, Clock, User, Building, FileText, ShieldAlert,
    CheckCircle2, AlertTriangle, Moon, XCircle, Loader2, Info
} from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entry: ScheduleEntry | null;
}

const statusLabels: Record<ScheduleEntryStatus, string> = {
    ASSIGNED: "Asignado",
    CONFIRMED: "Confirmado",
    PENDING: "Pendiente",
    CANCELLED: "Cancelado",
    REPLACED: "Reemplazado",
    OPEN: "Vacante",
};

const statusBadge: Record<ScheduleEntryStatus, string> = {
    ASSIGNED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    CANCELLED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
    REPLACED: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    OPEN: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
};

function formatTime(isoString?: string | null): string {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString.substring(0, 5);
    const t = isoString.split("T")[1];
    return t ? t.substring(0, 5) : "--:--";
}

function formatDate(isoString?: string | null): string {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.split("T")[0];
    return d.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function DetailRow({ icon, label, value, className }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${className || "text-slate-900 dark:text-white"}`}>{value}</p>
            </div>
        </div>
    );
}

export default function ScheduleEntryDetailModal({ isOpen, onClose, entry }: Props) {
    const [validation, setValidation] = useState<{ loading: boolean; canAssign?: boolean; errors: string[]; warnings: string[] } | null>(null);

    if (!entry) return null;

    const status = entry.status as ScheduleEntryStatus;
    const isNight = (entry as any).shift?.isNightShift || false;
    const nurseName = entry.nurse?.user
        ? `${entry.nurse.user.firstName} ${entry.nurse.user.lastName}`
        : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Detalle de Asignación
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-1 pt-1">
                    {/* Estado y emergencia */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadge[status] || statusBadge.ASSIGNED}`}>
                            {statusLabels[status] || status}
                        </span>
                        {entry.isEmergencyCoverage && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Emergencia
                            </span>
                        )}
                    </div>

                    <DetailRow
                        icon={<User className="h-4 w-4 text-muted-foreground" />}
                        label="Personal asignado"
                        value={nurseName || <span className="text-muted-foreground italic">Sin asignar (vacante)</span>}
                        className={!nurseName ? "text-amber-600" : ""}
                    />

                    <DetailRow
                        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                        label="Fecha de trabajo"
                        value={<span className="capitalize">{formatDate(entry.date)}</span>}
                    />

                    <DetailRow
                        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                        label="Horario del turno"
                        value={
                            <span className="flex items-center gap-2">
                                {formatTime(entry.shift?.startTime)} — {formatTime(entry.shift?.endTime)}
                                {isNight && <Moon className="h-3.5 w-3.5 text-purple-500" />}
                            </span>
                        }
                    />

                    <DetailRow
                        icon={<Building className="h-4 w-4 text-muted-foreground" />}
                        label="Sede"
                        value={entry.branch?.name || entry.nurse?.branch?.name || entry.shift?.branch?.name || "No especificada"}
                    />

                    <DetailRow
                        icon={<Building className="h-4 w-4 text-muted-foreground" />}
                        label="Departamento"
                        value={entry.shiftTemplate?.department?.name || "No especificado"}
                    />

                    <DetailRow
                        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                        label="Tipo de turno"
                        value={entry.shiftTemplate?.name || entry.shift?.name || "No especificado"}
                    />

                    {entry.notes && (
                        <DetailRow
                            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                            label="Notas / Observaciones"
                            value={<span className="text-slate-600 dark:text-slate-300 font-normal">{entry.notes}</span>}
                        />
                    )}
                </div>

                {/* Indicador de incidencias */}
                {status === "OPEN" && (
                    <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Turno sin cubrir.</strong> No hay personal asignado a esta posición. Asigna una enfermera para cubrir la vacante.
                        </p>
                    </div>
                )}
                {status === "CANCELLED" && (
                    <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50/70 dark:bg-red-950/30 dark:border-red-900 flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800 dark:text-red-200">
                            <strong>Asignación cancelada.</strong> Esta posición fue desasignada y no cuenta con cobertura activa.
                        </p>
                    </div>
                )}

                <div className="pt-4 border-t flex justify-end">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
