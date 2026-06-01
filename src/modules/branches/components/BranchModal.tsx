"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Branch, BranchFormData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: BranchFormData) => Promise<void>;
    branch?: Branch | null;
    isSubmitting: boolean;
    organizations: { id: string; name: string }[];
}

export default function BranchModal({ isOpen, onClose, onSubmit, branch, isSubmitting, organizations }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<BranchFormData>({
        defaultValues: {
            name: "",
            organizationId: "",
            address: "",
            city: "",
            state: "",
            country: "Dominican Republic",
            zipCode: "",
            phone: "",
            email: "",
            latitude: 0,
            longitude: 0,
            timezone: "UTC",
            isMainBranch: false,
            isActive: true
        }
    });

    const orgValue = watch("organizationId");
    const isMainBranchValue = watch("isMainBranch");
    const isActiveValue = watch("isActive");
    const currentOrgName = organizations.find(o => o.id === orgValue)?.name;

    useEffect(() => {
        if (!isOpen) return;

        if (branch) {
            reset({
                organizationId: branch.organizationId,
                name: branch.name,
                address: branch.address,
                city: branch.city,
                state: branch.state,
                country: branch.country,
                zipCode: branch.zipCode,
                phone: branch.phone,
                email: branch.email,
                latitude: Number(branch.latitude) || 0,
                longitude: Number(branch.longitude) || 0,
                timezone: branch.timezone || "UTC",
                isMainBranch: branch.isMainBranch,
                isActive: branch.isActive
            });
        } else {
            reset({
                name: "",
                organizationId: organizations[0]?.id || "",
                address: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
                phone: "",
                email: "",
                latitude: 0,
                longitude: 0,
                timezone: "America/Santo_Domingo",
                isMainBranch: false,
                isActive: true
            });
        }
    }, [isOpen, branch, organizations, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{branch ? "Modificar Configuración de Sede" : "Registrar Nueva Sede Operativa"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">

                    {/* SECCIÓN 1: IDENTIDAD Y ASIGNACIÓN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="bName">Nombre de la Sucursal</Label>
                            <Input id="bName" placeholder="Ej. Sucursal Central Metropolitana" {...register("name", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label>Organización Matriz</Label>
                            <Select value={orgValue || ""} onValueChange={(val) => setValue("organizationId", val ?? "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Institución">{currentOrgName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(o => (
                                        <SelectItem key={o.id ?? ""} value={o.id ?? ""}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* SECCIÓN 2: LOCALIZACIÓN */}
                    <div className="space-y-1">
                        <Label htmlFor="bAddress">Dirección Física Completa</Label>
                        <Input id="bAddress" placeholder="Calle, Número, Edificio, Sector..." {...register("address", { required: true })} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="bCity">Ciudad</Label>
                            <Input id="bCity" placeholder="Ej. Santiago" {...register("city", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bState">Estado / Prov.</Label>
                            <Input id="bState" placeholder="Ej. Santiago" {...register("state", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bCountry">País</Label>
                            <Input id="bCountry" placeholder="Ej. DO" {...register("country", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bZip">Cód. Postal</Label>
                            <Input id="bZip" placeholder="Ej. 51000" {...register("zipCode", { required: true })} />
                        </div>
                    </div>

                    {/* SECCIÓN 3: CONTACTO Y TELEMETRÍA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="bPhone">Teléfono Central</Label>
                            <Input id="bPhone" placeholder="Ej. 809-555-0199" {...register("phone", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="bEmail">Correo Electrónico de Enlace</Label>
                            <Input id="bEmail" type="email" placeholder="sucursal@hospital.com" {...register("email", { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                            <Label className="text-[11px]" htmlFor="bLat">Latitud (Opcional)</Label>
                            <Input id="bLat" type="number" step="any" {...register("latitude", { valueAsNumber: true })} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px]" htmlFor="bLng">Longitud (Opcional)</Label>
                            <Input id="bLng" type="number" step="any" {...register("longitude", { valueAsNumber: true })} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px]" htmlFor="bZone">Zona Horaria</Label>
                            <Input id="bZone" {...register("timezone")} className="h-8 text-xs" />
                        </div>
                    </div>

                    {/* SECCIÓN 4: BANDERAS LOGÍSTICAS */}
                    <div className="flex flex-col sm:flex-row gap-5 p-2 justify-start border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Switch checked={isMainBranchValue} onCheckedChange={(checked) => setValue("isMainBranch", checked)} />
                            <div className="flex flex-col">
                                <Label className="text-xs font-bold">Establecer como Sede Principal</Label>
                                <span className="text-[10px] text-muted-foreground">Desactivará cualquier otra sede principal previa en esta organización.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={isActiveValue} onCheckedChange={(checked) => setValue("isActive", checked)} />
                            <div className="flex flex-col">
                                <Label className="text-xs font-bold">Sucursal Activa</Label>
                                <span className="text-[10px] text-muted-foreground">Permite o restringe la asignación de flujos de personal.</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Sincronizando registros..." : "Guardar Estructura"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}