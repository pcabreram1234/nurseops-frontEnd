"use client";

import { useEffect } from "react";
import { useForm, } from "react-hook-form";
import { Department, DepartmentFormData, DepartmentType, DepartmentCriticalLevel } from "../types";
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
    onSubmit: (data: DepartmentFormData) => Promise<void>;
    department?: Department | null;
    isSubmitting: boolean;
    organizations: { id: string; name: string }[];
    branches: { id: string; name: string; organizationId: string }[];
}

// 🌟 Importamos o declaramos tu Record de traducción aquí arriba
const departmentTypeLabels: Record<DepartmentType, string> = {
    ICU: "Cuidados Intensivos",
    ER: "Urgencias / Emergencias",
    PEDIATRICS: "Pediatría",
    SURGERY: "Cirugía General",
    CARDIOLOGY: "Cardiología",
    RADIOLOGY: "Radiología e Imagen",
    ONCOLOGY: "Oncología",
    MATERNITY: "Maternidad y Ginecología",
    LABORATORY: "Laboratorio Clínico",
    TRAUMA: "Traumatología",
    INTERNAL_MEDICINE: "Medicina Interna",
    GENERAL: "Medicina General"
};

export default function DepartmentModal({ isOpen, onClose, onSubmit, department, isSubmitting, organizations, branches }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<DepartmentFormData>({
        defaultValues: {
            name: "", code: "", description: "", organizationId: "", branchId: "",
            type: "GENERAL", criticalLevel: "MEDIUM", minimumStaff: 1, optimalStaff: 1, maxCapacity: 10,
            allowOvertime: true, allowsCrossDepartment: false, requiresSpecialization: false, isEmergencyDepartment: false,
            emergencyPriority: 1, isActive: true
        }
    });

    const orgValue = watch("organizationId");
    const branchValue = watch("branchId");
    const typeValue = watch("type");
    const criticalValue = watch("criticalLevel");
    const isEmergency = watch("isEmergencyDepartment");

    const allowOvertimeVal = watch("allowOvertime");
    const allowsCrossDeptVal = watch("allowsCrossDepartment");
    const requiresSpecVal = watch("requiresSpecialization");
    const isActiveVal = watch("isActive");

    // Filtrar sucursales que pertenecen a la organización seleccionada
    const filteredBranches = branches.filter(b => b.organizationId === orgValue);

    useEffect(() => {
        if (!isOpen) return;
        if (department) {
            reset({
                ...department,
                emergencyPriority: department.emergencyPriority || 1,
            });
        } else {
            reset({
                name: "", code: "", description: "",
                organizationId: organizations[0]?.id || "",
                branchId: branches.find(b => b.organizationId === organizations[0]?.id)?.id || "",
                type: "GENERAL", criticalLevel: "MEDIUM", minimumStaff: 2, optimalStaff: 5, maxCapacity: 20,
                allowOvertime: true, allowsCrossDepartment: false, requiresSpecialization: false, isEmergencyDepartment: false,
                emergencyPriority: 1, isActive: true
            });
        }
    }, [isOpen, department, organizations, branches, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{department ? "Editar Parámetros de Departamento" : "Crear Nuevo Departamento Clínico/Adm"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    {/* SECCIÓN 1: IDENTIFICACIÓN Y UBICACIÓN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="depName">Nombre del Departamento</Label>
                            <Input id="depName" placeholder="Ej. Unidad de Cuidados Intensivos" {...register("name", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="depCode">Código Único (Alfanumérico)</Label>
                            <Input id="depCode" placeholder="Ej. UCI-01" disabled={!!department} {...register("code", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label>Organización Matriz</Label>
                            <Select value={orgValue || ""} onValueChange={(val: any) => {
                                setValue("organizationId", val);
                                const firstBranch = branches.find(b => b.organizationId === val);
                                setValue("branchId", firstBranch ? firstBranch.id : "");
                            }}>
                                {/* 🌟 Agregamos placeholder explícito por si el valor tarda en cargar */}
                                <SelectTrigger>
                                    {/* 🌟 SOLUCIÓN VISUAL CRÍTICA: Si Radix UI pierde la referencia por el ciclo de renderizado, 
               buscamos manualmente el nombre de la organización en el catálogo para pintarlo directamente */}
                                    <SelectValue placeholder="Seleccione Organización">
                                        {orgValue
                                            ? (organizations.find(o => o.id === orgValue)?.name || "Cargando organización...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label>Sucursal / Sede Asignada</Label>
                            <Select value={branchValue || ""} onValueChange={(val) => setValue("branchId", val || "")}>
                                <SelectTrigger>
                                    {/* 🌟 SOLUCIÓN VISUAL CRÍTICA: Si Radix UI pierde la referencia por el ciclo de renderizado, 
               buscamos manualmente el nombre de la organización en el catálogo para pintarlo directamente */}
                                    <SelectValue placeholder="Seleccione Sucursal">
                                        {branchValue
                                            ? (branches.find(b => b.id === branchValue)?.name || "Cargando sucursal...")
                                            : undefined
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Tipo de Departamento</Label>
                            <Select value={typeValue} onValueChange={(val) => setValue("type", val as DepartmentType)}>
                                <SelectTrigger>
                                    {/* 🌟 Muestra la traducción directa del estado si existe, de lo contrario un placeholder */}
                                    <SelectValue placeholder="Seleccione Tipo">
                                        {typeValue ? departmentTypeLabels[typeValue] : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {/* 🌟 Renderizado dinámico basado en tu mapeo de enums reales */}
                                    {Object.entries(departmentTypeLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Nivel de Criticidad</Label>
                            <Select value={criticalValue} onValueChange={(val) => setValue("criticalLevel", val as DepartmentCriticalLevel)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione Criticidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Bajo (Low)</SelectItem>
                                    <SelectItem value="MEDIUM">Medio (Medium)</SelectItem>
                                    <SelectItem value="HIGH">Alto (High)</SelectItem>
                                    <SelectItem value="CRITICAL">Crítico Operacional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="depDesc">Descripción de Funciones</Label>
                        <Textarea id="depDesc" placeholder="Detalle los servicios, alcances o personal que maneja este departamento..." {...register("description")} />
                    </div>

                    {/* SECCIÓN 2: TELEMETRÍA DE CAPACIDADES Y PERSONAL */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Reglas de Capacidad y Staff Mínimo</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="minStaff" className="text-xs">Mínimo Personal Requerido</Label>
                                <Input id="minStaff" type="number" {...register("minimumStaff", { valueAsNumber: true, required: true })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="optStaff" className="text-xs">Personal Óptimo (Ideal)</Label>
                                <Input id="optStaff" type="number" {...register("optimalStaff", { valueAsNumber: true, required: true })} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="maxCap" className="text-xs">Capacidad Máxima Física</Label>
                                <Input id="maxCap" type="number" {...register("maxCapacity", { valueAsNumber: true, required: true })} />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: CONFIGURACIONES DINÁMICAS Y EMERGENCIAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col"><Label className="text-xs font-bold">Permitir Horas Extras</Label><span className="text-[10px] text-muted-foreground">Regula los turnos extendidos</span></div>
                                <Switch checked={allowOvertimeVal} onCheckedChange={(c) => setValue("allowOvertime", c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col"><Label className="text-xs font-bold">Flujo Inter-Departamental</Label><span className="text-[10px] text-muted-foreground">Permite personal de apoyo externo</span></div>
                                <Switch checked={allowsCrossDeptVal} onCheckedChange={(c) => setValue("allowsCrossDepartment", c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col"><Label className="text-xs font-bold">Requiere Especialización</Label><span className="text-[10px] text-muted-foreground">Filtra médicos/enfermeros avanzados</span></div>
                                <Switch checked={requiresSpecVal} onCheckedChange={(c) => setValue("requiresSpecialization", c)} />
                            </div>
                        </div>

                        <div className="space-y-3 p-3 border rounded-lg bg-white dark:bg-slate-950">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col"><Label className="text-xs font-bold">Módulo de Emergencias Activo</Label><span className="text-[10px] text-muted-foreground">Afecta algoritmos de optimización</span></div>
                                <Switch checked={isEmergency} onCheckedChange={(c) => setValue("isEmergencyDepartment", c)} />
                            </div>

                            {isEmergency && (
                                <div className="space-y-1 pt-1 border-t border-dashed animate-in fade-in duration-200">
                                    <Label htmlFor="emPriority" className="text-xs font-semibold text-rose-500">Prioridad en Caso de Emergencia (1-10)</Label>
                                    <Input id="emPriority" type="number" min={1} max={10} {...register("emergencyPriority", { valueAsNumber: true })} className="h-8 text-xs border-rose-200" />
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex flex-col"><Label className="text-xs font-bold">Departamento Operativo Activo</Label><span className="text-[10px] text-muted-foreground">Visibilidad global en cuadrantes</span></div>
                                <Switch checked={isActiveVal} onCheckedChange={(c) => setValue("isActive", c)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando Configuración..." : "Guardar Departamento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}