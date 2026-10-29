"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { NurseModal } from "@/modules/nurses/components/NurseModal";
import { useNurses } from "@/modules/nurses/hooks/useNurses";
import { useNurseMutation } from "@/modules/nurses/hooks/useNurseMutation";
import { NurseFormData, Nurse, NurseStatusType, ContracTypeList, NurseFilters } from "@/modules/nurses/types";
import { ChevronLeft, ChevronRight, Search, X, Loader2, Users, Building, FileText, BadgeCheck, AlertCircle, ChevronDown, Plus } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NursesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState<string>("all");
    const [branchFilter, setBranchFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [contractFilter, setContractFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter as NurseStatusType : undefined,
        departmentId: deptFilter !== "all" ? deptFilter : undefined,
        branchId: branchFilter !== "all" ? branchFilter : undefined,
        contractType: contractFilter !== "all" ? contractFilter as ContracTypeList : undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, deptFilter, branchFilter, statusFilter, contractFilter, page]);

    const { nurses, meta, isLoading, isFetching, error, createNurse, isCreating, deleteNurse, isDeleting } = useNurses(filters);

    const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Instanciamos nuestra mutación blindada y pasamos el callback de cierre
    const { mutate: saveNurse, isPending: isSubmitting } = useNurseMutation(() => {
        setIsModalOpen(false);
        setSelectedNurse(null);
    });

    // Este es el submit Handler directo que se conecta con el Modal
    const handleFormSubmit = (formData: NurseFormData) => {
        saveNurse({
            data: formData,
            nurseToEdit: selectedNurse // Si es null, el hook sabe de forma automática que es una inserción (POST)
        });
    };

    // Consultas para alimentar los selects del Modal
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: depts = [] } = useQuery({ queryKey: ["form-depts"], queryFn: async () => (await apiInstance.get("/departments")).data });
    const { data: branches = [] } = useQuery({ queryKey: ["form-branches"], queryFn: async () => (await apiInstance.get("/branches")).data });
    const { data: specialities = [] } = useQuery({ queryKey: ["form-specs"], queryFn: async () => (await apiInstance.get("/specialities")).data });
    const { data: users = [] } = useQuery({ queryKey: ["form-users"], queryFn: async () => (await apiInstance.get("/users")).data });

    // Carga los tipos de restricciones
    const { data: restrictionTypes = [] } = useQuery({
        queryKey: ["form-restriction-types"],
        queryFn: async () => (await apiInstance.get("/restriction-types")).data
    });

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la ficha de "${name}"?`)) {
            try {
                await deleteNurse(id);
            } catch (err) {
                console.error("Error al eliminar:", err);
            }
        }
    };

    // 2. CREAMOS EL BLINDAJE: Garantizamos que el usuario bajo edición SIEMPRE exista en la lista del select
    const usersForModal = [...users]; // Copia de la lista original de usuarios independientes (sin filtrar de la API)

    if (selectedNurse && selectedNurse.user) {
        // Verificamos si el usuario de la ficha seleccionada ya está en la lista independiente
        const userExist = users.some((u: any) => u.id === selectedNurse.userId);

        // Si no está (porque ya tiene ficha y la API lo omitió), lo insertamos al principio de forma segura
        if (!userExist) {
            usersForModal.unshift({
                id: selectedNurse.userId,
                firstName: selectedNurse.user.firstName,
                lastName: selectedNurse.user.lastName
            });
        }
    }

    const hasActiveFilters = !!(search || deptFilter !== "all" || branchFilter !== "all" || statusFilter !== "all" || contractFilter !== "all");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setDeptFilter("all"); setBranchFilter("all"); setStatusFilter("all"); setContractFilter("all"); setPage(1); };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
            INACTIVE: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
            VACATION: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
            LICENSE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
            SUSPENDED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        };
        return styles[status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fichas de Enfermería</h1>
                    <p className="text-muted-foreground">Gestión de personal, perfiles médicos y contratos.</p>
                </div>
                <button
                    onClick={() => { setSelectedNurse(null); setIsModalOpen(true); }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors self-start sm:self-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Nueva Ficha
                </button>
            </div>

            {/* BARRA DE FILTROS */}
            {(nurses.length > 0 || meta) && (
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre de enfermera/o..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 rounded-lg border p-2 pl-9 pr-9 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <Select value={deptFilter} onValueChange={(value) => { setDeptFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Departamentos</SelectItem>
                                {depts.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={branchFilter} onValueChange={(value) => { setBranchFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sede" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Sedes</SelectItem>
                                {branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                {Object.values(NurseStatusType).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={contractFilter} onValueChange={(value) => { setContractFilter(value || ""); setPage(1); }}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Contrato" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Contratos</SelectItem>
                                {Object.values(ContracTypeList).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />}
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <X className="h-3 w-3" /> Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* TABLA PRINCIPAL */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando enfermeras...
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                        <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                        <p className="text-sm font-semibold text-red-700">Error al cargar las enfermeras</p>
                        <p className="text-xs text-red-600/80 mt-1 max-w-md">{error?.message || "Error de conexión."}</p>
                    </div>
                ) : nurses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                        <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No existen fichas de enfermería registradas.</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    <th className="p-4">Profesional</th>
                                    <th className="p-4">Departamento</th>
                                    <th className="p-4">Sede</th>
                                    <th className="p-4">Contrato</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm text-slate-700 dark:text-slate-300">
                                {nurses.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">
                                            {item.user?.firstName} {item.user?.lastName}
                                            <div className="text-xs text-muted-foreground mt-0.5">{item.speciality?.name || "Sin especialidad asignada"}</div>
                                        </td>
                                        <td className="p-4">{item.department?.name}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 text-xs">
                                                <Building className="h-3 w-3 text-muted-foreground" />
                                                {item.branch?.name || "Sin sede"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded text-xs border font-medium">
                                                {item.contract_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button onClick={() => { setSelectedNurse(item); setIsModalOpen(true); }} className="text-primary hover:underline font-medium text-sm">Editar</button>
                                                <button onClick={() => handleDelete(item.id, `${item.user?.firstName} ${item.user?.lastName}`)} className="text-destructive hover:underline font-medium text-sm">Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* PAGINACIÓN */}
                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </div>

            <NurseModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedNurse(null); }}
                onSubmit={handleFormSubmit}
                nurse={selectedNurse}
                isSubmitting={isSubmitting}
                users={usersForModal}
                departments={depts}
                branches={branches}
                specialities={specialities}
                organizations={orgs}
                restrictionTypes={restrictionTypes}
            />
        </div>
    );
}