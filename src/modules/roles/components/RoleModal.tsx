"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Role, RoleFormData, Permission } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, CheckSquare, Square, Search, CheckCircle2, XCircle } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormData) => Promise<void>;
    role?: Role | null;
    isSubmitting: boolean;
    organizations: { id: string; name: string }[];
    permissionsCatalog: Permission[];
}

export default function RoleModal({ isOpen, onClose, onSubmit, role, isSubmitting, organizations, permissionsCatalog }: Props) {
    const [searchTerm, setSearchTerm] = useState("");

    const { register, handleSubmit, reset, setValue, watch } = useForm<RoleFormData>({
        defaultValues: {
            name: "",
            // organizationId: "",
            permissionIds: []
        }
    });

    // const orgValue = watch("organizationId");
    const selectedPermissionIds = watch("permissionIds") || [];

    // const currentOrgName = organizations.find(o => o.id === orgValue)?.name;

    // 🔍 Filtrado reactivo en tiempo real por 'name' o por 'description'
    const filteredPermissions = permissionsCatalog.filter(perm =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limpiar la barra de búsqueda cada vez que el modal se abre o cierra
    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (role) {
            const activePermissionIds = role.rolePermissions?.map(p => p.permisionId) || [];
            reset({
                name: role.name,
                // organizationId: role.organizationId || "",
                permissionIds: activePermissionIds
            });
        } else {
            reset({
                name: "",
                // organizationId: organizations[0]?.id || "",
                permissionIds: []
            });
        }
    }, [isOpen, role, organizations, reset]);

    const handleTogglePermission = (permissionId: string) => {
        if (selectedPermissionIds.includes(permissionId)) {
            setValue("permissionIds", selectedPermissionIds.filter(id => id !== permissionId));
        } else {
            setValue("permissionIds", [...selectedPermissionIds, permissionId]);
        }
    };

    // ☑️ Selecciona únicamente los permisos que son visibles en la búsqueda actual
    const handleSelectAllFiltered = () => {
        const filteredIds = filteredPermissions.map(p => p.id);
        // Combinamos lo que ya estaba seleccionado con lo nuevo (evitando duplicados)
        const newSelection = Array.from(new Set([...selectedPermissionIds, ...filteredIds]));
        setValue("permissionIds", newSelection);
    };

    // ✖️ Deselecciona únicamente los permisos que son visibles en la búsqueda actual
    const handleDeselectAllFiltered = () => {
        const filteredIds = filteredPermissions.map(p => p.id);
        // Mantenemos solo los IDs que NO forman parte del filtro actual
        const newSelection = selectedPermissionIds.filter(id => !filteredIds.includes(id));
        setValue("permissionIds", newSelection);
    };

    const onFormSubmit = async (data: RoleFormData) => {
        await onSubmit(data);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>{role ? "Modificar Rol y Accesos" : "Crear Nuevo Rol Estructural"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div className="space-y-1">
                            <Label htmlFor="roleName">Nombre del Rol</Label>
                            <Input id="roleName" placeholder="Ej. Médico Especialista, Enfermero Supervisor" {...register("name", { required: true })} />
                        </div>
{/* 
                        <div className="space-y-1">
                            <Label>Institución / Organización Asignada</Label>
                            <Select value={orgValue || ""} onValueChange={(val) => setValue("organizationId", val ?? "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Organización">{currentOrgName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(o => (
                                        <SelectItem key={o.id ?? ""} value={o.id ?? ""}>
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* 🛡️ MATRIZ DE ASIGNACIÓN DE PERMISOS */}
                        <div className="space-y-3 pt-2">
                            <div className="flex flex-col gap-1">
                                <Label className="text-sm font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                                    <ShieldAlert className="h-4 w-4 text-primary" /> Matriz de Permisos del Sistema
                                </Label>
                                <p className="text-xs text-muted-foreground">Selecciona los accesos operacionales que poseerán los usuarios vinculados a este rol.</p>
                            </div>

                            {/* 🔍 BARRA DE BÚSQUEDA Y ACCIONES MASIVAS */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-100/60 p-2 rounded-lg dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Filtrar permisos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 h-8 text-xs bg-white dark:bg-slate-950"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAllFiltered}
                                        className="h-8 text-[11px] gap-1 px-2.5 bg-white dark:bg-slate-950"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Seleccionar todos
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeselectAllFiltered}
                                        className="h-8 text-[11px] gap-1 px-2.5 bg-white dark:bg-slate-950"
                                    >
                                        <XCircle className="h-3.5 w-3.5 text-rose-500" /> Limpiar selección
                                    </Button>
                                </div>
                            </div>

                            {/* CONTENEDOR DE LA LISTA FILTRADA */}
                            <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto border border-slate-100 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 dark:border-slate-800磁">
                                {filteredPermissions.map((perm) => {
                                    const isChecked = selectedPermissionIds.includes(perm.id);
                                    return (
                                        <div
                                            key={perm.id}
                                            onClick={() => handleTogglePermission(perm.id)}
                                            className="flex items-start gap-3 p-2 rounded-md hover:bg-white border border-transparent hover:border-slate-200/60 dark:hover:bg-slate-950 dark:hover:border-slate-800 cursor-pointer transition-all select-none"
                                        >
                                            <div className="mt-0.5 shrink-0 text-primary">
                                                {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-400" />}
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {perm.name}
                                                </span>
                                                <p className="text-xs text-muted-foreground leading-relaxed pt-1">{perm.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredPermissions.length === 0 && permissionsCatalog.length > 0 && (
                                    <p className="text-xs text-center text-muted-foreground py-6">No hay ningún permiso que coincida con "{searchTerm}".</p>
                                )}

                                {permissionsCatalog.length === 0 && (
                                    <p className="text-xs text-center text-muted-foreground py-6">No hay permisos registrados en el catálogo de seguridad.</p>
                                )}
                            </div>

                            {/* PEQUEÑO CONTADOR INFORMATIVO DE SELECCIÓN */}
                            <div className="text-[11px] text-right text-muted-foreground font-medium px-1">
                                Permisos seleccionados: <span className="text-primary font-bold">{selectedPermissionIds.length}</span> de {permissionsCatalog.length}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-slate-50/70 border-t border-slate-100 dark:bg-slate-950/40 dark:border-slate-800">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando Configuración..." : "Guardar Estructura"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}