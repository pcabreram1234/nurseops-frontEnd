"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ShiftChangeRequest, ShiftChangeFormData } from "../types";
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
    onSubmit: (data: ShiftChangeFormData) => Promise<void>;
    shift?: ShiftChangeRequest | null;
    isSubmitting: boolean;
    shifts: { id: string; name: string; startTime: string; endTime: string }[];
    nurses: { id: string; user?: { firstName: string; lastName: string } }[];
}

export default function ShiftChangeModal({ isOpen, onClose, onSubmit, shift, isSubmitting, shifts, nurses }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: {
            requesterId: "", sourceShiftId: "", targetShiftId: "", reason: "", emergencyRequest: false,
        }
    });

    const requesterId = watch("requesterId");
    const sourceShiftId = watch("sourceShiftId");
    const targetShiftId = watch("targetShiftId");
    const emergencyRequest = watch("emergencyRequest");

    useEffect(() => {
        if (!isOpen) return;
        if (shift) {
            reset({
                requesterId: shift.requesterId || "",
                sourceShiftId: shift.sourceShiftId || "",
                targetShiftId: shift.targetShiftId || "",
                reason: shift.reason || "",
                emergencyRequest: shift.emergencyRequest,
            });
        } else {
            reset({ requesterId: "", sourceShiftId: "", targetShiftId: "", reason: "", emergencyRequest: false });
        }
    }, [isOpen, shift, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{shift ? "Editar Solicitud de Cambio" : "Nueva Solicitud de Cambio"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <Label>Solicitante</Label>
                        <Select value={watch("requesterId") || ""} onValueChange={(v) => v !== null && setValue("requesterId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar solicitante">
                                    {watch("requesterId") ? nurses.find(n => n.id === watch("requesterId"))?.user ? `${nurses.find(n => n.id === watch("requesterId"))?.user?.firstName} ${nurses.find(n => n.id === watch("requesterId"))?.user?.lastName}` : "Cargando..." : undefined}
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
                        <Label>Turno de Origen</Label>
                        <Select value={watch("sourceShiftId") || ""} onValueChange={(v) => v !== null && setValue("sourceShiftId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar turno origen" />
                            </SelectTrigger>
                            <SelectContent>
                                {shifts.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} {s.startTime} - {s.endTime}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Turno de Destino (opcional)</Label>
                        <Select value={watch("targetShiftId") || ""} onValueChange={(v) => v !== null && setValue("targetShiftId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar turno destino" />
                            </SelectTrigger>
                            <SelectContent>
                                {shifts.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} {s.startTime} - {s.endTime}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Motivo</Label>
                        <Textarea id="reason" placeholder="Describe el motivo del cambio..." {...register("reason")} />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">Solicitud de Emergencia</Label>
                            <span className="text-[10px] text-muted-foreground">Marca como cambio de urgencia</span>
                        </div>
                        <Switch checked={watch("emergencyRequest")} onCheckedChange={(c) => setValue("emergencyRequest", c)} />
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creando..." : shift ? "Actualizar Solicitud" : "Crear Solicitud"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}