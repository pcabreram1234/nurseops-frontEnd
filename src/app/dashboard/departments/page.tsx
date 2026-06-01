"use client";

import { useState } from "react";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { Department, DepartmentFormData, DepartmentType } from "@/modules/departments/types";
import DepartmentModal from "@/modules/departments/components/DepartmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, Layers,
    Users, AlertCircle, CheckCircle2, Building, Activity,
    UserMinus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";

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

export default function DepartmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    const { departments, isLoading, createDepartment, isCreating, updateDepartment, isUpdating, deleteDepartment } = useDepartments();

    // Catálogos maestros indispensables para el modal
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: branches = [] } = useQuery({ queryKey: ["form-branches"], queryFn: async () => (await apiInstance.get("/branches")).data });

    const handleOpenCreate = () => {
        setSelectedDept(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (dept: Department) => {
        setSelectedDept(dept);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            // 🌟 Desestructuramos para extraer y "descartar" lo que no queremos enviar al backend
            const {
                id,
                createdAt,
                updatedAt,
                branch,
                nurses,
                shifts,
                ...cleanData // 👈 Aquí queda exactamente un objeto de tipo DepartmentFormData
            } = data;
            if (selectedDept) {
                await updateDepartment({ id: selectedDept.id, data: cleanData });
            } else {
                await createDepartment(cleanData);
            }
            setIsModalOpen(false);
        } catch (error) { }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente este departamento? Todos los turnos y configuraciones asociadas se verán afectados.")) {
            await deleteDepartment(id);
        }
    };

    // 🔍 MOTOR DE FILTRADO MULTIDIMENSIONAL INTERNO
    const filteredDepartments = departments.filter((d) => {
        const matchesSearch =
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === "ALL" || d.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const getCriticalityBadge = (level: string) => {
        const styles: Record<string, string> = {
            LOW: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
            MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
            HIGH: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
            CRITICAL: "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse dark:bg-rose-950 dark:text-rose-300"
        };
        return styles[level] || "bg-slate-100 text-slate-700";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Departamentos / Unidades</h1>
                    <p className="text-muted-foreground">Administra los núcleos operativos, asignaciones de personal y prioridades críticas.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nuevo Departamento
                </Button>
            </div>

            {/* BARRA DE CONTROLES Y FILTRADO */}
            {departments.length > 0 && (
                <div className="flex flex-col gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, código o sucursal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                        <span className="text-xs font-bold text-muted-foreground px-2">Filtrar por:</span>
                        <Button
                            variant={typeFilter === "ALL" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter("ALL")}
                            className="text-xs rounded-lg"
                        >
                            Todos
                        </Button>
                        {Object.entries(departmentTypeLabels).map(([key, label]) => (
                            <Button
                                key={key}
                                variant={typeFilter === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTypeFilter(key)}
                                className="text-xs rounded-lg transition-all"
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* RESULTADOS CONDICIONALES */}
            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Analizando matriz de departamentos...
                </div>
            ) : departments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Layers className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen departamentos registrados.</p>
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias para la búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDepartments.map((d) => {
                        // 📊 1. Extraemos la cantidad de personal desde el array relacional (puedes cambiar 'nurses' por 'users' según devuelva tu backend)
                        const currentStaffCount = (d as any).nurses?.length || 0;

                        // ⚠️ 2. Condición de alerta: Si el staff actual está por debajo de las reglas obligatorias de minimum_staff
                        const isUnderCapacity = currentStaffCount < d.minimumStaff;

                        return (
                            <Card
                                key={d.id}
                                className={`flex flex-col overflow-hidden hover:shadow-md transition-all duration-300 border ${isUnderCapacity
                                    ? "border-rose-300 bg-rose-50/20 shadow-sm dark:border-rose-900 dark:bg-rose-950/10"
                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                    }`}
                            >
                                <CardHeader className={`pb-3 border-b ${isUnderCapacity
                                    ? "bg-rose-50/50 dark:bg-rose-950/20"
                                    : "bg-slate-50/40 dark:bg-slate-900/10"
                                    }`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                                                    <Layers className={`h-4 w-4 ${isUnderCapacity ? "text-rose-500" : "text-primary"}`} />
                                                    {d.name}
                                                </CardTitle>
                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold dark:bg-slate-800 dark:text-slate-200">
                                                    {d.code}
                                                </span>
                                            </div>

                                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md inline-block">
                                                {departmentTypeLabels[d.type] || d.type}
                                            </div>
                                            <CardDescription className="text-xs flex items-center gap-1">
                                                <Building className="h-3 w-3" /> Sede: {d.branch?.name || "No asignada"}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(d)}>
                                                <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(d.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    {/* INDICADOR EXCLUSIVO DE COBERTURA CRÍTICA */}
                                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${isUnderCapacity
                                        ? "bg-rose-100/70 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 font-bold"
                                        : "bg-slate-50 border-slate-100 dark:bg-slate-900/60 dark:border-slate-800/80"
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <Users className={`h-4 w-4 ${isUnderCapacity ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`} />
                                            <span>Enfermeras Asignadas:</span>
                                        </div>
                                        <span className={`text-sm font-black px-2.5 py-0.5 rounded-md ${isUnderCapacity
                                            ? "bg-rose-600 text-white dark:bg-rose-500 animate-pulse"
                                            : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                            }`}>
                                            {currentStaffCount}
                                        </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                        {d.description || "Sin descripción proporcionada."}
                                    </p>

                                    {/* DATOS MAESTROS DE CAPACIDADES */}
                                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50/60 dark:bg-slate-900/40 rounded-lg border text-[11px]">
                                        <div>
                                            <span className="block text-muted-foreground text-[10px]">Min Staff</span>
                                            <span className={`font-bold ${isUnderCapacity ? "text-rose-600 dark:text-rose-400 underline decoration-2" : "text-slate-900 dark:text-white"}`}>{d.minimumStaff}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground text-[10px]">Óptimo</span>
                                            <span className="font-bold text-primary">{d.optimalStaff}</span>
                                        </div>
                                        <div>
                                            <span className="block text-muted-foreground text-[10px]">Máx Cap.</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{d.maxCapacity}</span>
                                        </div>
                                    </div>

                                    {/* ALERTA DE DÉFICIT OPERACIONAL (RENDERIZADA CONDICIONALMENTE) */}
                                    {isUnderCapacity && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-1.5 rounded-md border border-rose-100 dark:border-rose-950 animate-pulse">
                                            <UserMinus className="h-3.5 w-3.5 shrink-0" />
                                            <span>Déficit crítico: Faltan {d.minimumStaff - currentStaffCount} enfermeras</span>
                                        </div>
                                    )}

                                    {/* BANDERAS OPERATIVAS EXTRACORPORALES */}
                                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                                        {d.allowOvertime && <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded dark:bg-indigo-950 dark:text-indigo-300">Horas Extra</span>}
                                        {d.allowsCrossDepartment && <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded dark:bg-emerald-950 dark:text-emerald-300">Apoyo Cruzado</span>}
                                        {d.requiresSpecialization && <span className="px-2 py-0.5 bg-violet-50 border border-violet-100 text-violet-700 rounded dark:bg-violet-950 dark:text-violet-300">Especializado</span>}
                                        {d.isEmergencyDepartment && <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded font-semibold dark:bg-rose-950 dark:text-rose-300">Prioridad Urgencia: {d.emergencyPriority}</span>}
                                    </div>

                                    <div className="pt-3 border-t flex items-center justify-between text-xs font-semibold">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase ${getCriticalityBadge(d.criticalLevel)}`}>
                                            <Activity className="h-3 w-3" /> Criticidad: {d.criticalLevel}
                                        </span>

                                        <div>
                                            {d.isActive ? (
                                                <span className="text-emerald-600 flex items-center gap-1 text-[11px]"><CheckCircle2 className="h-3 w-3" /> Activo</span>
                                            ) : (
                                                <span className="text-rose-500 flex items-center gap-1 text-[11px]"><AlertCircle className="h-3 w-3" /> Inactivo</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                department={selectedDept}
                isSubmitting={isCreating || isUpdating}
                organizations={orgs}
                branches={branches}
            />
        </div>
    );
}