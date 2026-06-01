"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, UserFormData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    user?: User | null; // Modo edición si está presente
    isSubmitting: boolean;
    // Datos requeridos para alimentar las relaciones del formulario:
    organizations: { id: string; name: string }[];
    departments: { id: string; name: string }[];
    roles: { id: string; name: string }[];
}

export default function UserModal({ isOpen, onClose, onSubmit, user, isSubmitting, organizations, departments, roles }: Props) {
    const { register, handleSubmit, reset, setValue, watch } = useForm<UserFormData>({
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            organizationId: "",
            departmentId: "",
            rolesId: null,
            status: "ACTIVE"
        }
    });

    const statusValue = watch("status");
    const orgValue = watch("organizationId") || undefined;
    const deptValue = watch("departmentId") || undefined;
    const roleValue = watch("rolesId") || undefined;

    // 🌟 MAPEO DINÁMICO: Buscamos el objeto correspondiente para extraer el 'name'
    const currentOrgName = organizations.find(o => o.id === orgValue)?.name;
    const currentDeptName = departments.find(d => d.id === deptValue)?.name;
    const currentRoleName = roles.find(r => r.id === roleValue)?.name;

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                password: "", // Nunca precargar contraseñas por seguridad
                firstName: user.firstName,
                lastName: user.lastName,
                organizationId: user.organizationId,
                departmentId: user.departmentId,
                rolesId: user.rolesId,
                status: user.status,
            });
        } else {
            reset({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                organizationId: organizations[0]?.id || null,
                departmentId: departments[0]?.id || null,
                rolesId: roles[0]?.id || null,
                status: "ACTIVE"
            });
        }
    }, [user, reset, isOpen, organizations, departments, roles]);

    const onFormSubmit = async (data: UserFormData) => {
        await onSubmit(data);
        onClose();
    };

    // Helper visual para formatear el texto del estado de manera limpia
    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            ACTIVE: "Activo",
            INACTIVE: "Inactivo",
            VACATION: "Vacaciones",
            LICENSE: "Licencia Médica",
            SUSPENDED: "Suspendido"
        };
        return labels[status] || status;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-160">
                <DialogHeader>
                    <DialogTitle>{user ? "Editar Usuario" : "Registrar Nuevo Usuario"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input id="firstName" {...register("firstName", { required: true })} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" {...register("lastName", { required: true })} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input id="email" type="email" placeholder="ejemplo@hospital.com" {...register("email", { required: true })} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Contraseña {user && <span className="text-xs text-muted-foreground">(Dejar en blanco para mantener actual)</span>}</Label>
                        <Input id="password" type="password" {...register("password", { required: !user })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Organización</Label>
                            <Select value={orgValue} onValueChange={(value) => setValue("organizationId", value)}>
                                <SelectTrigger>
                                    {/* 🌟 Si existe el nombre mapeado lo renderiza, de lo contrario muestra el placeholder */}
                                    <SelectValue placeholder="Seleccionar">{currentOrgName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Departamento</Label>
                            <Select value={deptValue} onValueChange={(value) => setValue("departmentId", value)}>
                                <SelectTrigger>
                                    {/* 🌟 Si existe el nombre mapeado lo renderiza, de lo contrario muestra el placeholder */}
                                    <SelectValue placeholder="Seleccionar">{currentDeptName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Rol de Acceso</Label>
                            <Select value={roleValue} onValueChange={(value) => setValue("rolesId", value)}>
                                <SelectTrigger>
                                    {/* 🌟 Si existe el nombre mapeado lo renderiza, de lo contrario muestra el placeholder */}
                                    <SelectValue placeholder="Seleccionar">{currentRoleName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent  >
                                    {roles.map(r => <SelectItem key={r.id} value={r.id} >{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Estado Laboral</Label>
                            <Select value={statusValue} onValueChange={(value) => setValue("status", value as any)}>
                                <SelectTrigger>
                                    {/* 🌟 Traduce el valor interno en string hacia la etiqueta limpia en español */}
                                    <SelectValue placeholder="Seleccionar estado">{getStatusLabel(statusValue)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                    <SelectItem value="VACATION">Vacaciones</SelectItem>
                                    <SelectItem value="LICENSE">Licencia Médica</SelectItem>
                                    <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}