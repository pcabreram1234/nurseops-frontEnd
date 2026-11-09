"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ShiftTemplate, ShiftTemplateFormData, PreferredShift } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ShiftTemplateFormData) => Promise<void>;
    template?: ShiftTemplate | null;
    isSubmitting: boolean;
    departments: { id: string; name: string }[];
    branches: { id: string; name: string; organizationId: string }[];
    organizations: { id: string; name: string }[];
}

const shiftTypeLabels: Record<PreferredShift, string> = {
    MORNING: "🌅 Mañana (Morning)",
    AFTERNOON: "☀️ Tarde (Afternoon)",
    NIGHT: "🌙 Noche (Night)",
    MORNING_AFTERNOON: "🌅☀️ Mañana-Tarde",
    MORNING_NIGHT: "🌅🌙 Mañana-Noche",
    NIGHT_AFTERNOON: "🌙☀️ Noche-Tarde",
};

const shiftTypeColors: Record<PreferredShift, string> = {
    MORNING: "#0a12f5",
    AFTERNOON: "#f5930a",
    NIGHT: "#260af5",
    MORNING_AFTERNOON: "#024397",
    MORNING_NIGHT: "#02970c",
    NIGHT_AFTERNOON: "#779702",
};

function calculateDurationHours(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 8;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin <= startMin) endMin += 24 * 60; // Crosses midnight
    return Math.round((endMin - startMin) / 60);
}

function calculateIsNightShift(startTime: string, endTime: string): boolean {
    if (!startTime || !endTime) return false;
    const [eh] = endTime.split(":").map(Number);
    const [sh] = startTime.split(":").map(Number);
    // Night if end time is before start time (crosses midnight) or end is after 22:00
    return eh < sh || eh >= 22;
}

export default function ShiftTemplateModal({ isOpen, onClose, onSubmit, template, isSubmitting, departments, branches, organizations }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<ShiftTemplateFormData>({
        defaultValues: {
            organizationId: "", branchId: "", departmentId: "", type: "MORNING", name: "",
            minimum_staff: 1, durationHours: 8, isNightShift: false,
            description: "", configuration: {},
            startTime: "07:00", endTime: "15:00",
            color: "#0a12f5", isActive: true, autoAssignable: true, priority: 1,
        }
    });

    const orgValue = watch("organizationId");
    const branchValue = watch("branchId");
    const deptValue = watch("departmentId");
    const typeValue = watch("type");
    const nameValue = watch("name");
    const startTimeValue = watch("startTime");
    const endTimeValue = watch("endTime");
    const isActiveValue = watch("isActive");
    const autoAssignableValue = watch("autoAssignable");
    const isNightValue = watch("isNightShift");

    const filteredDepartments = useMemo(() => {
        if (!orgValue) return departments;
        return departments; // Departments are already org-scoped by the API
    }, [departments, orgValue]);

    const filteredBranches = useMemo(
        () => branches.filter((branch) => !orgValue || branch.organizationId === orgValue),
        [branches, orgValue],
    );

    // Auto-calculate duration and night shift when times change
    useEffect(() => {
        if (startTimeValue && endTimeValue) {
            const dur = calculateDurationHours(startTimeValue, endTimeValue);
            const isNight = calculateIsNightShift(startTimeValue, endTimeValue);
            setValue("durationHours", dur);
            setValue("isNightShift", isNight);
            if (isNight && !typeValue.includes("NIGHT")) {
                setValue("type", "NIGHT");
            } else if (!isNight && typeValue === "NIGHT") {
                setValue("type", "MORNING");
            }
        }
    }, [startTimeValue, endTimeValue, setValue, typeValue]);

    // Auto-set color based on shift type
    useEffect(() => {
        if (typeValue && shiftTypeColors[typeValue as PreferredShift]) {
            setValue("color", shiftTypeColors[typeValue as PreferredShift]);
        }
    }, [typeValue, setValue]);

    useEffect(() => {
        if (!isOpen) return;
        if (template) {
            reset({
                organizationId: template.organizationId,
                branchId: template.branchId,
                departmentId: template.departmentId || "",
                type: template.type,
                name: template.name || "",
                minimum_staff: template.minimum_staff,
                durationHours: template.durationHours,
                isNightShift: template.isNightShift,
                description: template.description || "",
                configuration: template.configuration || {},
                startTime: template.startTime,
                endTime: template.endTime,
                color: template.color || shiftTypeColors[template.type] || "#3b82f6",
                isActive: template.isActive,
                autoAssignable: template.autoAssignable,
                priority: template.priority,
            });
        } else {
            reset({
                organizationId: organizations[0]?.id || "",
                branchId: branches.find((branch) => branch.organizationId === organizations[0]?.id)?.id || "",
                departmentId: "",
                type: "MORNING",
                name: "",
                minimum_staff: 1, durationHours: 8, isNightShift: false,
                description: "", configuration: {},
                startTime: "07:00", endTime: "15:00",
                color: "#0a12f5", isActive: true, autoAssignable: true, priority: 1,
            });
        }
    }, [isOpen, template, organizations, departments, branches, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{template ? "Editar Plantilla de Turno" : "Nueva Plantilla de Turno"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    {/* SECCIÓN 1: ORGANIZACIÓN Y DEPARTAMENTO */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label>Organización</Label>
                            <Select value={orgValue || ""} onValueChange={(val) => {
                                if (!val) return;
                                setValue("organizationId", val);
                                const nextBranch = branches.find((branch) => branch.organizationId === val);
                                setValue("branchId", nextBranch?.id || "");
                                setValue("departmentId", "");
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar organización">
                                        {orgValue
                                            ? (organizations.find(o => o.id === orgValue)?.name || "Cargando...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Sede</Label>
                            <Select value={branchValue || ""} onValueChange={(val) => val && setValue("branchId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sede">
                                        {branchValue
                                            ? (branches.find(b => b.id === branchValue)?.name || "Cargando...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Departamento</Label>
                            <Select value={deptValue || "none"} onValueChange={(val) => setValue("departmentId", !val || val === "none" ? "" : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Toda la sede (sin departamento)">
                                        {deptValue
                                            ? (departments.find(d => d.id === deptValue)?.name || "Cargando...")
                                            : "Toda la sede"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Toda la sede (sin departamento)</SelectItem>
                                    {filteredDepartments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* SECCIÓN 2: TIPO DE TURNO */}
                    <div className="space-y-1">
                        <Label>Tipo de Turno (sistema)</Label>
                        <Select value={typeValue} onValueChange={(val) => setValue("type", val as PreferredShift)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo">
                                    {typeValue ? shiftTypeLabels[typeValue as PreferredShift] : undefined}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(shiftTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">Tipo técnico usado por el motor de schedules (ej: MORNING, AFTERNOON, NIGHT).</p>
                    </div>

                    {/* SECCIÓN 2b: NOMBRE VISIBLE */}
                    <div className="space-y-1">
                        <Label>Nombre para el usuario</Label>
                        <Input
                            id="templateName"
                            placeholder="Ej: Mañana, Tarde, Noche, Turno Particular..."
                            {...register("name")}
                        />
                        <p className="text-[10px] text-muted-foreground">Nombre legible que verá el usuario en su idioma (opcional).</p>
                    </div>

                    {/* SECCIÓN 3: HORARIO */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">⏰ Horario y Duración</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="startTime" className="text-xs">Hora Inicio</Label>
                                <Input id="startTime" type="time" {...register("startTime", { required: true })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="endTime" className="text-xs">Hora Fin</Label>
                                <Input id="endTime" type="time" {...register("endTime", { required: true })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="durationHours" className="text-xs">Duración (horas)</Label>
                                <Input id="durationHours" type="number" min={1} {...register("durationHours", { valueAsNumber: true })} readOnly className="bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Turno Nocturno</Label>
                                <div className="flex items-center h-9 px-3">
                                    <Switch checked={isNightValue} onCheckedChange={(c) => setValue("isNightShift", c)} />
                                    <span className="ml-2 text-xs">{isNightValue ? "🌙 Sí" : "☀️ No"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: STAFF Y CONFIGURACIÓN */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="minStaff" className="text-xs">Personal Mínimo</Label>
                            <Input id="minStaff" type="number" min={1} {...register("minimum_staff", { valueAsNumber: true, required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="priority" className="text-xs">Prioridad (1-10)</Label>
                            <Input id="priority" type="number" min={1} max={10} {...register("priority", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="color" className="text-xs">Color</Label>
                            <div className="flex items-center gap-2">
                                <Input id="color" type="color" {...register("color")} className="w-12 h-9 p-1 cursor-pointer" />
                                <span className="text-xs font-mono text-muted-foreground">{watch("color")}</span>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 5: DESCRIPCIÓN */}
                    <div className="space-y-1">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" placeholder="Describe las responsabilidades o características de este turno..." {...register("description")} />
                    </div>

                    {/* SECCIÓN 6: SWITCHES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <Label className="text-xs font-bold">Plantilla Activa</Label>
                                    <span className="text-[10px] text-muted-foreground">Visible en el motor de schedules</span>
                                </div>
                                <Switch checked={isActiveValue} onCheckedChange={(c) => setValue("isActive", c)} />
                            </div>
                        </div>
                        <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <Label className="text-xs font-bold">Auto-Asignable</Label>
                                    <span className="text-[10px] text-muted-foreground">El engine puede usar esta plantilla</span>
                                </div>
                                <Switch checked={autoAssignableValue} onCheckedChange={(c) => setValue("autoAssignable", c)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : template ? "Actualizar Plantilla" : "Crear Plantilla"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}