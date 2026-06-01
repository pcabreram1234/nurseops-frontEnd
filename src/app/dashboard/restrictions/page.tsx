"use client"

import React, { useState, useMemo } from "react";
import { useRestrictions } from "@/modules/restrictions/hooks/useRestrictions";
import { RestrictionFormModal } from "@/modules/restrictions/components/RestrictionFormModal";
import { RestrictionTypeFormModal } from "@/modules/restrictions/components/RestrictionTypeFormModal";
import { useNurses } from "@/modules/nurses/hooks/useNurses";

export default function RestrictionsPage() {
    const {
        restrictions,
        types,
        loading,
        saveRestriction,
        saveType,
        removeType
    } = useRestrictions();

    const { nurses } = useNurses()

    const [activeTab, setActiveTab] = useState<"assignments" | "catalog">("assignments");

    // Estados para el Modal de Asignaciones (Grupo estructurado)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestrictionGroup, setSelectedRestrictionGroup] = useState<any | null>(null);

    // Estados para el Modal del Catálogo (NurseRestrictionType)
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<any | null>(null);

    // AGRUPACIÓN VISUAL EN TIEMPO REAL
    const groupedAssignments = useMemo(() => {
        const groups: Record<string, any> = {};
        
        restrictions.forEach(curr => {
            const typeId = curr.restrictionTypeId;
            if (!groups[typeId]) {
                groups[typeId] = {
                    ...curr, 
                    nursesData: [curr.nurse], 
                    nurseIds: [curr.nurseId] 
                };
            } else {
                groups[typeId].nursesData.push(curr.nurse);
                groups[typeId].nurseIds.push(curr.nurseId);
            }
        });
        
        return Object.values(groups);
    }, [restrictions]);

    const handleEditGroup = (group: any) => {
        setSelectedRestrictionGroup(group);
        setIsModalOpen(true);
    };

    const handleNewGroup = () => {
        setSelectedRestrictionGroup(null);
        setIsModalOpen(true);
    };

    const handleEditType = (type: any) => {
        setSelectedType(type);
        setIsTypeModalOpen(true);
    };

    const handleNewType = () => {
        setSelectedType(null);
        setIsTypeModalOpen(true);
    };

    // 🌟 NUEVA FUNCIÓN: Eliminar por completo el lote de asignaciones usando la lógica de sincronización masiva
    const handleRevokeGroup = async (group: any) => {
        const confirmClear = window.confirm(
            `¿Está seguro de revocar esta restricción (${group.restrictionType?.code}) para TODAS las enfermeras asignadas? \nEsta acción vaciará el lote por completo.`
        );
        if (!confirmClear) return;

        // Mandar el payload con "nurseIds" vacío limpia transaccionalmente el tipo en el backend
        const emptyPayload = {
            restrictionTypeId: group.restrictionTypeId,
            nurseIds: [], 
            isTemporary: group.isTemporary,
            isActive: false,
            notes: "LOTE REVOCADO DESDE ADMINISTRACIÓN"
        };

        await saveRestriction(emptyPayload);
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "CRITICAL": return "bg-red-50 text-red-700 border-red-200";
            case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200";
            case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Restricciones Operativas y de Salud</h1>
                    <p className="text-sm text-gray-500 mt-1">Administración de condiciones clínicas y limitaciones del personal asistencial.</p>
                </div>
                <div>
                    {activeTab === "assignments" ? (
                        <button onClick={handleNewGroup} className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 font-medium shadow-sm transition-all flex items-center gap-2">
                            <span>+ Sincronizar Restricción Masiva</span>
                        </button>
                    ) : (
                        <button onClick={handleNewType} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 font-medium shadow-sm transition-all flex items-center gap-2">
                            <span>+ Nuevo Tipo de Restricción</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex border-b border-gray-200 gap-4">
                <button onClick={() => setActiveTab("assignments")} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === "assignments" ? "border-amber-600 text-amber-700 font-bold" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Asignaciones Activas ({groupedAssignments.length})
                </button>
                <button onClick={() => setActiveTab("catalog")} className={`pb-2 px-1 text-sm font-medium border-b-2 transition-all ${activeTab === "catalog" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    Catálogo del Sistema ({types.length})
                </button>
            </div>

            {loading && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400 font-medium animate-pulse">
                    Procesando peticiones y sincronizando datos...
                </div>
            )}

            {!loading && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === "assignments" ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/70 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="p-4">Enfermería Afectada</th>
                                        <th className="p-4">Limitación Operativa</th>
                                        <th className="p-4">Severidad</th>
                                        <th className="p-4">Impacto</th>
                                        <th className="p-4">Vigencia</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {groupedAssignments.map((group: any) => (
                                        <tr key={group.restrictionTypeId} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900 text-base">
                                                    {group.nurseIds.length} Usuarios Asignados
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 max-w-[220px] truncate" title={group.nursesData.map((n:any) => `${n?.user?.firstName || ""} ${n?.user?.lastName || ""}`).join(", ")}>
                                                    {group.nursesData.map((n:any) => n?.user?.firstName || "Asistencial").join(", ")}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{group.restrictionType?.description}</div>
                                                <span className="text-xs text-gray-400 font-mono">{group.restrictionType?.code}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(group.restrictionType?.severity)}`}>
                                                    {group.restrictionType?.severity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                                                    {group.restrictionType?.affects_scheduler && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Calendario</span>}
                                                    {group.restrictionType?.affects_overtime && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">No H. Extra</span>}
                                                    {group.restrictionType?.affects_nights && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">No Nocturno</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                {group.isTemporary ? (
                                                    <div>
                                                        <span className="text-amber-700 font-medium">Temporal</span>
                                                        <div className="text-gray-400 font-mono">{group.startDate?.split('T')[0]} al {group.endDate?.split('T')[0]}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-700 font-medium">Permanente</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center h-2 w-2 rounded-full mr-2 ${group.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                                                <span className="text-xs font-medium">{group.isActive ? "Activa" : "Inactiva"}</span>
                                            </td>
                                            <td className="p-4 text-right space-x-3">
                                                <button onClick={() => handleEditGroup(group)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar Lote</button>
                                                {/* 🌟 NUEVO BOTÓN: Eliminar lote completo de asignaciones */}
                                                <button onClick={() => handleRevokeGroup(group)} className="text-red-600 hover:text-red-800 font-medium text-sm">Revocar Todo</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groupedAssignments.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-400 italic">No hay asignaciones masivas de restricciones en este momento.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/70 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                                        <th className="p-4">Código</th>
                                        <th className="p-4">Nombre Técnico</th>
                                        <th className="p-4">Descripción Clinical</th>
                                        <th className="p-4">Severidad</th>
                                        <th className="p-4">Estado catálogo</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600">
                                    {types.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="p-4 font-mono text-xs font-bold text-gray-900">{t.code}</td>
                                            <td className="p-4 text-sm font-medium text-gray-700">{t.name}</td>
                                            <td className="p-4 text-sm max-w-xs truncate" title={t.description}>{t.description}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(t.severity)}`}>
                                                    {t.severity}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {t.isActive ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-3">
                                                <button onClick={() => handleEditType(t)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
                                                {/* 🌟 NUEVO BOTÓN: Eliminar permanentemente tipo del catálogo si no es bloqueado por el sistema */}
                                                {!t.isSystem ? (
                                                    <button onClick={() => removeType(t.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Eliminar</button>
                                                ) : (
                                                    <span className="text-xs text-gray-300 italic cursor-not-allowed select-none" title="Bloqueado por el núcleo del sistema">Protegido</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {types.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">No hay tipos de restricciones en el catálogo.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <RestrictionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveRestriction}
                restrictionGroup={selectedRestrictionGroup}
                types={types.filter(t => t.isActive)}
                nurses={nurses}
            />

            <RestrictionTypeFormModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onSave={saveType}
                typeItem={selectedType}
            />
        </div>
    );
}