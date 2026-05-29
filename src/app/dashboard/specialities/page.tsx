"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { Speciality } from "@/modules/specialities/types";
import { SpecialityModal } from "@/modules/specialities/components/SpecialityModal";
import { useSpecialities } from "@/modules/specialities/hooks/useSpecialities";

export default function SpecialitiesPage() {
    // 🌟 Agregamos 'deleteSpeciality' viniendo de tu hook personalizado
    const { specialities, isLoading, createSpeciality, updateSpeciality, deleteSpeciality } = useSpecialities();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpeciality, setSelectedSpeciality] = useState<Speciality | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🌟 Estados para los filtros y búsquedas
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    // Consultas secundarias para alimentar los selects del modal
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: depts = [] } = useQuery({ queryKey: ["form-depts"], queryFn: async () => (await apiInstance.get("/departments")).data });

    const handleFormSubmit = async (rawFormValues: any) => {
        setIsSubmitting(true);
        try {
            if (selectedSpeciality) {
                await updateSpeciality(selectedSpeciality.id, rawFormValues);
            } else {
                await createSpeciality(rawFormValues);
            }

            setIsModalOpen(false);
            setSelectedSpeciality(null);
        } catch (err) {
            console.error("Error al procesar el formulario de especialidades:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🌟 Manejador para eliminar especialidades con confirmación
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar la especialidad "${name}"? Esta acción no se puede deshacer.`)) {
            try {
                if (deleteSpeciality) {
                    await deleteSpeciality(id);
                } else {
                    console.warn("La función deleteSpeciality no está implementada en useSpecialities");
                }
            } catch (err) {
                console.error("Error al eliminar la especialidad:", err);
            }
        }
    };

    // 🌟 Lógica de filtrado reactivo combinando búsqueda escrita y selector de estado
    const filteredSpecialities = specialities.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === "all" ? true :
                statusFilter === "active" ? item.isActive === true :
                    item.isActive === false;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Especialidades</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de especializaciones de enfermería por departamento.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedSpeciality(null);
                        setIsModalOpen(true);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                    Nueva Especialidad
                </button>
            </div>

            {/* 🌟 BARRA DE BUSQUEDA Y FILTROS */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Datos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="p-4">Código</th>
                            <th className="p-4">Nombre</th>
                            <th className="p-4">Departamentos</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center w-40">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                    <td className="p-4 text-right"><div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div></td>
                                </tr>
                            ))
                            // 🌟 Ahora validamos sobre 'filteredSpecialities' para evaluar si el resultado de la búsqueda está vacío
                        ) : filteredSpecialities.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No se encontraron especialidades que coincidan con los filtros.
                                </td>
                            </tr>
                        ) : (
                            // 🌟 Renderizamos el array filtrado reactivo
                            filteredSpecialities.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500">{item.code}</td>
                                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.departmentSpecialities && item.departmentSpecialities.length > 0 ? (
                                                item.departmentSpecialities.map((ds) => (
                                                    <span
                                                        key={ds.departmentId}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {ds.department?.name || "Dept. Relacionado"}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs">Ninguno</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {item.isActive ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    {/* 🌟 BOTONES DE ACCIÓN: Editar y Eliminar */}
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedSpeciality(item);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.name)}
                                                className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <SpecialityModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSpeciality(null);
                }}
                onSubmit={handleFormSubmit}
                speciality={selectedSpeciality}
                isSubmitting={isSubmitting}
                organizations={orgs}
                departments={depts}
            />
        </div>
    );
}