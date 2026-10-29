"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Absence } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ABSENCE_TYPE_LABELS } from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    absence?: Absence | null;
    isSubmitting: boolean;
    nurses: { id: string; user?: { firstName: string; lastName: string } }[];
}

export default function AbsenceModal({ isOpen, onClose, onSubmit, absence, isSubmitting, nurses }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: {
            nurseId: "", date: "", endDate: "", type: "SICKNESS", reason: "",
            reporterById: "", notes: "", requiresCoverage: true, emergencyLevel: 1,
        }
    });

    const typeValue = watch("type");
    const requiresCoverage = watch("requiresCoverage");

    useEffect(() => {
        if (!isOpen) return;
        if (absence) {
            reset({
                nurseId: absence.nurseId || "",
                date: absence.date?.split("T")[0] || "",
                endDate: absence.endDate?.split("T")[0] || "",
                type: absence.type,
                reason: absence.reason || "",
                reporterById: absence.reporterById || "",
                notes: absence.notes || "",
                requiresCoverage: absence.requiresCoverage,
                emergencyLevel: absence.emergencyLevel || 1,
            });
        } else {
            reset({
                nurseId: "", date: new Date().toISOString().split("T")[0], endDate: "",
                type: "SICKNESS", reason: "", reporterById: "", notes: "",
                requiresCoverage: true, emergencyLevel: 1,
            });
        }
    }, [isOpen, absence, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{absence ? "Editar Ausencia" : "Registrar Ausencia"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <Label>Enfermera</Label>
                        <Select value={watch("nurseId") || ""} onValueChange={(v) => v !== null && setValue("nurseId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar enfermera">
                                    {watch("nurseId") ? (nurses.find(n => n.id === watch("nurseId"))?.user ? `${nurses.find(n => n.id === watch("nurseId"))?.user?.firstName} ${nurses.find(n => n.id === watch("nurseId"))?.user?.lastName}` : "Cargando...") : undefined}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {nurses.map(n => (
                                    <SelectItem key={n.id} value={n.id}>
                                        {n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Tipo de Ausencia</Label>
                        <Select value={typeValue || "SICKNESS"} onValueChange={(v) => v !== null && setValue("type", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ABSENCE_TYPE_LABELS).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="date">Fecha inicio</Label>
                            <Input id="date" type="date" {...register("date", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endDate">Fecha fin (opcional)</Label>
                            <Input id="endDate" type="date" {...register("endDate")} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea id="reason" placeholder="Describe el motivo de la ausencia..." {...register("reason", { required: true })} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="notes">Notas adicionales</Label>
                        <Textarea id="notes" placeholder="Observaciones..." {...register("notes")} />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">Requiere cobertura</Label>
                            <span className="text-[10px] text-muted-foreground">Marcar si se necesita sustituir al personal</span>
                        </div>
                        <Switch checked={requiresCoverage} onCheckedChange={(c) => setValue("requiresCoverage", c)} />
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : absence ? "Actualizar" : "Registrar Ausencia"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
