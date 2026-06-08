"use client"
import React from "react";
// 📝 Componente: GenerateEngineModal
interface GenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (payload: { month: number; year: number }) => void;
    isLoading: boolean;
    activeDepartmentName: string;
}

export const GenerateEngineModal: React.FC<GenerateModalProps> = ({ isOpen, onClose, onConfirm, isLoading, activeDepartmentName }) => {
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(currentYear);

    if (!isOpen) return null;

    const meses = [
        { v: 1, n: "Enero" }, { v: 2, n: "Febrero" }, { v: 3, n: "Marzo" }, { v: 4, n: "Abril" },
        { v: 5, n: "Mayo" }, { v: 6, n: "Junio" }, { v: 7, n: "Julio" }, { v: 8, n: "Agosto" },
        { v: 9, n: "Septiembre" }, { v: 10, n: "Octubre" }, { v: 11, n: "Noviembre" }, { v: 12, n: "Diciembre" }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">🤖 Ejecutar Schedule Engine</h3>
                    <p className="text-xs text-slate-500 mt-0.5">El motor automatizado calculará la distribución óptima.</p>
                </div>

                <div className="p-5 space-y-4">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <span className="text-[11px] uppercase tracking-wider text-blue-700 font-extrabold block">Departamento Objetivo</span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5 block">📍 {activeDepartmentName || "Ninguno Seleccionado"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Mes de Planificación</label>
                            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none">
                                {meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600">Año Operacional</label>
                            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none">
                                <option value={currentYear}>{currentYear}</option>
                                <option value={currentYear + 1}>{currentYear + 1}</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed border-t pt-3 border-slate-100">
                        ⚠️ <strong>Nota:</strong> Si ya existe un borrador guardado en este periodo y departamento, sus filas se limpiarán automáticamente para inyectar la nueva simulación calculada por el motor.
                    </p>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">Cerrar</button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => onConfirm({ month, year })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Calculando Cuadrante..." : "🤖 Lanzar Simulación"}
                    </button>
                </div>
            </div>
        </div>
    );
};