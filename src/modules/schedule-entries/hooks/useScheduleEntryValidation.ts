"use client";

import { useMemo } from "react";
import { ScheduleEntry, ScheduleEntryFormData } from "../types";

export interface NurseWithProfile {
    id: string;
    user?: { id: string; firstName: string; lastName: string; email: string };
    departmentId: string;
    name:string; //Nombre de departamento
    isCrossDepartmental: boolean;
    nurseRestrictions?: Array<{
        restrictionType: {
            name: string;
            description: string;
            severity: string;
        };
    }>;
    absences?: Array<{
        date: string;
        endDate: string;
        type: string;
        status: string;
    }>;
    leaves?: Array<{
        startDate: string;
        endDate: string;
        status: string;
    }>;
}

export interface ShiftWithTemplate {
    id: string;
    type:string;
    name: string;
    startTime: string;
    endTime: string;
    departmentId?: string;
    shiftTemplateId?: string;
}

export interface ValidationResult {
    canAssign: boolean;
    errors: string[];
    warnings: string[];
}

export interface UseScheduleEntryValidationOptions {
    nurses: NurseWithProfile[];
    shifts: ShiftWithTemplate[];
    currentEntry?: ScheduleEntry | null;
    departmentsMap?: Map<string, string>;
}

/**
 * Hook para validación del lado del cliente de asignaciones de turnos.
 * Replica la lógica del backend validateSingleAssignment para dar feedback inmediato al usuario.
 */
export function useScheduleEntryValidation({ nurses, shifts, currentEntry, departmentsMap }: UseScheduleEntryValidationOptions) {

    const validateAssignment = useMemo(() => {
        return (formData: ScheduleEntryFormData): ValidationResult => {
            const errors: string[] = [];
            const warnings: string[] = [];

            const { nurseId, shiftId, date } = formData;

            // Si no hay enfermera seleccionada, es una vacante - no validar restricciones de enfermera
            if (!nurseId || nurseId === "") {
                return { canAssign: true, errors: [], warnings: [] };
            }

            const nurse = nurses.find(n => n.id === nurseId);
            const shift = shifts.find(s => s.id === shiftId);

            if (!nurse) {
                errors.push("La enfermera seleccionada no existe.");
                return { canAssign: false, errors, warnings };
            }

            if (!shift) {
                errors.push("El turno seleccionado no existe.");
                return { canAssign: false, errors, warnings };
            }

            const targetDate = new Date(date);

            // ==========================================================================
            // 1. VALIDACIÓN: VACACIONES APROBADAS
            // ==========================================================================
            if (nurse.absences && nurse.absences.length > 0) {
                const isOnVacation = nurse.absences.some(v =>
                    v.type === "VACATION" && v.status === "APPROVED" &&
                    targetDate >= new Date(v.date) && targetDate <= new Date(v.endDate)
                );

                if (isOnVacation) {
                    errors.push("La enfermera está actualmente en vacaciones aprobadas.");
                }
            }

            // ==========================================================================
            // 2. VALIDACIÓN: PERMISOS / LICENCIAS MÉDICAS ACTIVAS
            // ==========================================================================
            if (nurse.leaves && nurse.leaves.length > 0) {
                const hasLeave = nurse.leaves.some(l =>
                    l.status === "APPROVED" &&
                    targetDate >= new Date(l.startDate) && targetDate <= new Date(l.endDate)
                );

                if (hasLeave) {
                    errors.push("La enfermera tiene una licencia médica aprobada para este día.");
                }
            }

            // ==========================================================================
            // 3. VALIDACIÓN: RESTRICCIONES CLÍNICAS (Salud Ocupacional)
            // ==========================================================================
            if (nurse.nurseRestrictions && nurse.nurseRestrictions.length > 0) {
                for (const restriction of nurse.nurseRestrictions) {
                    const type = restriction.restrictionType;
                    if (!type) continue;

                    const isConflict = evaluateRestrictionConflict(type.name, shift, targetDate);

                    if (isConflict) {
                        const message = `${type.description || type.name}.`;

                        switch (type.severity) {
                            case 'CRITICAL':
                            case 'URGENT':
                            case 'HIGH':
                                errors.push(`Restricción Médica: ${message}`);
                                break;
                            case 'MEDIUM':
                            case 'LOW':
                                warnings.push(`Limitación de Perfil: ${message}`);
                                break;
                            case 'INFO':
                                // Solo log silencioso en backend
                                break;
                            default:
                                errors.push(`Restricción médica activa: ${message}`);
                        }
                    }
                }
            }

            // ==========================================================================
            // 4. VALIDACIÓN: DEPARTAMENTO CORRECTO Y CROSS-DEPARTMENTAL
            // ==========================================================================
            const shiftDepartmentId = shift.departmentId;
            const nurseDepartmentId = nurse.departmentId;
            // Usar el nombre del departamento si está disponible, si no, usar el ID
            const nurseDepartmentName = departmentsMap?.get(nurseDepartmentId) || nurse.name || nurseDepartmentId;

            if (shiftDepartmentId && nurseDepartmentId && shiftDepartmentId !== nurseDepartmentId) {
                const canFloat = nurse.isCrossDepartmental === true;

                if (!canFloat) {
                    errors.push(
                        `La enfermera pertenece al departamento "${nurseDepartmentName}". ` +
                        `Las asignaciones interdepartamentales están deshabilitadas para este perfil.`
                    );
                } else {
                    warnings.push(
                        `Asignación interdepartamental: La enfermera pertenece a "${nurseDepartmentName}" ` +
                        `pero tiene permisos para cubrir este turno.`
                    );
                }
            }

            // ==========================================================================
            // 5. VALIDACIÓN: SOLAPAMIENTO HORARIO (No estar en dos lugares a la vez)
            // ==========================================================================
            // NOTA: Para validación completa necesitaríamos las asignaciones existentes de la enfermera
            // Esto se hace mejor en el backend, pero podemos hacer una validación básica aquí
            // si tenemos acceso a las entradas existentes de la enfermera

            // ==========================================================================
            // 6. VALIDACIÓN: TURNO DE EMERGENCIA (solo para enfermeras con restricción NO_ER)
            // ==========================================================================
            if (nurse.nurseRestrictions?.some(r => r.restrictionType?.name === 'NO_ER')) {
                if (shiftDepartmentId) {
                    // En un caso real, verificaríamos si el departamento es de emergencias
                    // Por ahora solo advertimos si el nombre del turno sugiere emergencia
                    if (shift.name.toUpperCase().includes("EMERGENCY") || shift.name.toUpperCase().includes("ER")) {
                        errors.push("La enfermera tiene restricción para no trabajar en Emergencias.");
                    }
                }
            }

            // Si hay errores críticos, no se puede asignar
            const canAssign = errors.length === 0;

            return { canAssign, errors, warnings };
        };
    }, [nurses, shifts, currentEntry, departmentsMap]);

    return { validateAssignment };
}

/**
 * Evalúa si una restricción específica entra en conflicto con el turno propuesto.
 * Replica la lógica del backend evaluateRestrictionConflict.
 */
function evaluateRestrictionConflict(
    restrictionName: string,
    targetShift: ShiftWithTemplate,
    targetDate: Date
): boolean {

    switch (restrictionName) {
        // --- RESTRICCIONES DE HORARIO ---
        case 'NO_NIGHT_SHIFTS':
            return targetShift.name === 'NIGHT' || targetShift.name === 'NIGTH_AFTERNOON' || targetShift.name === 'MORNING_NIGHT';

        case 'ONLY_NIGHT_SHIFTS':
            return targetShift.name !== 'NIGHT' && targetShift.name !== 'NIGTH_AFTERNOON' && targetShift.name !== 'MORNING_NIGHT';

        case 'ONLY_DAY_SHIFTS':
        case 'ONLY_MORNING_SHIFTS':
            return targetShift.name !== 'MORNING' && targetShift.name !== 'MORNING_AFTERNOON';

        // --- RESTRICCIONES DE DÍAS Y CALENDARIO ---
        case 'NO_WEEKENDS':
            const dayOfWeek = targetDate.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado

        case 'WEEKENDS_ONLY':
            const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
            return !isWeekend;

        // --- RESTRICCIÓN DE CARGA Y DURACIÓN ---
        case 'PART_TIME_ONLY':
        case 'MAX_8_HOURS_DAY':
            // Calcular duración del turno
            const duration = calculateShiftDuration(targetShift.startTime, targetShift.endTime);
            return duration > 8;

        // --- RESTRICCIÓN: MÁXIMO 40 HORAS SEMANALES ---
        // NOTA: Esta validación completa requiere historial semanal, se hace mejor en backend
        case 'MAX_40_HOURS_WEEK':
            // En frontend no tenemos el historial completo, delegamos al backend
            return false;

        // --- RESTRICCIÓN: DESCANSO MÍNIMO 12 HORAS ---
        // NOTA: Requiere historial de turnos, se valida en backend
        case 'NO_OVERTIME':
            return false;

        // --- RESTRICCIONES MÉDICAS GLOBALES ---
        case 'PREGNANCY_RESTRICTION':
        case 'MEDICAL_RESTRICTION':
        case 'INFECTIOUS_AREA_RESTRICTION':
        case 'NO_ER':
            // Estas suelen ser absolutas si están activas
            return true;

        case 'NO_DOUBLE_SHIFTS':
            // Requiere verificar si ya tiene turno ese día - se hace en backend
            return false;

        default:
            // Por seguridad, si hay una restricción nueva no programada, asumimos conflicto
            console.warn(`[Validation] Restricción no manejada en frontend: ${restrictionName}`);
            return true;
    }
}

/**
 * Calcula la duración de un turno en horas.
 */
function calculateShiftDuration(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 8;

    const [sh, sm] = startTime.split("T")[1]?.split(":").map(Number) || startTime.split(":").map(Number);
    const [eh, em] = endTime.split("T")[1]?.split(":").map(Number) || endTime.split(":").map(Number);

    if (!sh || !eh) return 8;

    let startMin = sh * 60 + (sm || 0);
    let endMin = eh * 60 + (em || 0);

    if (endMin <= startMin) endMin += 24 * 60; // Cruza medianoche

    return Math.round((endMin - startMin) / 60);
}

/**
 * Hook simplificado para validaciones rápidas sin datos completos de enfermera.
 * Útil para validación en tiempo real mientras el usuario llena el formulario.
 */
export function useQuickScheduleEntryValidation(nurses: NurseWithProfile[], shifts: ShiftWithTemplate[], departmentsMap?: Map<string, string>) {
    const checkCrossDepartment = useMemo(() => {
        return (nurseId: string, shiftId: string): { allowed: boolean; warning?: string } => {
            const nurse = nurses.find(n => n.id === nurseId);
            const shift = shifts.find(s => s.id === shiftId);

            if (!nurse || !shift || !shift.departmentId) {
                return { allowed: true };
            }

            if (shift.departmentId !== nurse.departmentId) {
                const nurseDepartmentName = nurse.name || (departmentsMap?.get(nurse.departmentId) || nurse.departmentId);
                if (nurse.isCrossDepartmental) {
                    return {
                        allowed: true,
                        warning: `Asignación interdepartamental: La enfermera pertenece a "${nurseDepartmentName}" pero tiene permisos para cubrir este turno.`
                    };
                } else {
                    return {
                        allowed: false,
                        warning: `La enfermera pertenece al departamento "${nurseDepartmentName}". Las asignaciones interdepartamentales están deshabilitadas.`
                    };
                }
            }

            return { allowed: true };
        };
    }, [nurses, shifts, departmentsMap]);

    const checkVacationLeave = useMemo(() => {
        return (nurseId: string, date: string): { available: boolean; reason?: string } => {
            const nurse = nurses.find(n => n.id === nurseId);
            if (!nurse) return { available: true };

            const targetDate = new Date(date);

            // Verificar vacaciones
            if (nurse.absences) {
                const onVacation = nurse.absences.some(v =>
                    v.type === "VACATION" && v.status === "APPROVED" &&
                    targetDate >= new Date(v.date) && targetDate <= new Date(v.endDate)
                );
                if (onVacation) return { available: false, reason: "La enfermera está en vacaciones aprobadas." };
            }

            // Verificar licencias
            if (nurse.leaves) {
                const onLeave = nurse.leaves.some(l =>
                    l.status === "APPROVED" &&
                    targetDate >= new Date(l.startDate) && targetDate <= new Date(l.endDate)
                );
                if (onLeave) return { available: false, reason: "La enfermera tiene licencia médica aprobada." };
            }

            return { available: true };
        };
    }, [nurses]);

    return { checkCrossDepartment, checkVacationLeave };
}