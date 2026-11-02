"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScheduleEntry, ScheduleEntryFormData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useScheduleEntryValidation, NurseWithProfile, ShiftWithTemplate } from "../hooks/useScheduleEntryValidation";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    entry?: ScheduleEntry | null;
    isSubmitting: boolean;
    departments: { id: string; name: string }[];
    nurses: NurseWithProfile[];
    shifts: ShiftWithTemplate[];
    departmentsMap?: Map<string, string>;
    backendErrors: string[];
}

function formatTime(isoString?: string | null): string {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString.substring(0, 5);
    const t = isoString.split("T")[1];
    return t ? t.substring(0, 5) : "--:--";
}

export default function ScheduleEntryFormModal({ isOpen, onClose, onSubmit, entry, isSubmitting, departments, nurses, shifts, departmentsMap, backendErrors }: Props) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors: formErrors } } = useForm<any>({
        defaultValues: {
            scheduleId: "", nurseId: "", shiftId: "", shiftTemplateId: "",
            date: "", notes: "", isEmergencyCoverage: false,
        }
    });

    const { validateAssignment } = useScheduleEntryValidation({ nurses, shifts, currentEntry: entry, departmentsMap });

    const shiftValue = watch("shiftId");
    const nurseValue = watch("nurseId");
    const dateValue = watch("date");
    const isEmergency = watch("isEmergencyCoverage");

    // Estado para validaciones en tiempo real
    const [validationResult, setValidationResult] = useState<{ canAssign: boolean; errors: string[]; warnings: string[] }>({
        canAssign: true, errors: [], warnings: []
    });
    const [showValidation, setShowValidation] = useState(false);
    // backendErrors viene del componente padre (page.tsx)

    // Validación en tiempo real cuando cambian los campos clave
    useEffect(() => {
        if (!nurseValue || !shiftValue || !dateValue) {
            setValidationResult({ canAssign: true, errors: [], warnings: [] });
            setShowValidation(false);
            return;
        }

        // Solo validar si hay enfermera seleccionada (no vacante)
        if (nurseValue !== "") {
            const result = validateAssignment({
                nurseId: nurseValue,
                shiftId: shiftValue,
                date: dateValue,
                departmentId: "", // Se ignora en validación actual
                notes: "",
                isEmergencyCoverage: isEmergency
            });
            setValidationResult(result);
            setShowValidation(true);
        } else {
            setValidationResult({ canAssign: true, errors: [], warnings: [] });
            setShowValidation(false);
        }
    }, [nurseValue, shiftValue, dateValue, isEmergency, validateAssignment]);

    // Filter shifts by selected date
    const filteredShifts = useMemo(() => {
        if (!dateValue) return shifts;
        return shifts.filter(s => {
            const shiftDate = s.startTime?.split("T")[0] || s.startTime;
            return shiftDate === dateValue;
        });
    }, [shifts, dateValue]);

    // Auto-set shiftTemplateId when shift changes
    useEffect(() => {
        if (shiftValue) {
            const shift = shifts.find(s => s.id === shiftValue);
            if (shift) {
                setValue("shiftTemplateId", shift.shiftTemplateId || "");
            }
        }
    }, [shiftValue, shifts, setValue]);

    useEffect(() => {
        if (!isOpen) return;
        if (entry) {
            reset({
                scheduleId: entry.scheduleId,
                nurseId: entry.nurseId || "",
                shiftId: entry.shiftId || "",
                shiftTemplateId: (entry as any).shiftTemplateId || "",
                date: entry.date?.split("T")[0] || "",
                notes: entry.notes || "",
                isEmergencyCoverage: entry.isEmergencyCoverage || false,
            });
        } else {
            reset({
                scheduleId: "",
                nurseId: "", shiftId: "", shiftTemplateId: "",
                date: new Date().toISOString().split("T")[0],
                notes: "", isEmergencyCoverage: false,
            });
        }
    }, [isOpen, entry, shifts, reset]);

    const handleValidatedSubmit = async (data: any) => {
        // 1. Asegurar valores por defecto para los campos críticos
        // Esto evita que el backend reciba undefined en lugar de "" o valores válidos
        const safeData = {
            status: "ASSIGNED",
            notes: data.notes || "",
            isEmergencyCoverage: data.isEmergencyCoverage || false,
            optimizationScore: null,
            departmentId: entry?.shift?.departmentId || "",
            nurseId: data.nurseId || "",
            shiftId: data.shiftId || "",
            shiftTemplateId: data.shiftTemplateId || "",
            date: data.date || new Date().toISOString().split("T")[0],
            scheduleId: data.scheduleId || "",
        };

        // 2. Validación orientativa (solo advertencias, NO bloquee el submit)
        // El backend ya tiene su propia validación más estricta en schedule-entries.service.ts
        const result = validateAssignment(safeData);

        // 3. Si hay warnings, preguntar al usuario pero NO bloquear el submit
        if (result.warnings.length > 0 && !window.confirm("Hay advertencias para esta asignación. ¿Continuar de todas formas?")) {
            return;
        }

        // 5. ENVIAR el DTO al backend
        // El padre (page.tsx) maneja errores y actualiza backendErrors
        await onSubmit(safeData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{entry ? "Editar Asignación" : "Nueva Asignación Diaria"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleValidatedSubmit)} className="space-y-5 pt-2">
                    {/* FECHA */}
                    <div className="space-y-1">
                        <Label htmlFor="date">Fecha del Turno</Label>
                        <Input id="date" type="date" {...register("date", { required: true })} />
                    </div>

                    {/* ENFERMERA Y TURNO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Personal de Enfermería</Label>
                            <Select value={nurseValue || ""} onValueChange={(val: any) => setValue("nurseId", val === "UNASSIGNED" ? "" : (val ?? ""))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar enfermera">
                                        {nurseValue
                                            ? (nurses.find(n => n.id === nurseValue)?.user
                                                ? `${nurses.find(n => n.id === nurseValue)?.user?.firstName} ${nurses.find(n => n.id === nurseValue)?.user?.lastName}`
                                                : "Cargando...")
                                            : "Vacante / Sin asignar"
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNASSIGNED">-- Vacante / Sin asignar --</SelectItem>
                                    {nurses.map(n => (
                                        <SelectItem key={n.id} value={n.id}>
                                            {n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Turno / Horario</Label>
                            <Select value={shiftValue || ""} onValueChange={(val: any) => setValue("shiftId", val ?? "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar turno">
                                        {shiftValue
                                            ? (shifts.find(s => s.id === shiftValue)?.type || "Cargando...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    {(filteredShifts.length > 0 ? filteredShifts : shifts).map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            [{s.type}] {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* VALIDATION FEEDBACK */}
                    {((showValidation && (validationResult.errors.length > 0 || validationResult.warnings.length > 0)) || backendErrors.length > 0) && (
                        <div className="rounded-lg border p-3 space-y-2 bg-slate-50 dark:bg-slate-900">
                            {backendErrors.length > 0 && (
                                <div className="space-y-1 border-l-4 border-red-500 pl-3">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Error del Servidor</span>
                                    </div>
                                    {backendErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
                                    ))}
                                </div>
                            )}
                            {validationResult.errors.length > 0 && (
                                <div className="space-y-1 border-l-4 border-red-500 pl-3">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Bloqueos detectados</span>
                                    </div>
                                    {validationResult.errors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
                                    ))}
                                </div>
                            )}
                            {validationResult.warnings.length > 0 && (
                                <div className="space-y-1 border-l-4 border-amber-500 pl-3">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Advertencias</span>
                                    </div>
                                    {validationResult.warnings.map((warn, i) => (
                                        <p key={i} className="text-sm text-amber-600 dark:text-amber-400">{warn}</p>
                                    ))}
                                </div>
                            )}
                            {(validationResult.errors.length === 0 && validationResult.warnings.length === 0 && backendErrors.length === 0) && (
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="font-semibold text-sm">Validación correcta - Asignación permitida</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTAS */}
                    <div className="space-y-1">
                        <Label htmlFor="notes">Notas / Observaciones</Label>
                        <Textarea id="notes" placeholder="Motivo de la asignación, observaciones clínicas..." {...register("notes")} />
                    </div>

                    {/* EMERGENCIA */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">Cobertura de Emergencia</Label>
                            <span className="text-[10px] text-muted-foreground">Marca esta asignación como cobertura urgente</span>
                        </div>
                        <Switch checked={isEmergency} onCheckedChange={(c) => setValue("isEmergencyCoverage", c)} />
                    </div>

                    {/* HIDDEN FIELDS */}
                    <input type="hidden" {...register("shiftTemplateId")} />
                    <input type="hidden" {...register("scheduleId")} />

                    <DialogFooter className="pt-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting || (showValidation && validationResult.errors.length > 0)}>
                            {isSubmitting ? "Guardando..." : entry ? "Actualizar Asignación" : "Crear Asignación"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}