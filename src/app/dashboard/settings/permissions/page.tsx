"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    permissionService,
    Permission,
    CreatePermissionDto,
} from "@/modules/permissions";
import {
    Button,
} from "@/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus, Search, X, Loader2, Edit2, Trash2, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";

const MANAGE_ROLES = ["SUPER", "SYSTEM_ADMIN"];

export default function PermissionManagementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [permissionsData, setPermissionsData] = useState<{ data: Permission[]; meta: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { user } = useAuthStore();
    const canManage = MANAGE_ROLES.includes(user?.role || "");

    const fetchPermissions = async () => {
        setIsLoading(true);
        try {
            const result = await permissionService.getAll({ limit: 10 });
            setPermissionsData(result);
        } catch {
            setPermissionsData({ data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const permissions = permissionsData?.data || [];

    const handleOpenCreate = () => {
        setSelectedPermission(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (p: Permission) => {
        setSelectedPermission(p);
        setIsModalOpen(true);
    };

    const handleOpenDelete = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (dto: CreatePermissionDto) => {
        setIsSaving(true);
        try {
            if (selectedPermission) {
                await permissionService.update(selectedPermission.id, {
                    name: dto.name,
                    description: dto.description,
                });
                toast.success("Permiso actualizado correctamente");
            } else {
                await permissionService.create(dto);
                toast.success("Permiso creado correctamente");
            }
            setIsModalOpen(false);
            setSelectedPermission(null);
            fetchPermissions();
        } catch {
            // Error manejado por interceptor global
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            await permissionService.remove(deleteTargetId);
            toast.success("Permiso eliminado correctamente");
            setIsDeleteOpen(false);
            setDeleteTargetId(null);
            fetchPermissions();
        } catch {
            // Error manejado por interceptor global
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        const q = searchInput.toLowerCase().trim();
        if (!q) return permissions;
        return permissions.filter((p: Permission) =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }, [permissions, searchInput]);

    const stats = useMemo(() => ({
        total: permissions.length,
        filtered: filtered.length,
    }), [permissions, filtered]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Permisos</h1>
                        <p className="text-muted-foreground">
                            Administra los permisos del sistema. Los permisos se asignan a roles y controlan el acceso a las funcionalidades.
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                            <Plus className="h-4 w-4" /> Nuevo Permiso
                        </Button>
                    )}
                </div>

                {(permissions.length > 0 || isLoading) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Shield className="h-4 w-4 text-primary" /></div>
                            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{stats.total}</p></div>
                        </div>
                        {searchInput.trim() && (
                            <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Search className="h-4 w-4 text-blue-600" /></div>
                                <div><p className="text-xs text-muted-foreground">Resultados</p><p className="text-lg font-bold text-blue-600">{stats.filtered}</p></div>
                            </div>
                        )}
                    </div>
                )}

                {(permissions.length > 0 || searchInput) && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre o descripción..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9 pr-9"
                                    autoFocus
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {searchInput && (
                                <Button variant="ghost" size="sm" onClick={() => setSearchInput("")} className="text-xs gap-1">
                                    <X className="h-3 w-3" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando permisos...
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                        <Shield className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No existen permisos registrados.
                        </p>
                        {canManage && (
                            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                                <Plus className="h-3.5 w-3.5" /> Crear primer permiso
                            </Button>
                        )}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                        <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                        <p className="text-sm font-semibold">Sin coincidencias para &quot;{searchInput}&quot;</p>
                        <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSearchInput("")}>
                            <X className="h-3 w-3" /> Limpiar búsqueda
                        </Button>
                    </div>
                ) : (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" /> Permisos ({filtered.length}{filtered.length !== permissions.length ? ` de ${permissions.length}` : ""})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Nombre</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Descripción</th>
                                            <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((p: Permission) => (
                                            <tr key={p.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3 font-semibold text-xs">
                                                    {p.name}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {p.description || "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            title="Ver detalle"
                                                            onClick={() => handleOpenEdit(p)}
                                                        >
                                                            <Eye className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                        {canManage && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                title="Editar"
                                                                onClick={() => handleOpenEdit(p)}
                                                            >
                                                                <Edit2 className="h-3 w-3 text-slate-500" />
                                                            </Button>
                                                        )}
                                                        {canManage && p.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-destructive"
                                                                title="Eliminar"
                                                                onClick={() => handleOpenDelete(p.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <PermissionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPermission(null);
                }}
                onSuccess={handleFormSubmit}
                permission={selectedPermission}
                isSaving={isSaving}
            />

            {isDeleteOpen && (
                <DeleteConfirmModal
                    isOpen={isDeleteOpen}
                    onClose={() => {
                        setIsDeleteOpen(false);
                        setDeleteTargetId(null);
                    }}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
}

function Shield({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    );
}

function Eye({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/**
 * Modal para crear/editar un permiso
 */
function PermissionModal({
    isOpen,
    onClose,
    onSuccess,
    permission,
    isSaving,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (dto: CreatePermissionDto) => void;
    permission: Permission | null;
    isSaving: boolean;
}) {
    const [name, setName] = useState(permission?.name || "");
    const [description, setDescription] = useState(permission?.description || "");

    useEffect(() => {
        setName(permission?.name || "");
        setDescription(permission?.description || "");
    }, [permission]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess({ name, description });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-slate-950 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{permission ? "Editar Permiso" : "Crear Permiso"}</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del permiso</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: CREATE_SHIFT_CHANGE_REQUEST"
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descripción de qué permite este permiso"
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Guardando..." : permission ? "Actualizar" : "Crear"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/**
 * Modal de confirmación de eliminación
 */
function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-slate-950 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold mb-2">Eliminar Permiso</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        ¿Estás seguro de que deseas eliminar este permiso? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
