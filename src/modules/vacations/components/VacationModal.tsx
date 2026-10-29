"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Vacation } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    vacation?: Vacation | null;
    isSubmitting: boolean;
    nurses: { id: string; user?: { firstName: string; lastName: string } }[];
}

export default function VacationModal({ isOpen, onClose, onSubmit, vacation, isSubmitting, nurses }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: { nurseId: "", startDate: "", endDate: "", reason: "", notes: "" }
    });

    const nurseValue = watch("nurseId");

    useEffect(() => {
        if (!isOpen) return;
        if (vacation) {
            reset({
                nurseId: vacation.nurseId || "",
                startDate: vacation.startDate?.split("T")[0] || "",
                endDate: vacation.endDate?.split("T")[0] || "",
                reason: vacation.reason || "",
                notes: vacation.notes || "",
            });
        } else {
            reset({ nurseId: "", startDate: "", endDate: "", reason: "", notes: "" });
        }
    }, [isOpen, vacation, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{vacation ? "Editar Solicitud de Vacaciones" : "Nueva Solicitud de Vacaciones"}</DialogTitle>
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="startDate">Fecha inicio</Label>
                            <Input id="startDate" type="date" {...register("startDate", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endDate">Fecha fin</Label>
                            <Input id="endDate" type="date" {...register("endDate", { required: true })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea id="reason" placeholder="Describe el motivo de las vacaciones..." {...register("reason")} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="notes">Notas</Label>
                        <Textarea id="notes" placeholder="Observaciones adicionales..." {...register("notes")} />
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : vacation ? "Actualizar" : "Crear Solicitud"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
