"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NurseAvailability, AVAILABILITY_STATUS_LABELS, SHIFT_PREFERENCE_LABELS } from "../types";
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
    availability?: NurseAvailability | null;
    isSubmitting: boolean;
    nurses: { id: string; user?: { firstName: string; lastName: string } }[];
}

export default function AvailabilityModal({ isOpen, onClose, onSubmit, availability, isSubmitting, nurses }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: {
            nurseId: "", date: "", status: "AVAILABLE", shiftPreference: "FLEXIBLE",
            availableForEmergency: false, availableForOvertime: false, notes: "",
        }
    });

    const nurseValue = watch("nurseId");
    const statusValue = watch("status");
    const shiftPrefValue = watch("shiftPreference");
    const emergencyValue = watch("availableForEmergency");
    const overtimeValue = watch("availableForOvertime");

    useEffect(() => {
        if (!isOpen) return;
        if (availability) {
            reset({
                nurseId: availability.nurseId || "",
                date: availability.date?.split("T")[0] || "",
                status: availability.status,
                shiftPreference: availability.shiftPreference || "FLEXIBLE",
                availableForEmergency: availability.availableForEmergency,
                availableForOvertime: availability.availableForOvertime,
                notes: availability.notes || "",
            });
        } else {
            reset({
                nurseId: "", date: new Date().toISOString().split("T")[0],
                status: "AVAILABLE", shiftPreference: "FLEXIBLE",
                availableForEmergency: false, availableForOvertime: false, notes: "",
            });
        }
    }, [isOpen, availability, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{availability ? "Editar Disponibilidad" : "Registrar Disponibilidad"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <Label>Enfermera</Label>
                        <Select value={nurseValue || ""} onValueChange={(v) => v !== null && setValue("nurseId", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar enfermera">
                                    {nurseValue ? (nurses.find(n => n.id === nurseValue)?.user ? `${nurses.find(n => n.id === nurseValue)?.user?.firstName} ${nurses.find(n => n.id === nurseValue)?.user?.lastName}` : "Cargando...") : undefined}
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
                        <Label htmlFor="date">Fecha</Label>
                        <Input id="date" type="date" {...register("date", { required: true })} />
                    </div>

                    <div className="space-y-1">
                        <Label>Estado de disponibilidad</Label>
                        <Select value={statusValue || "AVAILABLE"} onValueChange={(v) => v !== null && setValue("status", v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(AVAILABILITY_STATUS_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Preferencia de turno</Label>
                        <Select value={shiftPrefValue || "FLEXIBLE"} onValueChange={(v) => v !== null && setValue("shiftPreference", v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar preferencia" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(SHIFT_PREFERENCE_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <Label className="text-xs font-bold">Emergencia</Label>
                            <Switch checked={emergencyValue} onCheckedChange={(c) => setValue("availableForEmergency", c)} />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <Label className="text-xs font-bold">Horas extras</Label>
                            <Switch checked={overtimeValue} onCheckedChange={(c) => setValue("availableForOvertime", c)} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea id="notes" placeholder="Observaciones sobre la disponibilidad..." {...register("notes")} />
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : availability ? "Actualizar" : "Registrar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
