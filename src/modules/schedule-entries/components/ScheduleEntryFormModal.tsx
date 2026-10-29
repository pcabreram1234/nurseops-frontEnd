"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ScheduleEntry, ScheduleEntryFormData } from "../types";
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
    onSubmit: (data: any) => Promise<void>;
    entry?: ScheduleEntry | null;
    isSubmitting: boolean;
    departments: { id: string; name: string }[];
    nurses: { id: string; user?: { firstName: string; lastName: string } }[];
    shifts: { id: string; name: string; startTime: string; endTime: string; departmentId?: string; shiftTemplateId?: string }[];
}

function formatTime(isoString?: string | null): string {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString.substring(0, 5);
    const t = isoString.split("T")[1];
    return t ? t.substring(0, 5) : "--:--";
}

export default function ScheduleEntryFormModal({ isOpen, onClose, onSubmit, entry, isSubmitting, departments, nurses, shifts }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: {
            scheduleId: "", nurseId: "", shiftId: "", shiftTemplateId: "",
            date: "", notes: "", isEmergencyCoverage: false,
        }
    });

    const shiftValue = watch("shiftId");
    const nurseValue = watch("nurseId");
    const dateValue = watch("date");
    const isEmergency = watch("isEmergencyCoverage");

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
                shiftId: entry.shiftId,
                shiftTemplateId: (entry as any).shiftTemplateId || "",
                date: entry.date?.split("T")[0] || "",
                notes: entry.notes || "",
                isEmergencyCoverage: entry.isEmergencyCoverage || false,
            });
        } else {
            reset({
                scheduleId: shifts[0]?.shiftTemplateId ? "" : "",
                nurseId: "", shiftId: "", shiftTemplateId: "",
                date: new Date().toISOString().split("T")[0],
                notes: "", isEmergencyCoverage: false,
            });
        }
    }, [isOpen, entry, shifts, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{entry ? "Editar Asignación" : "Nueva Asignación Diaria"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    {/* FECHA */}
                    <div className="space-y-1">
                        <Label htmlFor="date">Fecha del Turno</Label>
                        <Input id="date" type="date" {...register("date", { required: true })} />
                    </div>

                    {/* ENFERMERA Y TURNO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Personal de Enfermería</Label>
                            <Select value={nurseValue || ""} onValueChange={(val) => val !== null && setValue("nurseId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar enfermera">
                                        {nurseValue
                                            ? (nurses.find(n => n.id === nurseValue)?.user
                                                ? `${nurses.find(n => n.id === nurseValue)?.user?.firstName} ${nurses.find(n => n.id === nurseValue)?.user?.lastName}`
                                                : "Cargando...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">-- Vacante / Sin asignar --</SelectItem>
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
                            <Select value={shiftValue || ""} onValueChange={(val) => val !== null && setValue("shiftId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar turno">
                                        {shiftValue
                                            ? (shifts.find(s => s.id === shiftValue)?.name || "Cargando...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {(filteredShifts.length > 0 ? filteredShifts : shifts).map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            [{s.name}] {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : entry ? "Actualizar Asignación" : "Crear Asignación"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}