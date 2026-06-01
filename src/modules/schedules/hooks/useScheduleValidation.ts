// @/modules/schedules/hooks/useScheduleValidation.ts
import { useState } from "react";
import { scheduleService } from "../services/scheduleService";

export const useScheduleValidation = () => {
    // Estos estados son objetos donde la clave es el número de fila (index)
    const [isChecking, setIsChecking] = useState<Record<number, boolean>>({});
    const [warnings, setWarnings] = useState<Record<number, string[]>>({});

    // AÑADIMOS 'index' como parámetro necesario
    const check = async (
        index: number,
        nurseId: string,
        shiftId: string,
        date: Date,
        existingEntries: any[]
    ) => {
        // Marcamos solo esta fila como cargando
        setIsChecking(prev => ({ ...prev, [index]: true }));

        try {
            const newWarnings: string[] = [];

            // 1. Validación local
            if (existingEntries.some(e => e.nurseId === nurseId)) {
                newWarnings.push("Esta enfermera ya tiene turno este día.");
            }

            // 2. Validación remota
            const data = await scheduleService.validateAssignment(nurseId, shiftId, date);

            if (data.errors) newWarnings.push(...data.errors);
            if (data.monthlyHours > 160) newWarnings.push(`⚠️ Alerta: Acumula ${data.monthlyHours}h este mes.`);

            // Guardamos las advertencias específicamente en este índice
            setWarnings(prev => ({ ...prev, [index]: newWarnings }));

            return { canAssign: newWarnings.length === 0 };
        } catch (error) {
            console.error("Error en validación:", error);
            return { canAssign: false };
        } finally {
            // Terminamos el loading solo para esta fila
            setIsChecking(prev => ({ ...prev, [index]: false }));
        }
    };

    return { check, isChecking, warnings, setWarnings };
};