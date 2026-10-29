"use client";

import { useState } from "react";
import {
    WorkRule, WorkRuleCondition, WorkRuleAction,
    RULE_TYPE_LABELS, RULE_TYPE_BADGE,
    CONDITION_TYPES, CONDITION_OPERATORS, ACTION_TYPES,
} from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Plus, Trash2, ChevronDown, ChevronRight, Settings2, Zap,
    Loader2
} from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    rule: WorkRule | null;
    conditions: WorkRuleCondition[];
    actions: WorkRuleAction[];
    isLoadingDetail: boolean;
    onCreateCondition: (data: any) => Promise<void>;
    onDeleteCondition: (id: string) => Promise<void>;
    onToggleCondition: (id: string, enabled: boolean) => Promise<void>;
    onCreateAction: (data: any) => Promise<void>;
    onDeleteAction: (id: string) => Promise<void>;
    onToggleAction: (id: string, enabled: boolean) => Promise<void>;
    isSaving: boolean;
}

export default function RuleDetailModal({
    isOpen, onClose, rule, conditions, actions, isLoadingDetail,
    onCreateCondition, onDeleteCondition, onToggleCondition,
    onCreateAction, onDeleteAction, onToggleAction, isSaving,
}: Props) {
    const [showConditions, setShowConditions] = useState(true);
    const [showActions, setShowActions] = useState(true);
    const [addingCondition, setAddingCondition] = useState(false);
    const [addAction, setAddAction] = useState(false);

    // Formulario nueva condición
    const [condType, setCondType] = useState("");
    const [condOperator, setCondOperator] = useState("");
    const [condValue, setCondValue] = useState("");

    // Formulario nueva acción
    const [actType, setActType] = useState("");
    const [actValue, setActValue] = useState("");

    // Patrón oficial de React: ajustar estado durante el render en lugar de setState dentro de useEffect
    const [wasOpen, setWasOpen] = useState(true);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (!isOpen) {
            setAddingCondition(false);
            setAddAction(false);
            setCondType(""); setCondOperator(""); setCondValue("");
            setActType(""); setActValue("");
            setShowConditions(true);
            setShowActions(true);
        }
    }

    if (!rule) return null;

    const handleAddCondition = async () => {
        if (!condType || !condOperator || !condValue) return;
        await onCreateCondition({
            workRuleId: rule.id,
            condition_type: condType,
            operator: condOperator,
            value: condValue,
        });
        setCondType(""); setCondOperator(""); setCondValue("");
        setAddingCondition(false);
    };

    const handleAddAction = async () => {
        if (!actType) return;
        await onCreateAction({
            workRuleId: rule.id,
            action_type: actType,
            action_value: actValue || "",
        });
        setActType(""); setActValue("");
        setAddAction(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[640px] max-h-[88vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        {rule.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${RULE_TYPE_BADGE[rule.type] || RULE_TYPE_BADGE.CONFIGURABLE}`}>
                        {RULE_TYPE_LABELS[rule.type] || rule.type}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${rule.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {rule.isActive ? "Activa" : "Inactiva"}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">{rule.code}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground">Valor:</span><span className="text-sm font-bold font-mono">{rule.value}</span></div>
                    {rule.description && (
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground">Descripción</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{rule.description}</p>
                        </div>
                    )}
                </div>

                {isLoadingDetail ? (
                    <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando configuración...
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {/* CONDICIONES */}
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowConditions(!showConditions)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Settings2 className="h-3.5 w-3.5" /> Condiciones ({conditions.length})
                                </span>
                                {showConditions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            {showConditions && (
                                <div className="p-3 space-y-2">
                                    {conditions.length === 0 && !addingCondition && (
                                        <p className="text-xs text-muted-foreground text-center py-2">Sin condiciones configuradas</p>
                                    )}
                                    {conditions.map(c => (
                                        <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 group">
                                            <Switch
                                                checked={c.enabled}
                                                onCheckedChange={(v) => onToggleCondition(c.id, v)}
                                            />
                                            <div className="flex-1 min-w-0 text-xs">
                                                <span className="font-mono font-bold">{c.condition_type}</span>
                                                <span className="text-muted-foreground mx-1">{c.operator}</span>
                                                <span className="font-mono font-bold">{c.value}</span>
                                            </div>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                                onClick={() => onDeleteCondition(c.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {addingCondition && (
                                        <div className="p-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 space-y-2">
                                            <div className="grid grid-cols-3 gap-2">
                                                <Select value={condType} onValueChange={(v) => v !== null && setCondType(v)}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                                                    <SelectContent>
                                                        {CONDITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={condOperator} onValueChange={(v) => v !== null && setCondOperator(v)}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Operador" /></SelectTrigger>
                                                    <SelectContent>
                                                        {CONDITION_OPERATORS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    placeholder="Valor"
                                                    value={condValue}
                                                    onChange={(e) => setCondValue(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setAddingCondition(false)}>Cancelar</Button>
                                                <Button size="sm" className="text-xs h-7" onClick={handleAddCondition} disabled={isSaving || !condType || !condOperator || !condValue}>
                                                    {isSaving ? "Guardando..." : "Agregar"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {!addingCondition && (
                                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-dashed" onClick={() => setAddingCondition(true)}>
                                            <Plus className="h-3 w-3" /> Agregar condición
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ACCIONES */}
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowActions(!showActions)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5" /> Acciones ({actions.length})
                                </span>
                                {showActions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            {showActions && (
                                <div className="p-3 space-y-2">
                                    {actions.length === 0 && !addAction && (
                                        <p className="text-xs text-muted-foreground text-center py-2">Sin acciones configuradas</p>
                                    )}
                                    {actions.map(a => (
                                        <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 group">
                                            <Switch
                                                checked={a.enabled}
                                                onCheckedChange={(v) => onToggleAction(a.id, v)}
                                            />
                                            <div className="flex-1 min-w-0 text-xs">
                                                <span className="font-mono font-bold">{a.action_type}</span>
                                                {a.action_value && <span className="text-muted-foreground ml-1">→ {a.action_value}</span>}
                                            </div>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                                                onClick={() => onDeleteAction(a.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {addAction && (
                                        <div className="p-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select value={actType} onValueChange={(v) => v !== null && setActType(v)}>
                                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Tipo de acción" /></SelectTrigger>
                                                    <SelectContent>
                                                        {ACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    placeholder="Valor (opcional)"
                                                    value={actValue}
                                                    onChange={(e) => setActValue(e.target.value)}
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setAddAction(false)}>Cancelar</Button>
                                                <Button size="sm" className="text-xs h-7" onClick={handleAddAction} disabled={isSaving || !actType}>
                                                    {isSaving ? "Guardando..." : "Agregar"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {!addAction && (
                                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-dashed" onClick={() => setAddAction(true)}>
                                            <Plus className="h-3 w-3" /> Agregar acción
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-[11px] text-muted-foreground italic">
                            Las condiciones y acciones son interpretadas por el motor de reglas del backend. Modificarlas no ejecuta acciones operacionales inmediatamente.
                        </p>
                    </div>
                )}

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
