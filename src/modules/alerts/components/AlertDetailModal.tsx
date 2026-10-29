"use client";

import { useState } from "react";
import {
    OperationalAlert, ALERT_STATUS_LABELS, ALERT_STATUS_BADGE,
    SEVERITY_LABELS, SEVERITY_BADGE, ALERT_TYPE_LABELS, ESCALATION_TIERS,
} from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Building, Clock, CheckCircle2, Tag, TrendingUp } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    alert: OperationalAlert | null;
    onResolve: (id: string, payload: { resolutionNotes: string; resolvedById: string }) => Promise<void>;
    onEscalate: (id: string, payload: { targetTier: string; reason: string }) => Promise<void>;
    isProcessing: boolean;
    currentUserId: string;
}

type Mode = "view" | "resolve" | "escalate";

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export default function AlertDetailModal({
    isOpen, onClose, alert, onResolve, onEscalate, isProcessing, currentUserId,
}: Props) {
    const [notes, setNotes] = useState("");
    const [mode, setMode] = useState<Mode>("view");
    const [targetTier, setTargetTier] = useState<string>(ESCALATION_TIERS[0].value);
    const [escalateReason, setEscalateReason] = useState("");

    // Patrón oficial de React: ajustar estado durante el render al abrir/cerrar
    const [wasOpen, setWasOpen] = useState(false);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) { setNotes(""); setMode("view"); setEscalateReason(""); setTargetTier(ESCALATION_TIERS[0].value); }
    }

    if (!alert) return null;

    const isResolved = alert.status === "RESOLVED";

    const handleResolve = async () => {
        if (notes.trim().length < 10) return;
        await onResolve(alert.id, { resolutionNotes: notes, resolvedById: currentUserId });
        onClose();
    };

    const handleEscalate = async () => {
        if (escalateReason.trim().length < 5) return;
        await onEscalate(alert.id, { targetTier, reason: escalateReason });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Detalle de Alerta
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${SEVERITY_BADGE[alert.severity] || SEVERITY_BADGE.MEDIUM}`}>
                        {SEVERITY_LABELS[alert.severity] || alert.severity}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ALERT_STATUS_BADGE[alert.status] || ALERT_STATUS_BADGE.OPEN}`}>
                        {ALERT_STATUS_LABELS[alert.status] || alert.status}
                    </span>
                </div>

                <div className="space-y-1">
                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Tipo</p>
                            <p className="text-sm font-semibold">{ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <Building className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Departamento</p>
                            <p className="text-sm font-semibold">
                                {alert.department?.name || alert.departmentId || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Fecha de creación</p>
                            <p className="text-sm font-semibold">{formatDateTime(alert.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground mb-1">Mensaje</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{alert.message}</p>
                </div>

                {/* ================= ACCIONES ================= */}
                {!isResolved && mode === "view" && (
                    <div className="pt-4 border-t space-y-2">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Acciones disponibles</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => setMode("resolve")}>
                                <CheckCircle2 className="h-4 w-4" /> Resolver
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => setMode("escalate")}>
                                <TrendingUp className="h-4 w-4" /> Escalar
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "resolve" && (
                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="resolutionNotes">Notas de resolución (mínimo 10 caracteres)</Label>
                        <Textarea
                            id="resolutionNotes"
                            placeholder="Describe cómo se resolvió esta alerta..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setMode("view")} disabled={isProcessing}>Volver</Button>
                            <Button size="sm" onClick={handleResolve} disabled={isProcessing || notes.trim().length < 10} className="gap-1.5">
                                <CheckCircle2 className="h-4 w-4" />
                                {isProcessing ? "Resolviendo..." : "Marcar como resuelta"}
                            </Button>
                        </div>
                    </div>
                )}

                {mode === "escalate" && (
                    <div className="space-y-3 pt-4 border-t">
                        <div className="space-y-1">
                            <Label>Nivel de escalación</Label>
                            <Select value={targetTier} onValueChange={(v) => v !== null && setTargetTier(v)}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ESCALATION_TIERS.map(t => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">
                                Escalar eleva la severidad a CRITICAL y notifica al nivel seleccionado.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="escalateReason">Motivo de la escalación (mínimo 5 caracteres)</Label>
                            <Textarea
                                id="escalateReason"
                                placeholder="Justifica por qué debe escalarse esta alerta..."
                                value={escalateReason}
                                onChange={(e) => setEscalateReason(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setMode("view")} disabled={isProcessing}>Volver</Button>
                            <Button size="sm" variant="destructive" onClick={handleEscalate}
                                disabled={isProcessing || escalateReason.trim().length < 5} className="gap-1.5">
                                <TrendingUp className="h-4 w-4" />
                                {isProcessing ? "Escalando..." : "Confirmar escalación"}
                            </Button>
                        </div>
                    </div>
                )}

                {isResolved && (
                    <div className="mt-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800 dark:text-emerald-200">
                            <strong>Alerta resuelta.</strong> No admite acciones adicionales.
                        </p>
                    </div>
                )}

                <DialogFooter className="pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}