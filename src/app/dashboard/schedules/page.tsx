"use client"

import React, { useState, useMemo, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useGlobalCalendar } from "@/modules/schedules/hooks/useGlobalCalendar";
import { ScheduleEntry } from "@/modules/schedules/types";
import { ShiftDetailsModal } from "@/modules/schedules/components/ShiftDetailsModal";
import { ScheduleEntryModal } from "@/modules/schedules/components/ScheduleEntryModal";
import { useNurses } from "@/modules/nurses/hooks/useNurses";
import { useShifts } from "@/modules/schedules/hooks/useShifts";
import { useScheduleEntries } from "@/modules/schedules/hooks/useScheduleEntries";
import { PublishSettingsModal } from "@/modules/schedules/components/PublishSettingsModal";
import { GenerateEngineModal } from "@/modules/schedules/components/GenerateEngineModal";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CalendarViewMode = "summary" | "all_staff";

// 🚀 OPTIMIZACIÓN 1: Helpers estáticos fuera del componente para que no se recreen en cada render
const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString.substring(0, 5);
    const timePart = isoString.split("T")[1];
    return timePart ? timePart.substring(0, 5) : "--:--";
};

const SCHEDULE_STATUS_CONFIG: Record<
    "DRAFT" | "GENERATING" | "GENERATED" | "UNDER_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED" | "CANCELLED" | "EMPTY",
    { label: string; icon: string; bgIcon: string; bgTag: string; pulse: boolean }
> = {
    DRAFT: { label: "Borrador", icon: "📝", bgIcon: "bg-amber-100 text-amber-800", bgTag: "bg-amber-200 text-amber-900", pulse: false },
    GENERATING: { label: "Generando con IA...", icon: "🤖", bgIcon: "bg-blue-100 text-blue-800", bgTag: "bg-blue-600 text-white", pulse: true },
    GENERATED: { label: "Generado (Engine)", icon: "✨", bgIcon: "bg-indigo-100 text-indigo-800", bgTag: "bg-indigo-200 text-indigo-900", pulse: false },
    UNDER_REVIEW: { label: "En Revisión", icon: "👁️", bgIcon: "bg-orange-100 text-orange-800", bgTag: "bg-orange-200 text-orange-900", pulse: false },
    APPROVED: { label: "Aprobado", icon: "✅", bgIcon: "bg-teal-100 text-teal-800", bgTag: "bg-teal-200 text-teal-900", pulse: false },
    PUBLISHED: { label: "Publicado Oficial", icon: "🚀", bgIcon: "bg-emerald-100 text-emerald-800", bgTag: "bg-emerald-200 text-emerald-900", pulse: false },
    ARCHIVED: { label: "Archivado", icon: "📦", bgIcon: "bg-slate-100 text-slate-800", bgTag: "bg-slate-200 text-slate-900", pulse: false },
    CANCELLED: { label: "Cancelado", icon: "❌", bgIcon: "bg-red-100 text-red-800", bgTag: "bg-red-200 text-red-900", pulse: false },
    EMPTY: { label: "Vacío", icon: "📭", bgIcon: "bg-slate-100 text-slate-500", bgTag: "bg-slate-200 text-slate-800", pulse: false },
};

interface DecisionModalProps {
    isOpen: boolean; onClose: () => void; onSelectDetails: () => void; onSelectEdit: () => void; nurseName: string;
}

const ActionDecisionModal: React.FC<DecisionModalProps> = ({ isOpen, onClose, onSelectDetails, onSelectEdit, nurseName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                <h3 className="text-base font-bold text-slate-900 mb-1">Gestión de Asignación</h3>
                <p className="text-xs text-slate-500 mb-5">
                    Selecciona la acción que deseas realizar para <span className="font-semibold text-slate-800">{nurseName}</span>.
                </p>
                <div className="flex flex-col gap-2">
                    <button onClick={onSelectEdit} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        ✏️ Editar o Modificar Asignación
                    </button>
                    <button onClick={onSelectDetails} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                        🔍 Ver Detalles del Turno
                    </button>
                    <button onClick={onClose} className="w-full bg-red-400 text-black font-bold hover:bg-red-600 hover:text-white hover:font-bold rounded-xl py-2 mt-1 text-xs transition-colors text-center">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function GlobalSchedulesPage() {
    const { entries, departments, setDateRange, selectedDepartment, setSelectedDepartment } = useGlobalCalendar();
    const { createEntries, updateEntry: inlineUpdateMutation, deleteEntry, publishSchedule, genrateSchedule, isPublishing, isGenerating } = useScheduleEntries();

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    const activeDeptName = useMemo(() => departments.find(d => d.id === selectedDepartment)?.name, [selectedDepartment, departments]);

    const { nurses } = useNurses();
    const { shifts, fetchShiftsForDay } = useShifts(selectedDepartment);

    const [viewMode, setViewMode] = useState<CalendarViewMode>("summary");
    const [isVacantCollapsed, setIsVacantCollapsed] = useState<boolean>(false);

    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDateForCreation, setSelectedDateForCreation] = useState<Date | null>(null);
    const [selectedSingleEntryId, setSelectedSingleEntryId] = useState<string | null>(null);
    const [decisionTarget, setDecisionTarget] = useState<ScheduleEntry | null>(null);

    const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);

    const handleDeleteConfirm = async () => {
        if (!entryToDeleteId) return;
        try {
            setIsDeletingLoading(true);
            await deleteEntry(entryToDeleteId);
            setEntryToDeleteId(null);
        } catch (err: any) {
            toast.error(`Error al eliminar: ${err.message}`);
        } finally {
            setIsDeletingLoading(false);
        }
    };

    const scheduleState = useMemo(() => {
        if (!entries || entries.length === 0) return { id: null, status: "EMPTY" };
        const firstEntry = entries[0];
        const scheduleId = firstEntry.scheduleId;
        const status = (firstEntry as any).schedule?.status || "DRAFT";
        return { id: scheduleId, status: status as "DRAFT" | "PUBLISHED" | "EMPTY" };
    }, [entries]);

    const lastProcessedRange = useRef<{ start: string; end: string } | null>(null);

    // 🚀 OPTIMIZACIÓN 2: Pre-calcular los strings e inyectarlos en "extendedProps".
    // Esto hace que la pintura de los bloques sea instantánea.
    const calendarEvents = useMemo(() => {
        const events: any[] = [];
        if (!entries) return events;

        if (viewMode === "summary") {
            const entriesByDate = new Map<string, { assigned: ScheduleEntry[], vacantCount: number }>();

            entries.forEach(entry => {
                const dateStr = entry.date.split("T")[0];
                let dayData = entriesByDate.get(dateStr);
                if (!dayData) {
                    dayData = { assigned: [], vacantCount: 0 };
                    entriesByDate.set(dateStr, dayData);
                }
                if (entry.nurseId && entry.nurse) dayData.assigned.push(entry);
                else dayData.vacantCount++;
            });

            entriesByDate.forEach((dayData, dateStr) => {
                dayData.assigned.forEach(entry => {
                    const timeStart = entry.shift?.startTime?.split("T")[1] || "00:00:00Z";
                    const timeEnd = entry.shift?.endTime?.split("T")[1] || "23:59:59Z";
                    const baseColor = entry.isEmergencyCoverage ? "#dc2626" : (entry.shift?.color && entry.shift.color !== "#f3f4f6" ? entry.shift.color : "#2563eb");

                    events.push({
                        id: entry.id,
                        title: `${entry.nurse?.user?.firstName} ${entry.nurse?.user?.lastName}`,
                        start: `${dateStr}T${timeStart}`,
                        end: `${dateStr}T${timeEnd}`,
                        backgroundColor: baseColor,
                        borderColor: "transparent",
                        textColor: "#ffffff",
                        extendedProps: {
                            type: "assignment",
                            entry,
                            departmentName: entry?.shiftTemplate?.department?.name || "Gral",
                            formattedTime: `${formatTimeStr(entry?.shift?.startTime)} - ${formatTimeStr(entry?.shift?.endTime)}`
                        }
                    });
                });

                if (dayData.vacantCount > 0 && !isVacantCollapsed) {
                    events.push({
                        id: `vacants-${dateStr}`,
                        title: `➕ ${dayData.vacantCount} Vacantes`,
                        start: dateStr,
                        allDay: true,
                        backgroundColor: "#fee2e2",
                        textColor: "#991b1b",
                        borderColor: "#fca5a5",
                        extendedProps: { type: "vacant_summary", dateStr }
                    });
                }
            });
        } else {
            entries.forEach((entry) => {
                const dateOnly = entry.date.split("T")[0];
                const timeStart = entry.shift?.startTime?.split("T")[1] || "00:00:00Z";
                const timeEnd = entry.shift?.endTime?.split("T")[1] || "23:59:59Z";
                const isVacant = !entry.nurseId || !entry.nurse;
                const baseColor = isVacant ? "#475569" : (entry.isEmergencyCoverage ? "#dc2626" : (entry.shift?.color || "#2563eb"));

                events.push({
                    id: entry.id,
                    title: isVacant ? "⚠️ VACANTE" : `${entry.nurse?.user?.firstName} ${entry.nurse?.user?.lastName}`,
                    start: `${dateOnly}T${timeStart}`,
                    end: `${dateOnly}T${timeEnd}`,
                    backgroundColor: baseColor,
                    textColor: "#ffffff",
                    borderColor: "transparent",
                    extendedProps: {
                        type: "assignment",
                        entry,
                        departmentName: entry?.shiftTemplate?.department?.name || "Gral",
                        formattedTime: `${formatTimeStr(entry?.shift?.startTime)} - ${formatTimeStr(entry?.shift?.endTime)}`
                    }
                });
            });
        }

        return events;
    }, [entries, viewMode, isVacantCollapsed]);

    // 🚀 OPTIMIZACIÓN 3: Envolver funciones que se pasan al FullCalendar en useCallback
    const handleDatesSet = useCallback((arg: any) => {
        if (lastProcessedRange.current?.start === arg.startStr && lastProcessedRange.current?.end === arg.endStr) {
            return;
        }
        lastProcessedRange.current = { start: arg.startStr, end: arg.endStr };
        setDateRange({ startDate: arg.startStr, endDate: arg.endStr });
    }, [setDateRange]);

    const renderEventContent = useCallback((arg: any) => {
        const { type, departmentName, formattedTime } = arg.event.extendedProps;

        if (type === "vacant_summary") {
            return (
                <div className="w-full text-center py-0.5 px-1.5 rounded-md font-bold text-[10px] border border-red-200/60 shadow-sm transition-all bg-red-50 text-red-800 cursor-pointer">
                    {arg.event.title}
                </div>
            );
        }

        return (
            <div className="p-1 overflow-hidden flex flex-col w-full text-black font-medium leading-tight">
                <span className="text-xs font-bold truncate drop-shadow-sm">
                    {arg.event.title}
                </span>
                <span className="text-[10px] font-semibold opacity-90 mt-0.5 tracking-wide flex items-center gap-1 bg-black/10 px-1 py-0.5 rounded sm:inline-block truncate">
                    🏥 [{departmentName}] {formattedTime}
                </span>
            </div>
        );
    }, []);

    const handleCloseMainModal = () => {
        setIsCreateModalOpen(false);
        setSelectedDateForCreation(null);
        setSelectedSingleEntryId(null);
    };

    const openManagementModal = (date: Date, singleId: string | null = null) => {
        setSelectedDateForCreation(date);
        setSelectedSingleEntryId(singleId);
        fetchShiftsForDay(date, selectedDepartment);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen transition-all">
            {/* ENCABEZADO Y CONTROLES */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">📅 Calendario Global de Turnos</h1>
                    <p className="text-sm text-slate-500">Gestión de coberturas y asignaciones de enfermería.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {viewMode === "summary" && (
                        <button
                            onClick={() => setIsVacantCollapsed(!isVacantCollapsed)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${isVacantCollapsed ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                        >
                            {isVacantCollapsed ? "👁️ Mostrar Slots Vacantes" : "🙈 Colapsar Slots Vacantes"}
                        </button>
                    )}

                    <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                        <button onClick={() => setViewMode("summary")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === "summary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                            Vista Compacta (Días)
                        </button>
                        <button onClick={() => setViewMode("all_staff")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === "all_staff" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                            Ver Todo
                        </button>
                    </div>

                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="rounded-xl border-slate-200 border p-2 text-sm shadow-sm bg-white font-medium text-slate-700 outline-none">
                        <option value="">Todos los Departamentos</option>
                        {departments.map((dep: any) => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                    </select>
                </div>
            </div>

            {/* BARRA DE ESTADO */}
            <div className={`mb-6 p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm ${scheduleState.status === "DRAFT" ? "bg-amber-50/60 border-amber-200" : "bg-emerald-50/60 border-emerald-200"}`}>
                {(() => {
                    const currentStatus = scheduleState.status as keyof typeof SCHEDULE_STATUS_CONFIG;
                    const config = SCHEDULE_STATUS_CONFIG[currentStatus] || SCHEDULE_STATUS_CONFIG.EMPTY;
                    return (
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-all ${config.bgIcon}`}>{config.icon}</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-slate-800">Estado del Horario Actual:</h3>
                                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all ${config.bgTag} ${config.pulse ? "animate-pulse" : ""}`}>
                                        {config.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {scheduleState.status === "DRAFT" && (
                        <button onClick={() => setIsPublishModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                            📢 Publicar Horario...
                        </button>
                    )}
                    <button onClick={() => setIsGenerateModalOpen(true)} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all">
                        🔄 Volver a Generar (Engine)...
                    </button>
                </div>
            </div>

            {/* CALENDARIO */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="fullcalendar-wrapper global-schedules-theme">
                    {/* 🚀 OPTIMIZACIÓN 4: ELIMINAR LA KEY DINÁMICA.
                        No le pases ninguna 'key' al FullCalendar. React mantendrá la instancia viva
                        y las transiciones (cambios de array en events) las hará FullCalendar nativamente sin pestañear.
                    */}
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locales={[esLocale]}
                        locale="es"
                        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
                        events={calendarEvents} // Este array actualizará la vista sin destrozar el componente
                        height="auto"
                        navLinks={true}
                        nowIndicator={true}
                        eventContent={renderEventContent}
                        datesSet={handleDatesSet}
                        eventClick={(info) => {
                            const { type, entry, dateStr } = info.event.extendedProps;
                            if (type === "vacant_summary" && dateStr) {
                                openManagementModal(new Date(`${dateStr}T12:00:00`));
                            } else if (entry) {
                                setDecisionTarget(entry as ScheduleEntry);
                            }
                        }}
                    />
                </div>
            </div>

            {/* MODALES SECUNDARIOS */}
            <ActionDecisionModal
                isOpen={!!decisionTarget}
                nurseName={decisionTarget ? `${decisionTarget.nurse?.user?.firstName} ${decisionTarget.nurse?.user?.lastName}` : ""}
                onClose={() => setDecisionTarget(null)}
                onSelectDetails={() => { setSelectedEntry(decisionTarget); setDecisionTarget(null); }}
                onSelectEdit={() => { if (decisionTarget) { openManagementModal(new Date(decisionTarget.date), decisionTarget.id); } setDecisionTarget(null); }}
            />

            <ShiftDetailsModal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} entry={selectedEntry} />

            {selectedDateForCreation && isCreateModalOpen && (
                <ScheduleEntryModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseMainModal}
                    selectedDate={selectedDateForCreation}
                    singleEntryId={selectedSingleEntryId}
                    existingEntries={entries.filter(e => {
                        const offset = selectedDateForCreation.getTimezoneOffset() * 60000;
                        const localTargetDate = new Date(selectedDateForCreation.getTime() - offset).toISOString().split('T')[0];
                        const entryDate = e.date.split('T')[0];
                        const matchesDate = localTargetDate === entryDate;

                        let matchesDept = true;
                        if (selectedDepartment) {
                            const entryDeptId = (e.shiftTemplate as any)?.departmentId || e.shiftTemplate?.department.id || (e.shift as any)?.departmentId;
                            matchesDept = entryDeptId === selectedDepartment;
                        }
                        return matchesDate && matchesDept;
                    })}
                    activeDepartmentId={selectedDepartment}
                    nurses={nurses || []}
                    shifts={shifts || []}
                    onSave={async (formData) => {
                        try {
                            if (selectedSingleEntryId) {
                                const currentTargetEntry = entries.find(e => e.id === selectedSingleEntryId);
                                const resolvedDepartmentId = selectedDepartment || (currentTargetEntry?.shiftTemplate as any)?.departmentId || (currentTargetEntry?.shiftTemplate as any)?.department?.id;

                                if (!resolvedDepartmentId) {
                                    toast.error("No se pudo determinar el departamento para validar las reglas de la asignación.");
                                    return;
                                }

                                const singlePayload = formData.entries?.[0];
                                if (!singlePayload) {
                                    toast.error("No se encontraron cambios estructurados para actualizar.");
                                    return;
                                }
                                await inlineUpdateMutation({ id: selectedSingleEntryId, shiftId: singlePayload.shiftId, nurseId: singlePayload.nurseId, departmentId: resolvedDepartmentId });
                                handleCloseMainModal();
                                return;
                            }
                            await createEntries({ date: selectedDateForCreation.toISOString(), entries: formData.entries, scheduleId: entries[0].scheduleId });
                        } catch (err: any) {
                            toast.error(`Error operacional: ${err.message}`);
                        }
                    }}
                    onUpdateEntry={async (entryId, updatedData) => {
                        try {
                            const currentTargetEntry = entries.find(e => e.id === entryId);
                            const resolvedDepartmentId = selectedDepartment || (currentTargetEntry?.shiftTemplate as any)?.department?.id;
                            if (!resolvedDepartmentId) {
                                toast.error("No se pudo determinar el departamento.");
                                return;
                            }
                            await inlineUpdateMutation({ id: entryId, shiftId: updatedData.shiftId, nurseId: updatedData.nurseId, departmentId: resolvedDepartmentId });
                        } catch (err: any) {
                            toast.error(`Error de actualización: ${err.message}`);
                        }
                    }}
                    onDeleteEntry={(entryId) => setEntryToDeleteId(entryId)}
                />
            )}

            {/* 🌟 BLOQUE FINAL CERRADO CORRECTAMENTE */}
            <AlertDialog open={!!entryToDeleteId} onOpenChange={(open) => !open && setEntryToDeleteId(null)}>
                <AlertDialogContent className="max-w-md rounded-2xl border border-slate-100 shadow-2xl bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-slate-900">
                            ¿Estás absolutamente seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed mt-2">
                            Esta acción eliminará de forma permanente el turno seleccionado en el calendario y desasignará al personal. No se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 mt-4">
                        <AlertDialogCancel disabled={isDeletingLoading} className="rounded-xl">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault(); // Evitamos cierre automático hasta que termine el backend
                                handleDeleteConfirm();
                            }}
                            disabled={isDeletingLoading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                        >
                            {isDeletingLoading ? "Eliminando..." : "Sí, eliminar turno"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* 🟢 MODAL 1: OPCIONES AVANZADAS DE PUBLICACIÓN */}
            <PublishSettingsModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                isLoading={isPublishing}
                onConfirm={async (payloadData) => {
                    try {
                        // Construimos el Payload exacto uniendo el scheduleId maestro
                        await publishSchedule({
                            scheduleId: scheduleState.id,
                            ...payloadData
                        });
                        toast.success("🚀 ¡Horario consolidado y publicado con éxito!");
                        setIsPublishModalOpen(false); // Cierra al procesar con éxito
                    } catch (err: any) {
                        toast.error(err.message || "Error al intentar publicar el cuadrante.");
                    }
                }}
            />

            {/* 🟢 MODAL 2: CONFIGURACIÓN DE PERIODOS DEL SCHEDULE ENGINE */}
            <GenerateEngineModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                isLoading={isGenerating}
                activeDepartmentName={activeDeptName}
                onConfirm={async (timePeriod) => {
                    try {
                        // Enviamos el departamento activo más el mes/año seleccionado en el DTO
                        await genrateSchedule({
                            departmentId: selectedDepartment,
                            month: timePeriod.month,
                            year: timePeriod.year
                        });
                        toast.success("🤖 Motor ejecutado. El nuevo borrador óptimo ha sido cargado.");
                        setIsGenerateModalOpen(false);
                    } catch (err: any) {
                        toast.error(err.message || "Ocurrió un conflicto al compilar el motor.");
                    }
                }}
            />
        </div>

    );

}