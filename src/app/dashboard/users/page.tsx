"use client";

import { useState } from "react";
import { useUsers } from "@/modules/users/hooks/useUsers";
import { User, UserFormData } from "@/modules/users/types";
import UserModal from "@/modules/users/components/UserModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, UserCheck, Shield, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";

export default function UsersPage() {
    // 1. Estados reactivos para controlar la consulta paginada de tu Backend
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string>("ALL");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 2. Consumo del hook enviándole los filtros activos
    const { users, meta, isLoading, isFetching, createUser, isCreating, updateUser, isUpdating, deleteUser
    } = useUsers({
        page,
        limit: 10,
        search: search || undefined,
        status: status === "ALL" ? undefined : status
    });


    // Consultas secundarias para alimentar los selects del modal
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: depts = [] } = useQuery({ queryKey: ["form-depts"], queryFn: async () => (await apiInstance.get("/departments")).data });
    const { data: roles = [] } = useQuery({ queryKey: ["form-roles"], queryFn: async () => (await apiInstance.get("/roles")).data });


    const handleOpenCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: UserFormData) => {
        if (selectedUser) {
            await updateUser({ id: selectedUser.id, data });
        } else {
            await createUser(data);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de desvincular a este usuario del sistema de turnos?")) {
            await deleteUser(id);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Resetear a la primera página ante una nueva búsqueda
    };

    const handleStatusFilterChange = (value: string) => {
        setStatus(value);
        setPage(1); // Resetear a la primera página ante un nuevo filtro
    };

    const getStatusStyle = (status: User["status"]) => {
        switch (status) {
            case "ACTIVE": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";
            case "VACATION": return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400";
            case "LICENSE": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";
            default: return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Personal Operativo</h1>
                    <p className="text-muted-foreground">Administra médicos, supervisores y personal de enfermería con soporte de filtros y paginación en tiempo real.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Registrar Usuario
                </Button>
            </div>

            {/* 🔍 BARRA DE FILTROS AVANZADOS (Mapeados a tu query de NestJS) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, apellido o correo..."
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-9 w-full"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={status} onValueChange={(value) => handleStatusFilterChange(value || "ALL")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Estados</SelectItem>
                            <SelectItem value="ACTIVE">Activos</SelectItem>
                            <SelectItem value="INACTIVE">Inactivos</SelectItem>
                            <SelectItem value="VACATION">En Vacaciones</SelectItem>
                            <SelectItem value="LICENSE">Licencia Médica</SelectItem>
                            <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios Registrados</CardTitle>
                    <CardDescription>Mostrando {users.length} de {meta.total} resultados en total.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Consultando base de datos paginada...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                            <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">No se encontraron usuarios que coincidan con la búsqueda</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70 font-medium text-muted-foreground dark:bg-slate-900/50 dark:border-slate-800">
                                            <th className="p-4">Nombre Completo</th>
                                            <th className="p-4">Correo</th>
                                            <th className="p-4">Organización</th>
                                            <th className="p-4">Rol</th>
                                            <th className="p-4">Estado</th>
                                            <th className="p-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/30 transition-colors">
                                                <td className="p-4 font-semibold text-slate-900 dark:text-white">
                                                    {u.firstName} {u.lastName}
                                                </td>
                                                <td className="p-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                                                <td className="p-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {u.organization?.name || "Sin Institución"}
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                        <Shield className="h-3 w-3 text-primary" /> {u.roles?.name || "NURSE"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusStyle(u.status)}`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(u)}>
                                                        <Edit2 className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 📊 CONTROLES DE PAGINACIÓN COMPATIBLES CON METADATOS DEL BACKEND */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                <p className="text-xs text-muted-foreground">
                                    Página <span className="font-semibold">{meta.page}</span> de{" "}
                                    <span className="font-semibold">{meta.totalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                                        disabled={meta.page === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((old) => Math.min(old + 1, meta.totalPages))}
                                        disabled={meta.page === meta.totalPages}
                                        className="gap-1"
                                    >
                                        Siguiente <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                user={selectedUser}
                isSubmitting={isCreating || isUpdating}
                organizations={orgs}
                departments={depts}
                roles={roles}
            />
        </div>
    );
}