"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { NurseModal } from "@/modules/nurses/components/NurseModal";
import { useNurses } from "@/modules/nurses/hooks/useNurses";
import { useNurseMutation } from "@/modules/nurses/hooks/useNurseMutation";
import { NurseFormData, Nurse } from "@/modules/nurses/types";

export default function NursesPage() {
    const { nurses, isLoading, deleteNurse } = useNurses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");

    // Instanciamos nuestra mutación blindada y pasamos el callback de cierre
    const { mutate: saveNurse, isPending: isSubmitting } = useNurseMutation(() => {
        setIsModalOpen(false);
        setSelectedNurse(null);
    });

    // Este es el submit Handler directo que se conecta con el Modal
    const handleFormSubmit = (formData: NurseFormData) => {
        // Disparamos la mutación pasándole los datos limpios de Hook Form y la referencia si es edición
        saveNurse({
            data: formData,
            nurseToEdit: selectedNurse // Si es null, el hook sabe de forma automática que es una inserción (POST)
        });
    };

    // Consultas para alimentar los selects del Modal (Reemplazar rutas de API según corresponda)
    const { data: orgs = [] } = useQuery({ queryKey: ["form-orgs"], queryFn: async () => (await apiInstance.get("/organizations")).data });
    const { data: depts = [] } = useQuery({ queryKey: ["form-depts"], queryFn: async () => (await apiInstance.get("/departments")).data });
    const { data: specialities = [] } = useQuery({ queryKey: ["form-specs"], queryFn: async () => (await apiInstance.get("/specialities")).data });
    const { data: users = [] } = useQuery({ queryKey: ["form-users"], queryFn: async () => (await apiInstance.get("/users")).data });
    
    // 🌟 NUEVA CONSULTA: Carga los tipos de restricciones configurados en el sistema desde el backend
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

    // 1. Mantenemos tu filtro intacto para la tabla de la interfaz
    const filteredNurses = nurses.filter((item) => {
        const nurseName = `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.toLowerCase();
        const matchesSearch = nurseName.includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === "all" ? true : item.departmentId === deptFilter;
        return matchesSearch && matchesDept;
    });

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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fichas de Enfermería</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de personal, perfiles médicos y contratos.</p>
                </div>
                <button
                    onClick={() => { setSelectedNurse(null); setIsModalOpen(true); }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                    Nueva Ficha
                </button>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <input
                    type="text"
                    placeholder="Buscar por nombre de enfermera/o..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 rounded-lg border p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full sm:w-64 rounded-lg border p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">Todos los Departamentos</option>
                    {depts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="p-4">Profesional</th>
                            <th className="p-4">Departamento</th>
                            <th className="p-4">Contrato</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm text-gray-700">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div></td>
                                </tr>
                            ))
                        ) : filteredNurses.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron fichas de enfermería.</td></tr>
                        ) : (
                            filteredNurses.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">
                                        {item.user?.firstName} {item.user?.lastName}
                                        <div className="text-xs text-gray-500 mt-0.5">{item.speciality?.name || "Sin especialidad asignada"}</div>
                                    </td>
                                    <td className="p-4">{item.department?.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border font-medium">
                                            {item.contract_type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center space-x-3">
                                            <button onClick={() => { setSelectedNurse(item); setIsModalOpen(true); }} className="text-blue-600 hover:underline font-medium">Editar</button>
                                            <button onClick={() => handleDelete(item.id, `${item.user?.firstName} ${item.user?.lastName}`)} className="text-red-600 hover:underline font-medium">Eliminar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NurseModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedNurse(null); }}
                onSubmit={handleFormSubmit}
                nurse={selectedNurse}
                isSubmitting={isSubmitting} 
                users={usersForModal}       
                departments={depts}
                specialities={specialities}
                organizations={orgs}
                restrictionTypes={restrictionTypes} // 👈 ENLAZADO: Inyectamos los registros cargados de la BD hacia el modal
            />
        </div>
    );
}