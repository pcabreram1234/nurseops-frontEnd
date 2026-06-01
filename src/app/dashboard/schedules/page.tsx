"use client"

import React, { useState, useMemo } from "react";
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

type CalendarViewMode = "summary" | "all_staff";

interface DecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDetails: () => void;
    onSelectEdit: () => void;
    nurseName: string;
}
const ActionDecisionModal: React.FC<DecisionModalProps> = ({ isOpen, onClose, onSelectDetails, onSelectEdit, nurseName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                <h3 className="text-base font-bold text-slate-900 mb-1">Gestión de Asignación</h3>
                <p className="text-xs text-slate-500 mb-5">
                    Selecciona la acción que deseas realizar para <span className="font-semibold text-slate-800">{nurseName}</span>.
                </p>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={onSelectEdit}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        ✏️ Editar o Modificar Asignación
                    </button>
                    <button 
                        onClick={onSelectDetails}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                    >
                        🔍 Ver Detalles del Turno
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full bg-red-400 text-black font-bold hover:bg-red-600 hover:text-white hover:font-bold rounded-xl py-2 mt-1 text-xs  transition-colors text-center"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function GlobalSchedulesPage() {
    const {
        entries,
        departments,
        isLoading,
        setDateRange,
        selectedDepartment,
        setSelectedDepartment,
        updateEntry
    } = useGlobalCalendar();
    
    const { nurses } = useNurses();
    const { shifts, fetchShiftsForDay } = useShifts(selectedDepartment);

    const [viewMode, setViewMode] = useState<CalendarViewMode>("summary");
    const [isVacantCollapsed, setIsVacantCollapsed] = useState<boolean>(false); 
    
    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDateForCreation, setSelectedDateForCreation] = useState<Date | null>(null);
    
    // 🌟 NUEVO: Estado para capturar si se edita un solo registro específico
    const [selectedSingleEntryId, setSelectedSingleEntryId] = useState<string | null>(null);
    const [decisionTarget, setDecisionTarget] = useState<ScheduleEntry | null>(null);

    const calendarEvents = useMemo(() => {
        const entriesByDate: Record<string, ScheduleEntry[]> = {};
        
        entries.forEach(entry => {
            const dateStr = entry.date.split("T")[0];
            if (!entriesByDate[dateStr]) entriesByDate[dateStr] = [];
            entriesByDate[dateStr].push(entry);
        });

        const events: any[] = [];

        if (viewMode === "summary") {
            Object.entries(entriesByDate).forEach(([dateStr, dayEntries]) => {
                const assigned = dayEntries.filter(e => e.nurseId && e.nurse);
                const vacantCount = dayEntries.filter(e => !e.nurseId || !e.nurse).length;

                assigned.forEach(entry => {
                    const timeStart = entry.shift?.startTime?.split("T")[1] || "00:00:00Z";
                    const timeEnd = entry.shift?.endTime?.split("T")[1] || "23:59:59Z";
                    
                    const baseColor = entry.isEmergencyCoverage 
                        ? "#dc2626" 
                        : (entry.shift?.color && entry.shift.color !== "#f3f4f6" ? entry.shift.color : "#2563eb");

                    events.push({
                        id: entry.id,
                        title: `${entry.nurse?.user?.firstName} ${entry.nurse?.user?.lastName}`,
                        start: `${dateStr}T${timeStart}`,
                        end: `${dateStr}T${timeEnd}`,
                        backgroundColor: baseColor,
                        borderColor: "transparent",
                        textColor: "#ffffff",
                        extendedProps: { type: "assignment", entry }
                    });
                });

                if (vacantCount > 0 && !isVacantCollapsed) {
                    events.push({
                        id: `vacants-${dateStr}`,
                        title: `➕ ${vacantCount} Vacantes`,
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
                    extendedProps: { type: "assignment", entry }
                });
            });
        }

        return events;
    }, [entries, viewMode, isVacantCollapsed]);

    const openManagementModal = (date: Date, singleId: string | null = null) => {
        setSelectedDateForCreation(date);
        setSelectedSingleEntryId(singleId); // Asignamos si viene de un slot específico o no
        fetchShiftsForDay(date, selectedDepartment);
        setIsCreateModalOpen(true);
    };

    const handleCloseMainModal = () => {
        setIsCreateModalOpen(false);
        setSelectedDateForCreation(null);
        setSelectedSingleEntryId(null);
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

            {/* CALENDARIO */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="fullcalendar-wrapper global-schedules-theme">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        locales={[esLocale]}
                        locale="es"
                        headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
                        events={calendarEvents}
                        height="auto"
                        navLinks={true}
                        nowIndicator={true}

                        eventClick={(info) => {
                            const { type, entry, dateStr } = info.event.extendedProps;
                            if (type === "vacant_summary" && dateStr) {
                                openManagementModal(new Date(`${dateStr}T12:00:00`));
                            } else if (entry) {
                                setDecisionTarget(entry as ScheduleEntry);
                            }
                        }}

                        datesSet={(arg) => setDateRange({ startDate: arg.startStr, endDate: arg.endStr })}

                        eventContent={(arg) => {
                            const isSummaryBadge = arg.event.extendedProps.type === "vacant_summary";
                            if (isSummaryBadge) {
                                return (
                                    <div className="w-full text-center py-0.5 px-1.5 rounded-md font-bold text-[10px] border border-red-200/60 shadow-sm transition-all bg-red-50 text-red-800 cursor-pointer">
                                        {arg.event.title}
                                    </div>
                                );
                            }
                            return (
                                <div className="p-1 overflow-hidden flex flex-col w-full text-black font-medium">
                                    <span className="text-[9px] font-bold opacity-95 leading-none">{arg.timeText}</span>
                                    <span className="text-xs font-bold truncate leading-tight mt-0.5 drop-shadow-sm">
                                        {arg.event.title}
                                    </span>
                                </div>
                            );
                        }}

                        dateClick={(info) => openManagementModal(info.date)}

                        eventDrop={async (info) => {
                            try { await updateEntry({ id: info.event.id, date: info.event.startStr }); } catch { info.revert(); }
                        }}
                    />
                </div>
            </div>

            {/* MODAL DECISIÓN INTERMEDIA */}
            <ActionDecisionModal
                isOpen={!!decisionTarget}
                nurseName={decisionTarget ? `${decisionTarget.nurse?.user?.firstName} ${decisionTarget.nurse?.user?.lastName}` : ""}
                onClose={() => setDecisionTarget(null)}
                onSelectDetails={() => {
                    setSelectedEntry(decisionTarget);
                    setDecisionTarget(null);
                }}
                onSelectEdit={() => {
                    if (decisionTarget) {
                        // Pasamos la fecha y el ID específico del slot asignado
                        openManagementModal(new Date(decisionTarget.date), decisionTarget.id);
                    }
                    setDecisionTarget(null);
                }}
            />

            <ShiftDetailsModal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} entry={selectedEntry} />

            {/* MODAL MAESTRO INTELIGENTE (GENERAL O INDIVIDUAL) */}
            {selectedDateForCreation && isCreateModalOpen && (
                <ScheduleEntryModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseMainModal}
                    selectedDate={selectedDateForCreation}
                    singleEntryId={selectedSingleEntryId} // 🌟 PASAMOS EL FILTRO ÚNICO
                    existingEntries={entries.filter(e => e.date.startsWith(selectedDateForCreation.toISOString().split('T')[0]))}
                    nurses={nurses || []}
                    shifts={shifts} 
                    onSave={async (data) => {
                        console.log("Guardando asignaciones:", data);
                        handleCloseMainModal();
                    }}
                    onUpdateEntry={async (id, updatedData) => {
                        console.log("Modificando entrada inline:", id, updatedData);
                    }}
                />
            )}
        </div>
    );
}