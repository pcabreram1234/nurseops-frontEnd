"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    shiftChangePolicyService,
    ShiftChangePolicy,
    ShiftChangePolicyFormData,
} from "@/modules/shift-changes/services/shiftChangePolicyService";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import {
    Building2,
    Shield,
    Users,
    Clock,
    FileText,
    Plus,
    LayoutGrid,
} from "lucide-react";

interface ShiftChangePolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    policy?: ShiftChangePolicy | null;
}

export default function ShiftChangePolicyModal({
    isOpen,
    onClose,
    onSuccess,
    policy,
}: ShiftChangePolicyModalProps) {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === "SUPER";
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ShiftChangePolicyFormData>({
        defaultValues: {
            organizationId: user?.organizationId || "",
            branchId: undefined,
            departmentId: undefined,
            enabled: true,
            allowSwap: true,
            allowTransfer: true,
            allowCoverage: true,
            allowCrossDepartment: false,
            allowCrossBranch: false,
            requireJustification: true,
            requireDocument: false,
            requireSupervisorApproval: true,
            requireHrApproval: false,
            minAdvanceHours: 24,
            maxAdvanceDays: 90,
            autoExpireHours: 48,
            maxSimultaneousRequests: 3,
            allowMultipleApplications: false,
        },
    });

    // Cargar datos de la política al abrir el modo edición
    useEffect(() => {
        if (isOpen && policy) {
            form.reset({
                organizationId: policy.organizationId || "",
                branchId: policy.branchId || undefined,
                departmentId: policy.departmentId || undefined,
                enabled: policy.enabled,
                allowSwap: policy.allowSwap,
                allowTransfer: policy.allowTransfer,
                allowCoverage: policy.allowCoverage,
                allowCrossDepartment: policy.allowCrossDepartment,
                allowCrossBranch: policy.allowCrossBranch,
                requireJustification: policy.requireJustification,
                requireDocument: policy.requireDocument,
                requireSupervisorApproval: policy.requireSupervisorApproval,
                requireHrApproval: policy.requireHrApproval,
                minAdvanceHours: policy.minAdvanceHours,
                maxAdvanceDays: policy.maxAdvanceDays,
                autoExpireHours: policy.autoExpireHours,
                maxSimultaneousRequests: policy.maxSimultaneousRequests,
                allowMultipleApplications: policy.allowMultipleApplications,
            });
        }
    }, [isOpen, policy, form]);

    const isEditMode = !!policy?.id;

    const onSubmit = async (data: ShiftChangePolicyFormData) => {
        setIsLoading(true);
        try {
            if (isEditMode && policy?.id) {
                await shiftChangePolicyService.update(policy.id, data);
                toast.success("Política actualizada correctamente");
            } else {
                await shiftChangePolicyService.create(data);
                toast.success("Política creada correctamente");
            }
            onClose();
            onSuccess();
        } catch {
            /* error manejado por el interceptor global de axios */
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Editar Política" : "Nueva Política"}
                    </DialogTitle>
                    <DialogDescription>
                        Configure las reglas que rigen los intercambios, cesiones y coberturas de turnos.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Ámbito organizacional */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isSuperAdmin && (
                            <div className="space-y-2">
                                <Label>Organización</Label>
                                <Input
                                    defaultValue={user?.organizationId || ""}
                                    readOnly
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Sede</Label>
                            <Select
                                onValueChange={(v) =>
                                    form.setValue("branchId", v ?? undefined)
                                }
                                defaultValue={form.getValues("branchId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sede (opcional)" />
                                </SelectTrigger>
                                <SelectContent></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Departamento</Label>
                            <Select
                                onValueChange={(v) =>
                                    form.setValue("departmentId", v ?? undefined)
                                }
                                defaultValue={form.getValues("departmentId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar departamento (opcional)" />
                                </SelectTrigger>
                                <SelectContent></SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Estado general */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Switch
                                checked={form.getValues("enabled")}
                                onCheckedChange={(c) =>
                                    form.setValue("enabled", c)
                                }
                            />
                            Habilitada
                        </Label>
                    </div>

                    {/* Tipos de operación */}
                    <div className="space-y-2">
                        <Label className="font-semibold text-muted-foreground uppercase text-xs">
                            Tipos de Operación
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowSwap")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowSwap", c)
                                    }
                                />
                                <Label className="text-sm">Intercambio (SWAP)</Label>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowTransfer")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowTransfer", c)
                                    }
                                />
                                <Label className="text-sm">Cesión (TRANSFER)</Label>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowCoverage")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowCoverage", c)
                                    }
                                />
                                <Label className="text-sm">Cobertura (COVERAGE)</Label>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowCrossDepartment")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowCrossDepartment", c)
                                    }
                                />
                                <Label className="text-sm">
                                    Entre departamentos
                                </Label>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowCrossBranch")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowCrossBranch", c)
                                    }
                                />
                                <Label className="text-sm">Entre sedes</Label>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                                <Switch
                                    checked={form.getValues("allowMultipleApplications")}
                                    onCheckedChange={(c) =>
                                        form.setValue("allowMultipleApplications", c)
                                    }
                                />
                                <Label className="text-sm">
                                    Múltiples postulaciones
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Requisitos y límites */}
                    <div className="space-y-2">
                        <Label className="font-semibold text-muted-foreground uppercase text-xs">
                            Requisitos y Límites
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Switch
                                        checked={form.getValues("requireJustification")}
                                        onCheckedChange={(c) =>
                                            form.setValue(
                                                "requireJustification",
                                                c
                                            )
                                        }
                                    />
                                    Justificación obligatoria
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Switch
                                        checked={form.getValues("requireDocument")}
                                        onCheckedChange={(c) =>
                                            form.setValue("requireDocument", c)
                                    }
                                    />
                                    Documentación requerida
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Switch
                                        checked={form.getValues("requireSupervisorApproval")}
                                        onCheckedChange={(c) =>
                                            form.setValue(
                                                "requireSupervisorApproval",
                                                c
                                            )
                                    }
                                    />
                                    Aprobación de supervisor
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Switch
                                        checked={form.getValues("requireHrApproval")}
                                        onCheckedChange={(c) =>
                                            form.setValue("requireHrApproval", c)
                                    }
                                    />
                                    Aprobación de RRHH
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Horas de anticipación mínima</Label>
                                <Input
                                    type="number"
                                    value={form.getValues("minAdvanceHours")}
                                    onChange={(e) =>
                                        form.setValue(
                                            "minAdvanceHours",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="24"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Días de anticipación máxima</Label>
                                <Input
                                    type="number"
                                    value={form.getValues("maxAdvanceDays")}
                                    onChange={(e) =>
                                        form.setValue(
                                            "maxAdvanceDays",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="90"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Horas de expiración automática</Label>
                                <Input
                                    type="number"
                                    value={form.getValues("autoExpireHours")}
                                    onChange={(e) =>
                                        form.setValue(
                                            "autoExpireHours",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="48"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Solicitudes simultáneas máx.</Label>
                                <Input
                                    type="number"
                                    value={form.getValues("maxSimultaneousRequests")}
                                    onChange={(e) =>
                                        form.setValue(
                                            "maxSimultaneousRequests",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="3"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading
                                ? "Guardando..."
                                : isEditMode
                                ? "Actualizar"
                                : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
