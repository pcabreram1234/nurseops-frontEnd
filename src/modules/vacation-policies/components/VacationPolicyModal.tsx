"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    VacationPolicy,
    VacationPolicyRule,
    VacationRegimeCode,
    REGIME_LABELS,
    ACCRUAL_METHOD_LABELS,
} from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    policy?: VacationPolicy | null;
    isSubmitting?: boolean;
}

export default function VacationPolicyModal({ isOpen, onClose, onSubmit, policy, isSubmitting }: Props) {
    const isEdit = !!policy;

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [regimeCode, setRegimeCode] = useState<VacationRegimeCode>(VacationRegimeCode.STANDARD);
    const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split("T")[0]);
    const [effectiveTo, setEffectiveTo] = useState("");
    const [accrualMethod, setAccrualMethod] = useState("MONTHLY");
    const [carryOverMaxDays, setCarryOverMaxDays] = useState("5");
    const [carryOverExpiryMonths, setCarryOverExpiryMonths] = useState("3");
    const [minAdvanceNoticeDays, setMinAdvanceNoticeDays] = useState("15");
    const [maxConsecutiveDays, setMaxConsecutiveDays] = useState("30");
    const [requiresApproval, setRequiresApproval] = useState(true);
    const [rules, setRules] = useState<VacationPolicyRule[]>([
        { minYears: 0, maxYears: 5, daysEarned: 14, description: "Base" },
    ]);

    useEffect(() => {
        if (!isOpen) return;
        if (policy) {
            setCode(policy.code);
            setName(policy.name);
            setDescription(policy.description || "");
            setRegimeCode(policy.regimeCode);
            setEffectiveFrom(policy.effectiveFrom.split("T")[0]);
            setEffectiveTo(policy.effectiveTo ? policy.effectiveTo.split("T")[0] : "");
            setAccrualMethod(policy.accrualMethod);
            setCarryOverMaxDays(String(policy.carryOverMaxDays));
            setCarryOverExpiryMonths(String(policy.carryOverExpiryMonths));
            setMinAdvanceNoticeDays(String(policy.minAdvanceNoticeDays));
            setMaxConsecutiveDays(String(policy.maxConsecutiveDays));
            setRequiresApproval(policy.requiresApproval);
            setRules(policy.rules.length > 0 ? policy.rules : [{ minYears: 0, maxYears: 5, daysEarned: 14 }]);
        } else {
            setCode("");
            setName("");
            setDescription("");
            setRegimeCode(VacationRegimeCode.STANDARD);
            setEffectiveFrom(new Date().toISOString().split("T")[0]);
            setEffectiveTo("");
            setAccrualMethod("MONTHLY");
            setCarryOverMaxDays("5");
            setCarryOverExpiryMonths("3");
            setMinAdvanceNoticeDays("15");
            setMaxConsecutiveDays("30");
            setRequiresApproval(true);
            setRules([{ minYears: 0, maxYears: 5, daysEarned: 14, description: "Base" }]);
        }
    }, [isOpen, policy]);

    const updateRule = (index: number, patch: Partial<VacationPolicyRule>) => {
        setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const handleSubmit = async () => {
        await onSubmit({
            code,
            name,
            description: description || undefined,
            regimeCode,
            effectiveFrom,
            effectiveTo: effectiveTo || undefined,
            accrualMethod,
            carryOverMaxDays: Number(carryOverMaxDays),
            carryOverExpiryMonths: Number(carryOverExpiryMonths),
            minAdvanceNoticeDays: Number(minAdvanceNoticeDays),
            maxConsecutiveDays: Number(maxConsecutiveDays),
            requiresApproval,
            rules: rules.map((r) => ({
                minYears: Number(r.minYears),
                maxYears: r.maxYears != null ? Number(r.maxYears) : undefined,
                daysEarned: Number(r.daysEarned),
                description: r.description || undefined,
            })),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Editar Política: ${policy?.code}` : "Nueva Política de Vacaciones"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Identificación */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identificación</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Código *</Label>
                                <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} placeholder="VAC-STD-2026" />
                            </div>
                            <div className="space-y-1">
                                <Label>Nombre *</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Política Estándar 2026" />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label>Descripción</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Régimen</Label>
                                <Select value={regimeCode} onValueChange={(v) => setRegimeCode(v as VacationRegimeCode)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(REGIME_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Método de devengo</Label>
                                <Select value={accrualMethod} onValueChange={(v) => setAccrualMethod(v || "MONTHLY")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ACCRUAL_METHOD_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Vigencia */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Vigencia</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Vigente desde *</Label>
                                <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Vigente hasta (opcional)</Label>
                                <Input type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Parámetros operativos */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Parámetros Operativos</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Máx. días de arrastre</Label>
                                <Input type="number" min={0} value={carryOverMaxDays} onChange={(e) => setCarryOverMaxDays(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Meses hasta expirar arrastre</Label>
                                <Input type="number" min={0} value={carryOverExpiryMonths} onChange={(e) => setCarryOverExpiryMonths(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Aviso mínimo (días)</Label>
                                <Input type="number" min={0} value={minAdvanceNoticeDays} onChange={(e) => setMinAdvanceNoticeDays(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Máx. días consecutivos</Label>
                                <Input type="number" min={1} value={maxConsecutiveDays} onChange={(e) => setMaxConsecutiveDays(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
                            <Label className="font-normal">Requiere aprobación de supervisor</Label>
                        </div>
                    </div>

                    {/* Reglas por antigüedad */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reglas por Antigüedad</p>
                            <Button type="button" variant="outline" size="sm" className="gap-1"
                                onClick={() => setRules((prev) => [...prev, { minYears: 0, daysEarned: 14 }])}>
                                <Plus className="h-3 w-3" /> Agregar regla
                            </Button>
                        </div>
                        {rules.map((rule, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
                                <div className="space-y-1">
                                    <Label>Desde (años)</Label>
                                    <Input type="number" min={0} value={rule.minYears} onChange={(e) => updateRule(index, { minYears: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Hasta (años)</Label>
                                    <Input type="number" min={0} value={rule.maxYears ?? ""} onChange={(e) => updateRule(index, { maxYears: e.target.value ? Number(e.target.value) : undefined })} placeholder="∞" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Días ganados</Label>
                                    <Input type="number" min={1} value={rule.daysEarned} onChange={(e) => updateRule(index, { daysEarned: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Nota</Label>
                                    <Input value={rule.description || ""} onChange={(e) => updateRule(index, { description: e.target.value })} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive"
                                    onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !code || !name}>
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        {isEdit ? "Guardar Cambios" : "Crear Política"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
