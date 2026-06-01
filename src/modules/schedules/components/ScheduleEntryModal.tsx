"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useScheduleValidation } from "../hooks/useScheduleValidation";
import { ScheduleEntry, Shift, typeStyles } from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    nurses: any[];
    shifts: Shift[];
    existingEntries: ScheduleEntry[];
    onSave: (data: any) => Promise<void>;
    onUpdateEntry?: (id: string, updatedData: { shiftId: string; nurseId: string }) => Promise<void>;
    singleEntryId?: string | null; // 🌟 Parámetro para mutar la vista a edición única o individual
}

export const ScheduleEntryModal: React.FC<Props> = ({
    isOpen,
    onClose,
    selectedDate,
    nurses,
    shifts,
    existingEntries,
    onSave,
    onUpdateEntry,
    singleEntryId
}) => {
    // Estado para la barra de búsqueda reactiva del personal ya asignado
    const [searchTerm, setSearchTerm] = useState("");

    // Estados de edición dedicados para las filas del personal ya asignado
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [editShiftId, setEditShiftId] = useState("");
    const [editNurseId, setEditNurseId] = useState("");

    const { register, control, handleSubmit, watch, reset } = useForm({
        defaultValues: {
            entries: [] as { nurseId: string; shiftId: string; notes: string }[]
        }
    });

    const { check, isChecking, warnings, setWarnings } = useScheduleValidation();
    const { fields, append, remove } = useFieldArray({ control, name: "entries" });

    // 🌟 COMPUTAMOS EL CONTEXTO DE FILTRADO PARA MUTACIÓN DE LAYOUT
    const isSingleEditMode = !!singleEntryId;

    console.log(shifts)

    // Efecto principal de reinicio y detección automática de modo individual
    useEffect(() => {
        if (isOpen) {
            reset({ entries: [] });
            setWarnings({});
            setSearchTerm("");

            if (isSingleEditMode) {
                // Si estamos en modo individual, buscamos la entrada correspondiente y la abrimos en edición inline de inmediato
                const targetEntry = existingEntries.find(e => e.id === singleEntryId);
                if (targetEntry) {
                    setEditingEntryId(targetEntry.id);
                    setEditShiftId(targetEntry.shiftId);
                    setEditNurseId(targetEntry.nurseId || "");
                }
            } else {
                setEditingEntryId(null);
            }
        }
    }, [isOpen, reset, setWarnings, isSingleEditMode, singleEntryId, existingEntries]);

    // Helper para extraer de forma segura y estandarizada las horas "HH:MM" de un ISO string
    const formatTime = (isoString?: string | null) => {
        if (!isoString) return "--:--";
        try {
            const parts = isoString.split("T")[1];
            if (!parts) return "--:--";
            return parts.substring(0, 5);
        } catch (e) {
            return "--:--";
        }
    };

    // 🔍 FILTRO REACTIVO INTELIGENTE (Buscador Multi-parámetro adaptable)
    const filteredEntries = useMemo(() => {
        // Si es edición individual, limitamos el arreglo únicamente al slot clickeado
        if (isSingleEditMode) {
            return existingEntries.filter(e => e.id === singleEntryId);
        }

        if (!searchTerm.trim()) return existingEntries;
        const target = searchTerm.toLowerCase();

        return existingEntries.filter((entry) => {
            const firstName = entry.nurse?.user?.firstName?.toLowerCase() || "";
            const lastName = entry.nurse?.user?.lastName?.toLowerCase() || "";
            const fullName = `${firstName} ${lastName}`;
            const deptName = entry.shiftTemplate?.department?.name?.toLowerCase() || "";
            const shiftType = (entry.shift?.type || entry.shiftTemplate?.name || "").toLowerCase();

            const startTime = formatTime(entry.shift?.startTime);
            const endTime = formatTime(entry.shift?.endTime);
            const timeInterval = `${startTime} ${endTime}`;

            return (
                fullName.includes(target) ||
                deptName.includes(target) ||
                shiftType.includes(target) ||
                timeInterval.includes(target)
            );
        });
    }, [existingEntries, searchTerm, isSingleEditMode, singleEntryId]);

    const handleNurseChange = async (nurseId: string, shiftId: string, index: number) => {
        if (!nurseId || !shiftId) return;
        await check(index, nurseId, shiftId, selectedDate, existingEntries);
    };

    // Activa el modo edición inline para modificar un slot ya persistido
    const startEditing = (entry: ScheduleEntry) => {
        setEditingEntryId(entry.id);
        setEditShiftId(entry.shiftId);
        setEditNurseId(entry.nurseId || "");
    };

    // Lógica para validar y guardar los cambios del slot en tiempo real
    const handleInlineUpdate = async (entryId: string) => {
        if (!editNurseId || !editShiftId) return;

        // Validamos usando un índice virtual negativo (-1) para evitar colisiones con las filas nuevas
        const validation = await check(-1, editNurseId, editShiftId, selectedDate, existingEntries.filter(e => e.id !== entryId));

        if (validation?.canAssign && onUpdateEntry) {
            try {
                await onUpdateEntry(entryId, { shiftId: editShiftId, nurseId: editNurseId });
                setEditingEntryId(null);
                // Si estaba en modo edición única, cerramos el modal al guardar con éxito
                if (isSingleEditMode) {
                    onClose();
                }
            } catch (error) {
                console.error("Error al actualizar la entrada de turno:", error);
            }
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all ${isSingleEditMode ? 'max-w-xl max-h-[70vh]' : 'max-w-5xl max-h-[90vh]'
                }`}>

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {isSingleEditMode ? "⚙️ Modificar Asignación Individual" : `Asignaciones para el ${format(selectedDate, "PPP", { locale: es })}`}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {isSingleEditMode ? "Ajuste preciso de slot seleccionado" : "Módulo de control de personal y coberturas diarias"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* SECCIÓN PRINCIPAL DE ASIGNADOS / EDICIÓN INLINE (Ocupa el 100% en modo único, 50% en modo general) */}
                    <div className={`flex flex-col bg-slate-50/50 ${isSingleEditMode ? 'w-full' : 'w-1/2 border-r'}`}>

                        {/* El buscador solo es útil si estamos en la vista general de todo el día */}
                        {!isSingleEditMode && (
                            <div className="p-4 border-b bg-white">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                    Buscar en este día
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por personal, departamento u horario..."
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="p-6 overflow-y-auto flex-1 space-y-2">
                            <h3 className="font-semibold text-slate-700 mb-2 uppercase text-xs tracking-wider">
                                {isSingleEditMode ? "Slot en Modificación" : `Personal ya asignado (${filteredEntries.length})`}
                            </h3>

                            {filteredEntries.map((entry) => {
                                const isEditingThis = editingEntryId === entry.id;
                                const shiftType: string = entry.shift?.type || entry.shiftTemplate?.name || "UNKNOWN";
                                const badgeClass = typeStyles[shiftType] || typeStyles.UNKNOWN;

                                const startTimeFormatted = formatTime(entry.shift?.startTime);
                                const endTimeFormatted = formatTime(entry.shift?.endTime);

                                return (
                                    <div key={entry.id} className={`bg-white p-4 rounded-xl border transition-all shadow-sm ${isEditingThis ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/10' : 'hover:shadow-md'}`}>
                                        {!isEditingThis ? (
                                            /* VISTA ESTÁNDAR */
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-slate-800">
                                                        {entry.nurse?.user?.firstName} {entry.nurse?.user?.lastName}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[11px] text-slate-400 font-medium">
                                                            {entry.shiftTemplate?.department?.name || "Sin Departamento"}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                                            <span>🕒</span> {startTimeFormatted} - {endTimeFormatted}
                                                            <span className="text-slate-300 font-normal">({entry.shift?.durationHours || 0}h)</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-[10px] font-bold tracking-wide border px-2.5 py-1 rounded-full uppercase ${badgeClass}`}>
                                                        {shiftType === "UNKNOWN" ? "No Def." : shiftType}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(entry)}
                                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {entry.nurseId ? "Modificar turno" : "Asignar personal"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* 🔄 VISTA FORMULARIO INTERACTIVO (EDICIÓN INLINE) */
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between border-b pb-1.5">
                                                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                                                        <span>✏️</span> Ajustar Parámetros de Slot
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => isSingleEditMode ? onClose() : setEditingEntryId(null)}
                                                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-md transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInlineUpdate(entry.id)}
                                                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-md transition-colors shadow-sm"
                                                        >
                                                            Guardar Cambios
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5 pt-1">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Personal Asignado</label>
                                                        <select
                                                            value={editNurseId}
                                                            onChange={(e) => setEditNurseId(e.target.value)}
                                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                        >
                                                            <option value="">Seleccionar Personal...</option>
                                                            {nurses.map(n => <option key={n.id} value={n.id}>{n.user?.firstName} {n.user?.lastName}</option>)}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horario / Turno Clínico</label>
                                                        <select
                                                            value={editShiftId}
                                                            onChange={(e) => setEditShiftId(e.target.value)}
                                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                        >
                                                            {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({formatTime(s.startTime)} - {formatTime(s.endTime)})</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Advertencias virtuales en tiempo real */}
                                                {warnings[-1]?.length > 0 && (
                                                    <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg space-y-0.5 shadow-inner">
                                                        {warnings[-1].map((w, i) => <p key={i}>⚠️ {w}</p>)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredEntries.length === 0 && (
                                <p className="text-sm text-slate-400 italic text-center py-6">
                                    No se encontraron asignaciones que coincidan con los criterios.
                                </p>
                            )}
                        </div>

                        {/* Pie de página de apoyo visual para modo individual */}
                        {isSingleEditMode && (
                            <div className="p-4 border-t bg-white flex justify-end">
                                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">
                                    Cerrar Ventana
                                </button>
                            </div>
                        )}
                    </div>

                    {/* LADO DERECHO: FORMULARIO MASIVO (COMPLETAMENTE OCULTADO EN MODO INDIVIDUAL `isSingleEditMode`) */}
                    {!isSingleEditMode && (
                        <div className="w-1/2 p-6 overflow-y-auto flex flex-col justify-between bg-white">
                            <form onSubmit={handleSubmit(onSave)} className="space-y-4 flex-1">
                                <h3 className="font-semibold text-slate-700 mb-2 uppercase text-xs tracking-wider">
                                    Nuevas Asignaciones Masivas
                                </h3>

                                <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-xl bg-amber-50/30 border-amber-100/70 relative shadow-sm animate-in slide-in-from-bottom-2 duration-150">
                                            {isChecking[index] && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse rounded-t-xl" />}

                                            <button type="button" onClick={() => remove(index)} className="absolute top-2 right-3 text-slate-400 hover:text-slate-600 transition-colors">✕</button>

                                            <div className="space-y-3 mt-1">
                                                <select
                                                    {...register(`entries.${index}.nurseId` as const)}
                                                    onChange={(e) => handleNurseChange(e.target.value, watch(`entries.${index}.shiftId`), index)}
                                                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                >
                                                    <option value="">Seleccionar Enfermera/o...</option>
                                                    {nurses.map(n => <option key={n.id} value={n.id}>{n.user?.firstName} {n.user?.lastName}</option>)}
                                                </select>

                                                <select
                                                    {...register(`entries.${index}.shiftId` as const)}
                                                    onChange={(e) => handleNurseChange(watch(`entries.${index}.nurseId`), e.target.value, index)}
                                                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                >
                                                    <option value="">Seleccionar Horario...</option>
                                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({formatTime(s.startTime)} - {formatTime(s.endTime)})</option>)}
                                                </select>

                                                {warnings[index]?.length > 0 && (
                                                    <div className="text-xs text-amber-700 bg-amber-100 p-2.5 rounded-lg border border-amber-200 space-y-1">
                                                        {warnings[index].map((w, i) => <p key={i}>⚠️ {w}</p>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {fields.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                                            <p className="text-sm text-slate-400 italic">No has agregado asignaciones nuevas para guardar.</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => append({ nurseId: "", shiftId: "", notes: "" })}
                                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20 transition-all shadow-sm"
                                >
                                    + Añadir personal a este día
                                </button>
                            </form>

                            <div className="pt-4 border-t mt-4 flex justify-end gap-2 bg-white">
                                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
                                    Cerrar Panel
                                </button>
                                {fields.length > 0 && (
                                    <button onClick={handleSubmit(onSave)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-colors">
                                        Confirmar Nuevas Asignaciones
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};