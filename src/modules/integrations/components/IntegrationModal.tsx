"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Integration, ProviderList, PROVIDER_LABELS, PROVIDER_ICONS } from "../types";
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
    integration?: Integration | null;
    isSubmitting: boolean;
}

export default function IntegrationModal({ isOpen, onClose, onSubmit, integration, isSubmitting }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
        defaultValues: { organizationId: "", provider: "SMTP", name: "", isActive: true, configuration: "" }
    });

    const providerValue = watch("provider");
    const isActive = watch("isActive");

    useEffect(() => {
        if (!isOpen) return;
        if (integration) {
            // Al editar, mostramos la configuración existente con secretos ocultos
            const configStr = integration.configuration
                ? JSON.stringify(integration.configuration, null, 2)
                : "{}";
            reset({
                organizationId: integration.organizationId || "",
                provider: integration.provider,
                name: integration.name || "",
                isActive: integration.isActive,
                configuration: configStr,
            });
        } else {
            reset({ organizationId: "", provider: "SMTP", name: "", isActive: true, configuration: "{}" });
        }
    }, [isOpen, integration, reset]);

    const handleFormSubmit = async (data: any) => {
        let config: any = {};
        try {
            config = data.configuration ? JSON.parse(data.configuration) : {};
        } catch {
            alert("La configuración debe ser un JSON válido.");
            return;
        }
        await onSubmit({
            organizationId: data.organizationId,
            provider: data.provider,
            name: data.name,
            isActive: data.isActive,
            configuration: config,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[580px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{integration ? "Editar Integración" : "Nueva Integración"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <Label>Proveedor</Label>
                        <Select value={providerValue || "SMTP"} onValueChange={(v) => v !== null && setValue("provider", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>
                                        {PROVIDER_ICONS[k as ProviderList]} {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Nombre descriptivo</Label>
                        <Input id="name" placeholder="Ej. Servidor SMTP principal" {...register("name")} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="configuration">Configuración (JSON)</Label>
                        <Textarea
                            id="configuration"
                            placeholder='{"host": "smtp.example.com", "port": 587}'
                            rows={6}
                            className="font-mono text-xs"
                            {...register("configuration")}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Ingresa la configuración en formato JSON. Los valores sensibles (tokens, contraseñas) nunca se muestran en el cliente una vez guardados.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">Integración activa</Label>
                            <span className="text-[10px] text-muted-foreground">Determina si el sistema usa esta integración</span>
                        </div>
                        <Switch checked={isActive} onCheckedChange={(c) => setValue("isActive", c)} />
                    </div>

                    <input type="hidden" {...register("organizationId")} />

                    <DialogFooter className="pt-3 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : integration ? "Actualizar" : "Crear Integración"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
