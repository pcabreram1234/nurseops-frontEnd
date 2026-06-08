"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { format, isSameDay, formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { ScheduleEntry, } from "../types";

// Interfaz local para controlar el veredicto del motor de reglas por cada fila
interface RowValidation {
    isLoading: boolean;
    canAssign: boolean;
    errors: string[];
    warnings: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    nurses: any[];
    shifts: any[]; // Cambiado a any[] para soportar la relación del departamento desde el hook
    existingEntries: ScheduleEntry[];
    onSave: (data: any) => Promise<void>;
    onUpdateEntry?: (id: string, updatedData: { shiftId: string; nurseId: string }) => Promise<void>;
    singleEntryId?: string | null;
    activeDepartmentId?: string; // 🌟 NUEVO PROP
    onDeleteEntry?: (id: string) => void; // 🌟 Ajustado a sincrónico (void)
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
    singleEntryId,
    activeDepartmentId,
    onDeleteEntry
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Estados de edición dedicados para las filas del personal ya asignado
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [editShiftId, setEditShiftId] = useState("");
    const [editNurseId, setEditNurseId] = useState("");

    // 🌟 ESTADO CORE DEL CO-PILOTO: Mapea cada fila con su estado de validación
    const [validationMap, setValidationMap] = useState<Record<string | number, RowValidation>>({});

    const { register, control, watch, reset, setValue, handleSubmit } = useForm({
        defaultValues: {
            entries: [] as { nurseId: string; shiftId: string; notes: string, shiftTemplateId: string }[]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "entries" });
    const isSingleEditMode = !!singleEntryId;

    // Observar las entradas dinámicas en modo creación masiva para disparar validaciones en vivo
    const watchedEntries = watch("entries");


    // Reinicio y detección automática de modo individual
    useEffect(() => {
        if (isOpen) {
            reset({ entries: [] });
            setValidationMap({});
            setSearchTerm("");

            if (isSingleEditMode) {
                const targetEntry = existingEntries.find(e => e.id === singleEntryId);
                if (targetEntry) {
                    setEditingEntryId(targetEntry.id);
                    setEditShiftId(targetEntry.shiftId);
                    setEditNurseId(targetEntry.nurseId || "");
                    executeLiveValidation(targetEntry.id, targetEntry.nurseId || "", targetEntry.shiftId, targetEntry.id);
                }
            } else {
                setEditingEntryId(null);
            }
        }
    }, [isOpen, reset, isSingleEditMode, singleEntryId, existingEntries]);

    /**
     * 🤖 FUNCIÓN INTERACTIVA CON EL BACKEND corregida (Lectura directa de result.errors)
     */
    const executeLiveValidation = async (rowKey: string | number, nurseId: string, shiftId: string, currentEntryId?: string) => {
        if (!nurseId || !shiftId) {
            setValidationMap(prev => {
                const copy = { ...prev };
                delete copy[rowKey];
                return copy;
            });
            return;
        }

        setValidationMap(prev => ({
            ...prev,
            [rowKey]: { isLoading: true, canAssign: true, errors: [], warnings: [] }
        }));
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        try {
            const response = await fetch(`${API_URL}/schedule-validation/single-assignment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nurseId,
                    shiftId,
                    date: selectedDate.toISOString(),
                    entryId: currentEntryId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const serverErrorMessage = errorData.message
                    ? (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message)
                    : "Error interno en el servidor de reglas.";
                throw new Error(serverErrorMessage);
            }

            const result = await response.json();

            setValidationMap(prev => {
                const nextMap = { ...prev };
                nextMap[rowKey] = {
                    isLoading: false,
                    canAssign: Boolean(result?.data.canAssign),
                    errors: result?.data.errors ? [...result?.data.errors] : [],
                    warnings: result?.data.warnings ? [...result?.data.warnings] : []
                };
                return nextMap;
            });
        } catch (error: any) {
            console.error("Fallo de comunicación con rule-engine:", error);
            setValidationMap(prev => ({
                ...prev,
                [rowKey]: {
                    isLoading: false,
                    canAssign: false,
                    errors: [error.message || "No se pudo conectar con el motor de validaciones."],
                    warnings: []
                }
            }));
        }
    };

    // Disparar validaciones automáticas para las filas creadas dinámicamente en el formulario masivo
    useEffect(() => {
        if (isSingleEditMode || !watchedEntries) return;

        watchedEntries.forEach((entry, index) => {
            if (entry.nurseId && entry.shiftId) {
                // Evitamos ciclos infinitos validando solo si no está cargando o si cambiaron los IDs
                const currentVal = validationMap[`new -${index}`];
                if (!currentVal || (!currentVal.isLoading && !currentVal.errors.length && !currentVal.warnings.length)) {
                    executeLiveValidation(`new -${index}`, entry.nurseId, entry.shiftId);
                }
            }
        });
    }, [watchedEntries, isSingleEditMode]);

    const formatTime = (isoString?: string | null) => {
        if (!isoString) return "--:--";
        try {
            if (!isoString.includes("T")) return isoString.substring(0, 5);
            const parts = isoString.split("T")[1];
            return parts ? parts.substring(0, 5) : "--:--";
        } catch (e) {
            return "--:--";
        }
    };

    // FILTRO REACTIVO INTELIGENTE DE ENTRADAS EXISTENTES
    const filteredEntries = useMemo(() => {
        if (isSingleEditMode) {
            return existingEntries.filter(e => e.id === singleEntryId);
        }
        if (!searchTerm.trim()) return existingEntries;
        const target = searchTerm.toLowerCase();

        return existingEntries.filter((entry) => {
            const fullName = `${entry.nurse?.user?.firstName || ""} ${entry.nurse?.user?.lastName || ""}`.toLowerCase();
            const deptName = entry.shiftTemplate?.department?.name?.toLowerCase() || "";
            const shiftType = (entry.shift?.type || entry.shiftTemplate?.name || "").toLowerCase();
            return fullName.includes(target) || deptName.includes(target) || shiftType.includes(target);
        });
    }, [existingEntries, searchTerm, isSingleEditMode, singleEntryId]);


    const filterShiftsForBulk = useMemo(() => {
        return shifts.filter((f) => formatDate(f.startTime, 'dd-MM-yyyy') === formatDate(selectedDate, "dd-MM-yyyy"))
    }, [])

    // Identificar departamento activo contextual
    const currentActiveDepartmentId = useMemo(() => {
        if (isSingleEditMode) {
            const entry = existingEntries.find(e => e.id === singleEntryId);
            return (entry?.shiftTemplate as any)?.departmentId ||
                (entry?.shift as any)?.departmentId ||
                (entry?.shiftTemplate?.department as any)?.id || null;
        }
        return activeDepartmentId || null;
    }, [isSingleEditMode, singleEntryId, existingEntries, activeDepartmentId]);

    // Filtrar turnos disponibles
    const filteredShifts = useMemo(() => {
        if (currentActiveDepartmentId) {
            return shifts.filter(s => s.departmentId === currentActiveDepartmentId && isSameDay(new Date(s.startTime), selectedDate));
        }
        return shifts;
    }, [shifts, currentActiveDepartmentId, selectedDate]);

    // Filtrar personal calificado o con préstamos habilitados
    const filteredNurses = useMemo(() => {
        if (currentActiveDepartmentId) {
            return nurses.filter(n =>
                (n as any).departmentId === currentActiveDepartmentId || n.allowCrossDepartment === true
            );
        }
        return nurses;
    }, [nurses, currentActiveDepartmentId]);


    // 🌟 CONTROL INTELIGENTE DE BOTONES (CRITICAL HARD BLOCK)
    // Recorre todas las filas validadas (inline y masivas) para bloquear el guardado si hay errores médicos graves.
    const hasAnyCriticalError = useMemo(() => {
        return Object.values(validationMap).some(validation => validation.errors && validation.errors.length > 0);
    }, [validationMap]);

    // 🌟 INTERCEPTOR SEGURO CONTRA ADVERTENCIAS (SOFT WARNING)
    // Recopila las advertencias de restricciones MEDIUM o LOW y exige confirmación explícita
    // 📄 Reemplaza la función handleSafeSubmit en ScheduleEntryModal.tsx

    const handleSafeSubmit = (data: any) => {
        const allWarnings = Object.values(validationMap)
            .flatMap(validation => validation.warnings || []);

        if (allWarnings.length > 0) {
            const dangerPrompt = `⚠️ ADVERTENCIA DE LIMITACIÓN DE ENFERMERÍA: \n\n` +
                allWarnings.map((warning, index) => `${index + 1}.${warning}`).join("\n") +
                `\n\n¿Estás seguro de que deseas ignorar estas advertencias operacionales y forzar las asignaciones?`;

            if (!window.confirm(dangerPrompt)) return;
        }

        // 🟢 CONSTRUCCIÓN DEL PAYLOAD PERFECTO PARA TU DTO
        // Extraemos el scheduleId y los shiftTemplateId contextuales
        const formattedEntries = data.entries.map((entry: any) => {
            const matchingShift = shifts.find(s => s.id === entry.shiftId);
            return {
                nurseId: entry.nurseId,
                shiftId: entry.shiftId,
                notes: entry.notes || "",
                // 🌟 Extracción automática: si no viene directo, se busca de las relaciones de shifts
                shiftTemplateId: matchingShift?.shiftTemplateId || matchingShift?.templateId || ""
            };
        });

        // Buscamos un scheduleId válido del día o del departamento actual
        const targetScheduleId = existingEntries[0]?.scheduleId || shifts[0]?.scheduleId || "default-schedule-id";

        const payloadForBackend = {
            date: selectedDate.toISOString().split('T')[0], // Formato YYYY-MM-DD exigido por IsDateString
            scheduleId: targetScheduleId, // 🌟 Exigido por el DTO Maestro
            entries: formattedEntries     // 🌟 Arreglo con shiftTemplateId incluido
        };

        // Ejecutamos el guardado pasándole el payload exacto estructurado
        onSave(payloadForBackend);
    };

    const startEditing = (entry: ScheduleEntry) => {
        setEditingEntryId(entry.id);
        setEditShiftId(entry.shiftId);
        setEditNurseId(entry.nurseId || "");
        executeLiveValidation(entry.id, entry.nurseId || "", entry.shiftId, entry.id);
    };

    const handleInlineUpdate = async (entryId: string) => {
        if (!editShiftId) return;;

        const currentRowValidation = validationMap[entryId];
        // Bloqueo duro en el handler interno para la persistencia individual en caliente
        if (currentRowValidation && !currentRowValidation.canAssign) {
            return;
        }

        if (onUpdateEntry) {
            try {
                await onUpdateEntry(entryId, { shiftId: editShiftId, nurseId: editNurseId });
                setEditingEntryId(null);
                setValidationMap(prev => { const c = { ...prev }; delete c[entryId]; return c; });
                if (isSingleEditMode) onClose();
            } catch (error) {
                console.error("Error al actualizar la entrada de turno:", error);
            }
        }
    };

    const typeStyles: Record<string, string> = {
        MORNING: "text-amber-700 bg-amber-50 border-amber-200",
        AFTERNOON: "text-blue-700 bg-blue-50 border-blue-200",
        NIGHT: "text-purple-700 bg-purple-50 border-purple-200",
        FULL_DAY: "text-slate-700 bg-slate-100 border-slate-300",
        UNKNOWN: "text-gray-600 bg-gray-50 border-gray-200",
    };

    if (!isOpen) return null;



    console.log(filterShiftsForBulk)


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all ${isSingleEditMode ? 'max-w-xl max-h-[70vh]' : 'max-w-5xl max-h-[90vh]'}`}>

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {isSingleEditMode ? "⚙️ Modificar Asignación Individual" : `Asignaciones para el ${format(selectedDate, "PPP", { locale: es })}`}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Filtros de protección por departamento y mitigación de fatiga activos.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Panel Izquierdo / Panel Único */}
                    <div className={`flex flex-col bg-slate-50/50 ${isSingleEditMode ? 'w-full' : 'w-1/2 border-r'}`}>
                        {!isSingleEditMode && (
                            <div className="p-4 border-b bg-white">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="🔍 Buscar por personal o departamento..."
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        )}

                        <div className="p-6 overflow-y-auto flex-1 space-y-2">
                            {filteredEntries.map((entry) => {
                                const isEditingThis = editingEntryId === entry.id;
                                const shiftType: string = entry.shift?.type || entry.shiftTemplate?.name || "UNKNOWN";
                                const badgeClass = typeStyles[shiftType] || typeStyles.UNKNOWN;
                                const rowValidation = validationMap[entry.id];

                                return (
                                    <div key={entry.id} className={`bg-white p-4 rounded-xl border transition-all shadow-sm ${isEditingThis ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/10' : 'hover:shadow-md'}`}>
                                        {!isEditingThis ? (
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-slate-800">{entry.nurse?.user?.firstName} {entry.nurse?.user?.lastName}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">{entry.shiftTemplate?.department?.name || "Sin Depto."}</p>
                                                    <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                                        <span>🕒</span> {formatTime(entry.shift?.startTime)} - {formatTime(entry.shift?.endTime)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-[10px]font-bold tracking-wide border px-2.5 py-1 rounded-full uppercase ${badgeClass}`}>{shiftType}</span>
                                                    <button type="button" onClick={() => startEditing(entry)} className="cursor-pointer text-[11px] font-semibold text-blue-600 hover:underline">Modificar turno</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* FORMULARIO INTERACTIVO INLINE */
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between border-b pb-1.5">
                                                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1">✏️ Ajustar Parámetros</span>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => isSingleEditMode ? onClose() : setEditingEntryId(null)} className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md cursor-pointer ">Cancelar</button>
                                                        <button
                                                            type="button"
                                                            disabled={rowValidation?.canAssign === false || rowValidation?.isLoading}
                                                            onClick={() => handleInlineUpdate(entry.id)}
                                                            className=" cursor-pointer text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-md disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                                                        >
                                                            Guardar
                                                        </button>

                                                        {onDeleteEntry && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onDeleteEntry(entry.id)}
                                                                className="cursor-pointer text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                            >
                                                                🗑️ Borrar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5 pt-1">
                                                    <select
                                                        value={editNurseId}
                                                        onChange={(e) => {
                                                            setEditNurseId(e.target.value);
                                                            executeLiveValidation(entry.id, e.target.value, editShiftId, entry.id);
                                                        }}
                                                        className="cursor-pointer w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                    >
                                                        <option value="">⚠️ Dejar Vacante / Remover Asignación</option>
                                                        {filteredNurses.map(n => (
                                                            <option key={n.id} value={n.id}>
                                                                {n.user?.firstName} {n.user?.lastName}
                                                                {n.departmentId !== currentActiveDepartmentId ? " (🔄 Préstamo Interdepartamental)" : ""}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        value={editShiftId}
                                                        onChange={(e) => {
                                                            setEditShiftId(e.target.value);
                                                            executeLiveValidation(entry.id, editNurseId, e.target.value, entry.id);
                                                        }}
                                                        className="cursor-pointer w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20"
                                                    >
                                                        {filteredShifts.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                [{s.department?.name || "Gral"}] {s.name} ({formatTime(s.startTime)} - {formatTime(s.endTime)})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* RENDERING DE NOTIFICACIONES */}
                                                {rowValidation && (
                                                    <div className="text-[11px] space-y-1.5 pt-1">
                                                        {rowValidation.isLoading && (
                                                            <p className="text-blue-500 font-medium animate-pulse">🕵️ Simulando impacto de horarios...</p>
                                                        )}
                                                        {rowValidation.errors.map((err, i) => (
                                                            <div key={i} className="p-2 bg-red-50 border border-red-200 text-red-700 font-bold rounded-lg shadow-sm">
                                                                🚫 {err}
                                                            </div>
                                                        ))}
                                                        {rowValidation.warnings.map((war, i) => (
                                                            <div key={i} className="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg shadow-sm">
                                                                ⚠️ {war}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panel Derecho: Formulario Masivo (Oculto en edición única) */}
                    {!isSingleEditMode && (
                        <div className="w-1/2 flex flex-col p-6 overflow-hidden">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">⚡ Panel de Co-Piloto Masivo</h3>
                                <p className="text-xs text-slate-400">Agrega múltiples profesionales a este día en paralelo.</p>
                            </div>

                            <form className="flex-1 overflow-y-auto space-y-4 pr-1">
                                {fields.map((field, index) => {
                                    const rowValidation = validationMap[`new -${index}`];
                                    return (
                                        <div key={field.id} className="p-4 border bg-slate-50/50 rounded-xl space-y-3 relative animate-in slide-in-from-bottom-2 duration-150">
                                            <button
                                                type="button"
                                                onClick={() => { remove(index); setValidationMap(prev => { const c = { ...prev }; delete c[`new -${index}`]; return c; }); }}
                                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 text-xs font-semibold"
                                            >
                                                Quitar
                                            </button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Personal</label>
                                                    <select
                                                        {...register(`entries.${index}.nurseId` as const)}
                                                        onChange={(e) => {
                                                            const currentShift = watch(`entries.${index}.shiftId`);
                                                            executeLiveValidation(`new -${index}`, e.target.value, currentShift);
                                                        }}
                                                        className="w-full text-xs border-slate-200 rounded-lg"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {filteredNurses.map(n => (
                                                            <option key={n.id} value={n.id}>
                                                                {n.user?.firstName} {n.user?.lastName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Horario / Turno</label>
                                                    <select
                                                        {...register(`entries.${index}.shiftId` as const)}
                                                        onChange={(e) => {
                                                            const currentNurse = watch(`entries.${index}.nurseId`);
                                                            const selectedShiftId = e.target.value;

                                                            // 🔍 Buscamos en el arreglo original de 'shifts' el turno seleccionado para extraer su plantilla madre
                                                            const selectedShiftObj = shifts.find(s => s.id === selectedShiftId);
                                                            if (selectedShiftObj) {
                                                                const templateId = selectedShiftObj.shiftTemplateId || selectedShiftObj.templateId || "";

                                                                // 🟢 Seteamos el valor dinámicamente en React Hook Form para esta fila
                                                                setValue(`entries.${index}.shiftTemplateId` as const, templateId);
                                                            } else {
                                                                setValue(`entries.${index}.shiftTemplateId` as const, "");
                                                            }

                                                            executeLiveValidation(`new -${index}`, currentNurse, e.target.value);
                                                        }}
                                                        className="w-full text-xs border-slate-200 rounded-lg"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {filterShiftsForBulk.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                [{s.department?.name || "Gral"}] {s.name} ({formatTime(s.startTime)} - {formatTime(s.endTime)})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {/* 🟢 Agrega este input oculto para enlazar la propiedad nativamente al DTO */}
                                                    <input
                                                        type="hidden"
                                                        {...register(`entries.${index}.shiftTemplateId` as const)}
                                                    />
                                                </div>

                                            </div>

                                            {/* Validaciones Masivas en Vivo */}
                                            {rowValidation && (
                                                <div className="text-[11px] space-y-1">
                                                    {rowValidation.isLoading && (
                                                        <p className="text-blue-500 font-medium animate-pulse">🕵️ Comprobando restricciones...</p>
                                                    )}
                                                    {rowValidation.errors.map((err, i) => (
                                                        <div key={i} className="p-1.5 bg-red-50 text-red-700 font-bold rounded-md">
                                                            🚫 {err}
                                                        </div>
                                                    ))}
                                                    {rowValidation.warnings.map((war, i) => (
                                                        <div key={i} className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
                                                            ⚠️ {war}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => append({ nurseId: "", shiftId: "", notes: "", shiftTemplateId: "" })}
                                    className="cursor-pointer w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-all"
                                >
                                    + Añadir personal a este día
                                </button>
                            </form>

                            {/* Botón de Envío Final Masivo con Interceptor Seguro */}
                            <div className="pt-4 border-t mt-4 flex justify-end gap-2 bg-white">
                                <button type="button" onClick={onClose} className="cursor-pointer px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium">Cerrar Panel</button>
                                {fields.length > 0 && (
                                    <button
                                        type="button"
                                        disabled={hasAnyCriticalError}
                                        onClick={handleSubmit(handleSafeSubmit)}
                                        className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {hasAnyCriticalError ? "Asignación Bloqueada por Reglas" : "Confirmar Nuevas Asignaciones"}
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