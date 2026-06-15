"use client"

import React from "react";
import { PublishSchedulePayload, NotificationValidationObject } from "../hooks/useScheduleEntries";

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Recibe el payload omitiendo el scheduleId ya que este lo inyecta la vista padre (page.tsx)
    onConfirm: (payload: Omit<PublishSchedulePayload, "scheduleId">) => void;
    isLoading: boolean;
}

export const PublishSettingsModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
    // 1. Estados base de publicación y snapshot
    const [notifyStaff, setNotifyStaff] = React.useState(true);
    const [createSnapshot, setCreateSnapshot] = React.useState(true);
    const [forcePublish, setForcePublish] = React.useState(false);

    // 2. Estados internos para construir el objeto compuesto 'validateBeforePublish'
    const [validatePublish, setValidatePublish] = React.useState(true);
    const [validatePushNotifications, setValidatePushNotifications] = React.useState(true);
    const [validateEmails, setValidateEmails] = React.useState(true);

    // 3. Canales inmediatos de distribución de alertas
    const [sendPush, setSendPush] = React.useState(true);
    const [sendMail, setSendMail] = React.useState(true);
    const [notes, setNotes] = React.useState("");

    if (!isOpen) return null;

    const handleConfirmClick = () => {
        // 🟢 CONSTRUCCIÓN DEL OBJETO COMPUESTO EXIGIDO POR TU NUEVA INTERFAZ
        const validationObject: NotificationValidationObject = {
            publish: validatePublish,
            sendPushNotifications: validatePushNotifications,
            sendEmails: validateEmails
        };

        onConfirm({
            notifyStaff,
            createVersionSnapshot: createSnapshot,
            forcePublish, // Ahora vuelve a ser un booleano simple 👍
            validateBeforePublish: validatePublish, // 👈 Inyectamos el objeto compuesto aquí
            sendPushNotifications: validationObject,
            sendEmails: sendMail,
            publicationNotes: notes || undefined // Evita enviar strings vacíos
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">🚀 Publicación de Horario</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Configura los disparadores operacionales y canales de aviso.</p>
                </div>

                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Sección: Validación antes de Publicar (Agrupación de Checkboxes) */}
                    <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">🛡️ Control de Validación Previa</span>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={validatePublish} onChange={(e) => setValidatePublish(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-[11px] text-slate-600 font-medium">Validar reglas de negocio del cuadrante al publicar</span>
                        </label>
                        
                        {/* <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={validatePushNotifications} onChange={(e) => setValidatePushNotifications(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-[11px] text-slate-600 font-medium">Validar estado de tokens y Push antes del envío</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={validateEmails} onChange={(e) => setValidateEmails(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-[11px] text-slate-600 font-medium">Validar buzones de correo institucionales</span>
                        </label> */}
                    </div>

                    {/* Snapshot */}
                    <label className="flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" checked={createSnapshot} onChange={(e) => setCreateSnapshot(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <div>
                            <span className="text-xs font-bold text-slate-800 block">Crear respaldo de versión (Snapshot)</span>
                            <span className="text-[11px] text-slate-500">Almacena un clon inmutable en el historial JSON por si requieres auditorías.</span>
                        </div>
                    </label>

                    {/* Notificaciones */}
                    <label className="flex items-start gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                        <input type="checkbox" checked={notifyStaff} onChange={(e) => { setNotifyStaff(e.target.checked); if (!e.target.checked) { setSendPush(false); setSendMail(false); } else { setSendPush(true); setSendMail(true); } }} className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <div>
                            <span className="text-xs font-bold text-slate-800 block">Notificar al personal afectado</span>
                            <span className="text-[11px] text-slate-500">Encola la distribución de alertas masivas en segundo plano (BullMQ).</span>
                        </div>
                    </label>

                    {notifyStaff && (
                        <div className="ml-7 pl-3 border-l-2 border-slate-100 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600" />
                                <span className="text-[11px] text-slate-600">Enviar alertas Push (Dispositivos móviles)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={sendMail} onChange={(e) => setSendMail(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600" />
                                <span className="text-[11px] text-slate-600">Enviar correos institucionales</span>
                            </label>
                        </div>
                    )}

                    {/* Forzar Publicación Simple */}
                    <label className="flex items-start gap-3 p-2.5 hover:bg-amber-50/50 rounded-xl cursor-pointer transition-colors border border-amber-100 bg-amber-50/20">
                        <input type="checkbox" checked={forcePublish} onChange={(e) => setForcePublish(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                        <div>
                            <span className="text-xs font-bold text-amber-900 block">Forzar publicación (Ignorar advertencias)</span>
                            <span className="text-[11px] text-amber-700/80">Fuerza la aprobación oficial aun si existen advertencias menores de descanso o fatiga.</span>
                        </div>
                    </label>

                    {/* Notas circulares */}
                    <div className="space-y-1.5 p-1">
                        <span className="text-xs font-bold text-slate-700 block">Notas o circulares del periodo</span>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: Periodo de alta demanda invernal, refuerzos médicos activos..." className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[60px]" />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-medium transition-colors">Cancelar</button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleConfirmClick}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Publicando..." : "🚀 Confirmar Publicación"}
                    </button>
                </div>
            </div>
        </div>
    );
};