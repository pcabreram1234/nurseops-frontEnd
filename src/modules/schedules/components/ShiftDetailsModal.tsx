// @/modules/schedules/components/ShiftDetailsModal.tsx
import React from "react";
import { ScheduleEntry } from "../types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { typeStyles } from "../types"; // Importación del Record que provees

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entry: ScheduleEntry | null;
}

export const ShiftDetailsModal: React.FC<Props> = ({ isOpen, onClose, entry }) => {
    if (!isOpen || !entry) return null;

    const nurseName = entry.nurse 
        ? `${entry.nurse.user.firstName} ${entry.nurse.user.lastName}` 
        : "TURNO ABIERTO (Sin asignar)";

    // 🌟 ASIGNACIÓN INTELIGENTE DEL COLOR DE TURNOS
    // Extraemos el tipo y nos aseguramos de caer en UNKNOWN si viene vacío o no coincide con el Record
    const shiftType = entry.shift?.type || "UNKNOWN";
    const badgeClass = typeStyles[shiftType] || typeStyles.UNKNOWN;

    // Formateo amigable de la fecha
    const dateFormatted = format(parseISO(entry.date), "EEEE, d 'de' MMMM, yyyy", { locale: es });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                
                {/* Cabecera */}
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        📋 Detalles del Turno
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Contenido */}
                <div className="space-y-4">
                    <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Asignado a</span>
                        <div className={`font-bold text-lg mt-0.5 ${!entry.nurse ? 'text-amber-600' : 'text-slate-800'}`}>
                            {nurseName}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fecha</span>
                            <div className="text-sm font-semibold text-slate-700 capitalize mt-0.5">{dateFormatted}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Horario</span>
                            <div className="text-sm font-bold text-slate-700 mt-0.5">
                                🕒 {format(parseISO(entry.shift.startTime), "HH:mm")} - {format(parseISO(entry.shift.endTime), "HH:mm")}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Clasificación del Turno
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {/* 🌟 APLICACIÓN DINÁMICA DE TUS ESTILOS CON BORDES */}
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase border ${badgeClass}`}>
                                {shiftType === "UNKNOWN" ? "No Definido" : shiftType.replace("_", " ")}
                            </span>
                            
                            {/* Atributos Adicionales */}
                            {entry.shift.isNightShift && (
                                <span className="px-2.5 py-1 bg-slate-800 text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                                    Nocturno 🌙
                                </span>
                            )}
                            {entry.isEmergencyCoverage && (
                                <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
                                    Emergencia 🚨
                                </span>
                            )}
                        </div>
                    </div>

                    {entry.notes && (
                        <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Observaciones</span>
                            <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl border border-slate-100 italic">
                                "{entry.notes}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Botón de Cierre */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-black transition-colors shadow-sm"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};