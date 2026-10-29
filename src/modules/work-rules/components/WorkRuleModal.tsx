"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { WorkRule } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    rule?: WorkRule | null;
    isSubmitting: boolean;
}

export default function WorkRuleModal({ isOpen, onClose, onSubmit, rule, isSubmitting }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: { organizationId: "", code: "", name: "", value: "", description: "", isActive: true }
    });

    const isActive = watch("isActive");

    useEffect(() => {
        if (!isOpen) return;
        if (rule) {
            reset({
                organizationId: rule.organizationId || "",
                code: rule.code || "",
                name: rule.name || "",
                value: rule.value || "",
                description: rule.description || "",
                isActive: rule.isActive,
            });
        } else {
            reset({ organizationId: "", code: "", name: "", value: "", description: "", isActive: true });
        }
    }, [isOpen, rule, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{rule ? "Editar Regla de Negocio" : "Nueva Regla de Negocio"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="code">Código</Label>
                            <Input id="code" placeholder="Ej. MAX_MONTHLY_HOURS" {...register("code", { required: true })} disabled={!!rule} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" placeholder="Ej. Máximo de horas mensuales" {...register("name", { required: true })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="value">Valor</Label>
                        <Input id="value" placeholder="Ej. 200" {...register("value", { required: true })} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" placeholder="Describe el propósito de esta regla..." {...register("description")} />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">Regla activa</Label>
                            <span className="text-[10px] text-muted-foreground">Determina si el motor de reglas la evalúa</span>
                        </div>
                        <Switch checked={isActive} onCheckedChange={(c) => setValue("isActive", c)} />
                    </div>

                    <input type="hidden" {...register("organizationId")} />

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : rule ? "Actualizar Regla" : "Crear Regla"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
