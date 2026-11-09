"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
    ShiftChangeRequest,
    ShiftChangeFormData,
    ShiftChangeOperationType,
    OPERATION_TYPE_LABELS,
} from "../types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    AlertCircle,
    User,
    Clock,
    RefreshCw,
    Activity,
    Building,
    Users,
    Shield,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useSearchableNurses } from "../hooks/useSearchableNurses";
import { useSearchableScheduleEntries } from "../hooks/useSearchableScheduleEntries";
import { SearchableNurse } from "../hooks/useSearchableNurses";
import { SearchableScheduleEntry } from "../hooks/useSearchableScheduleEntries";
import { shiftChangeService } from "../services/shiftChangeService";
import { useAuthStore } from "@/stores/auth.store";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ShiftChangeFormData) => Promise<void>;
    shift?: ShiftChangeRequest | null;
    isSubmitting: boolean;
    userRole?: string | null;
    currentUserId?: string | null;
}

const EMPTY = "";

const OPERATION_OPTIONS: {
    value: ShiftChangeOperationType;
    label: string;
    icon: any;
    description: string;
}[] = [
    {
        value: "SWAP",
        label: "Intercambio de turno",
        icon: RefreshCw,
        description: "Intercambie su turno con el de otra enfermera",
    },
    {
        value: "TRANSFER",
        label: "Cesión de turno",
        icon: Users,
        description: "Ceda su turno a otra enfermera",
    },
    {
        value: "COVERAGE",
        label: "Solicitud de cobertura",
        icon: Activity,
        description: "Publique una solicitud para encontrar cobertura",
    },
];

const PRIVILEGED_ROLES = ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR"];

export default function ShiftChangeCreateModal({
    isOpen,
    onClose,
    onSubmit,
    shift,
    isSubmitting,
    userRole,
    currentUserId,
}: Props) {
    const { user } = useAuthStore();
    const isPrivileged = PRIVILEGED_ROLES.includes(userRole || "");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        clearErrors,
    } = useForm<any>({
        defaultValues: {
            requesterId: "",
            sourceScheduleEntryId: "",
            targetScheduleEntryId: "",
            operationType: "SWAP",
            reason: "",
            emergencyRequest: false,
        },
    });

    const operationType = watch("operationType") as ShiftChangeOperationType;
    const requesterId = watch("requesterId");
    const sourceScheduleEntryId = watch("sourceScheduleEntryId");
    const targetScheduleEntryId = watch("targetScheduleEntryId");
    const emergencyRequest = watch("emergencyRequest");

    const [formError, setFormError] = useState<string | null>(null);
    const [selectedOperation, setSelectedOperation] = useState<ShiftChangeOperationType>("SWAP");

    const { items: nursesItems, load: loadNurses, isLoading: nursesLoading, error: nursesError } =
        useSearchableNurses();
    const {
        items: scheduleItems,
        load: loadScheduleEntries,
        isLoading: shiftsLoading,
        error: shiftsError,
    } = useSearchableScheduleEntries();

    // Filtrar enfermeras según el rol del usuario autenticado
    const filteredNurses = useCallback(() => {
        if (userRole === "NURSE" && currentUserId) {
            return nursesItems.filter((n) => n.id === currentUserId);
        }
        return nursesItems;
    }, [nursesItems, userRole, currentUserId]);

    const availableNurses = filteredNurses();

    // Para NURSE, el solicitante se fuerza al propio usuario
    const forcedRequesterId =
        userRole === "NURSE" && currentUserId ? currentUserId : "";

    // Cuando cambia el solicitante, recargar sus asignaciones de turno
    useEffect(() => {
        if (!isOpen) return;
        setSelectedOperation("SWAP");
        setValue("operationType", "SWAP");
        setValue("sourceScheduleEntryId", "");
        setValue("targetScheduleEntryId", "");
        if (userRole === "NURSE" && currentUserId) {
            setValue("requesterId", currentUserId);
        } else {
            setValue("requesterId", "");
        }
        clearErrors(["sourceScheduleEntryId", "targetScheduleEntryId", "requesterId"]);
        setFormError(null);
    }, [isOpen, setValue, clearErrors, setFormError, userRole, currentUserId]);

    // Recargar asignaciones de turno cuando cambie el solicitante
    useEffect(() => {
        if (!isOpen || !requesterId) {
            // Si no hay requester, cargar todas las asignaciones (filtradas por org en el backend)
            loadScheduleEntries("", undefined, 1, 20);
            return;
        }
        // Cargar solo las asignaciones del solicitante seleccionado para el ORIGEN
        loadScheduleEntries("", { nurseId: requesterId }, 1, 20);
    }, [requesterId, isOpen, loadScheduleEntries]);

    useEffect(() => {
        if (!isOpen) return;
        if (requesterId && sourceScheduleEntryId) {
            setValue("targetScheduleEntryId", "");
            clearErrors(["targetScheduleEntryId"]);
        }
    }, [isOpen, requesterId, sourceScheduleEntryId, setValue, clearErrors, setFormError]);

    // Las asignaciones de origen son las del solicitante (filtradas por nurseId en el hook)
    const availableSourceEntries = scheduleItems;

    // Para el destino: excluir las asignaciones del propio solicitante (no puede intercambiarse consigo mismo)
    const availableTargetEntries = useMemo(() => {
        return scheduleItems.filter(
            (entry) => entry.assignedNurse?.id !== requesterId,
        );
    }, [scheduleItems, requesterId]);

    // Clave dinámica para forzar remount del select de origen cuando cambie el solicitante
    const sourceSelectKey = `source-${requesterId || "all"}`;

    // Clave dinámica para forzar remount del select de destino cuando cambie el solicitante
    const targetSelectKey = `target-${requesterId || "all"}`;

    const handleValidatedSubmit = async (data: any) => {
        // Para NURSE, forzar el solicitante al propio usuario
        const finalRequesterId =
            userRole === "NURSE" && currentUserId
                ? currentUserId
                : data.requesterId;

        if (!finalRequesterId) {
            setFormError("Debe seleccionar la solicitante.");
            setError("requesterId", { message: "Requerido" });
            return;
        }
        if (!data.sourceScheduleEntryId) {
            setFormError("Debe seleccionar la asignación de turno de origen.");
            setError("sourceScheduleEntryId", { message: "Requerido" });
            return;
        }

        if (data.operationType === "SWAP" && !data.targetScheduleEntryId) {
            setFormError(
                "Debe seleccionar la asignación de turno de destino para un intercambio.",
            );
            setError("targetScheduleEntryId", { message: "Requerido" });
            return;
        }

        clearErrors([
            "requesterId",
            "sourceScheduleEntryId",
            "targetScheduleEntryId",
        ]);
        setFormError(null);

        const payload: ShiftChangeFormData = {
            requesterId: finalRequesterId,
            sourceScheduleEntryId: data.sourceScheduleEntryId,
            targetScheduleEntryId: data.targetScheduleEntryId || undefined,
            operationType: data.operationType,
            reason: data.reason || undefined,
            emergencyRequest: !!data.emergencyRequest,
        };

        await onSubmit(payload);
    };

    const formatTime = (time?: string | null): string => {
        if (!time) return "—";
        if (time.includes("T")) {
            const t = time.split("T")[1];
            return t ? t.slice(0, 5) : "—";
        }
        return time.slice(0, 5);
    };

    const isCoverage = operationType === "COVERAGE";
    const isTransfer = operationType === "TRANSFER";
    const isSwap = operationType === "SWAP";

    const canSelectRequester = isPrivileged;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>
                        {shift ? "Editar Solicitud" : "Nueva Solicitud de Cambio"}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Seleccione el tipo de operación y las asignaciones involucradas.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleValidatedSubmit)} className="space-y-5 pt-2">
                    {formError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {formError}
                        </div>
                    )}

                    {/* TIPO DE OPERACIÓN */}
                    <div className="space-y-2">
                        <Label className="font-semibold">
                            Tipo de Operación <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {OPERATION_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedOperation(opt.value);
                                        setValue("operationType", opt.value);
                                    }}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                                        selectedOperation === opt.value
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600"
                                    }`}
                                >
                                    <opt.icon className={`h-5 w-5 mb-1 ${
                                        selectedOperation === opt.value
                                            ? "text-primary"
                                            : "text-slate-400"
                                    }`} />
                                    <span className="text-xs font-medium">{opt.label}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {opt.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SOLICITANTE */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                Solicitante <span className="text-red-500">*</span>
                            </Label>
                            {canSelectRequester && (
                                <Shield className="h-4 w-4 text-amber-500" />
                            )}
                        </div>
                        {!canSelectRequester && userRole === "NURSE" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-blue-50/50 dark:bg-blue-950/10 text-sm text-blue-700 dark:text-blue-300">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                    Verá únicamente su propio perfil como solicitante.
                                </span>
                            </div>
                        )}
                        <SearchableSelect
                            key={`nurse-select-${currentUserId || "all"}`}
                            inputId="shift-change-requester"
                            name="requesterId"
                            label=""
                            value={requesterId || EMPTY}
                            onValueChange={(v) => {
                                if (v !== null) {
                                    setValue("requesterId", v ?? "");
                                    clearErrors("requesterId");
                                    setFormError(null);
                                }
                            }}
                            loader={loadNurses}
                            filters={{
                                ...(userRole === "NURSE" && currentUserId
                                    ? { nurseId: currentUserId }
                                    : {}),
                            }}
                            placeholder={
                                userRole === "NURSE"
                                    ? "Buscar su perfil (nombre, cédula, departamento, sede)..."
                                    : "Buscar enfermera (nombre, cédula, departamento, sede)..."
                            }
                            required
                            disabled={!canSelectRequester && userRole === "NURSE"}
                            error={formError || undefined}
                            labelRenderer={(opt) => {
                                if (!opt) return "Seleccionar solicitante";
                                const o = opt as unknown as { value: string; label: string };
                                const n = availableNurses.find((x) => x.id === o.value);
                                return n ? (
                                    <div className="grid grid-flow-col gap-2 items-baseline">
                                        <div className="text-sm font-medium text-foreground">
                                            {n.firstName} {n.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {n.department?.name || ""}
                                            {n.branch?.name ? ` • ${n.branch.name}` : ""}
                                            {n.status ? ` • ${n.status}` : ""}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm">{o.label}</div>
                                );
                            }}
                            optionRenderer={(opt) => {
                                const o = opt as unknown as { value: string; label: string };
                                const n = availableNurses.find((x) => x.id === o.value);
                                if (!n) return <div className="text-sm">{o.label}</div>;
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground">
                                                {n.firstName} {n.lastName}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {n.department?.name || "Sin departamento"}
                                                • {n.branch?.name || "Sin sede"}
                                                {n.status ? ` • ${n.status}` : ""}
                                            </div>
                                            {n.email && (
                                                <div className="text-[10px] text-muted-foreground">
                                                    {n.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        {nursesError && (
                            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                                {nursesError}
                            </p>
                        )}
                    </div>

                    {/* ASIGNACIÓN DE TURNO DE ORIGEN */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label className="font-semibold">
                                Asignación de Turno de Origen{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                                Seleccione la asignación que desea cambiar.
                            </p>
                        </div>
                        <SearchableSelect
                            key={sourceSelectKey}
                            inputId="shift-change-source-entry"
                            name="sourceScheduleEntryId"
                            label=""
                            value={sourceScheduleEntryId || EMPTY}
                            onValueChange={(v) => {
                                if (v !== null) {
                                    setValue("sourceScheduleEntryId", v ?? "");
                                    clearErrors("sourceScheduleEntryId");
                                    setFormError(null);
                                }
                            }}
                            loader={loadScheduleEntries}
                            filters={{ nurseId: requesterId || undefined }}
                            placeholder={
                                !requesterId
                                    ? "Seleccione primero una solicitante..."
                                    : "Buscar turno (nombre, fecha, horario, departamento, sede, enfermera asignada)..."
                            }
                            required
                            disabled={!requesterId}
                            error={formError || undefined}
                            labelRenderer={(opt) => {
                                if (!opt) return "Seleccionar asignación de turno";
                                const o = opt as unknown as { value: string; label: string };
                                const s = availableSourceEntries.find(
                                    (x) => x.id === o.value,
                                );
                                return s ? (
                                    <div className="grid grid-flow-col gap-2 items-baseline">
                                        <div className="text-sm font-medium text-foreground">
                                            {s.shiftName}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {s.date ? new Date(s.date).toLocaleDateString("es-ES") : "—"}
                                            • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                            {s.department?.name ? ` • ${s.department.name}` : ""}
                                            {s.branch?.name ? ` • ${s.branch.name}` : ""}
                                            {s.assignedNurse ? ` • ${s.assignedNurse.firstName} ${s.assignedNurse.lastName}` : " • Sin asignar"}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm">{o.label}</div>
                                );
                            }}
                            optionRenderer={(opt) => {
                                const o = opt as unknown as { value: string; label: string };
                                const s = availableSourceEntries.find(
                                    (x) => x.id === o.value,
                                );
                                if (!s) return <div className="text-sm">{o.label}</div>;
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground">
                                                {s.shiftName}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {s.date
                                                    ? new Date(s.date).toLocaleDateString("es-ES")
                                                    : "—"}
                                                • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                {s.department?.name ? ` • ${s.department.name}` : ""}
                                                {s.branch?.name ? ` • ${s.branch.name}` : ""}
                                                {s.assignedNurse
                                                    ? ` • ${s.assignedNurse.firstName} ${s.assignedNurse.lastName}`
                                                    : " • Sin asignar"}
                                            </div>
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                    s.status === "ASSIGNED"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                                                        : s.status === "OPEN"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                                                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900"
                                                }`}
                                            >
                                                {s.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        {shiftsError && (
                            <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                                {shiftsError}
                            </p>
                        )}
                    </div>

                    {/* ASIGNACIÓN DE TURNO DE DESTINO (solo SWAP y TRANSFER) */}
                    {!isCoverage && (
                        <div className="space-y-2">
                            <Label className="font-semibold">
                                Asignación de Turno de Destino
                                {isSwap && <span className="text-red-500">*</span>}
                                {!isSwap && " (opcional)"}
                            </Label>
                            {isSwap && (
                                <p className="text-[10px] text-muted-foreground">
                                    Seleccione la asignación que desea recibir a cambio.
                                </p>
                            )}
                            <SearchableSelect
                                key={targetSelectKey}
                                inputId="shift-change-target-entry"
                                name="targetScheduleEntryId"
                                label=""
                                value={targetScheduleEntryId || EMPTY}
                                onValueChange={(v) => {
                                    if (v !== null)
                                        setValue("targetScheduleEntryId", v ?? "");
                                }}
                                loader={loadScheduleEntries}
                                filters={{}}
                                placeholder={
                                    !requesterId
                                        ? "Seleccione primero una solicitante..."
                                        : "Buscar turno disponible (nombre, fecha, horario, departamento, sede)..."
                                }
                                disabled={!sourceScheduleEntryId || !requesterId}
                                labelRenderer={(opt) => {
                                    if (!opt) return "Seleccionar asignación de destino";
                                    const o = opt as unknown as { value: string; label: string };
                                    const s = availableTargetEntries.find(
                                        (x) => x.id === o.value,
                                    );
                                    return s ? (
                                        <div className="grid grid-flow-col gap-2 items-baseline">
                                            <div className="text-sm font-medium text-foreground">
                                                {s.shiftName}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {s.date
                                                    ? new Date(s.date).toLocaleDateString("es-ES")
                                                    : "—"}
                                                • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                {s.department?.name ? ` • ${s.department.name}` : ""}
                                                {s.branch?.name ? ` • ${s.branch.name}` : ""}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm">{o.label}</div>
                                    );
                                }}
                                optionRenderer={(opt) => {
                                    const o = opt as unknown as { value: string; label: string };
                                    const s = availableTargetEntries.find(
                                        (x) => x.id === o.value,
                                    );
                                    if (!s) return <div className="text-sm">{o.label}</div>;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-foreground">
                                                    {s.shiftName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {s.date
                                                        ? new Date(s.date).toLocaleDateString("es-ES")
                                                        : "—"}
                                                    • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                    {s.department?.name ? ` • ${s.department.name}` : ""}
                                                    {s.branch?.name ? ` • ${s.branch.name}` : ""}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    )}

                    {/* JUSTIFICACIÓN */}
                    <div className="space-y-1">
                        <Label>Justificación {isCoverage ? "" : "(opcional)"}</Label>
                        <Textarea
                            id="reason"
                            placeholder={
                                isCoverage
                                    ? "Explique por qué necesita cobertura para este turno..."
                                    : "Describe el motivo del cambio..."
                            }
                            {...register("reason")}
                        />
                    </div>

                    {/* EMERGENCIA */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-950">
                        <div className="flex flex-col">
                            <Label className="text-xs font-bold">
                                Solicitud de Emergencia
                            </Label>
                            <span className="text-[10px] text-muted-foreground">
                                Marca como cambio de urgencia
                            </span>
                        </div>
                        <Switch
                            checked={!!emergencyRequest}
                            onCheckedChange={(c) =>
                                setValue("emergencyRequest", c)
                            }
                        />
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !canSubmit()}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? "Creando..." : shift ? "Actualizar Solicitud" : "Crear Solicitud"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );

    function canSubmit(): boolean {
        const finalRequesterId =
            userRole === "NURSE" && currentUserId
                ? currentUserId
                : requesterId;
        if (!finalRequesterId || !sourceScheduleEntryId) return false;
        if (isSwap && !targetScheduleEntryId) return false;
        return true;
    }
}
