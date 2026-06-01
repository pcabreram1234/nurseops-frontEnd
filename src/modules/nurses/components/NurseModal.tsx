import React, { useEffect, useState, useRef } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { Nurse, NurseFormInputs, ContracTypeList, NurseStatusType, EducationLevelTypes } from "../types";
import { NurseRestrictionTypes, RestrictionLabels } from "@/modules/nurses/enums";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    nurse?: Nurse | null;
    isSubmitting: boolean;
    users: { id: string; firstName: string; lastName: string }[];
    departments: { id: string; name: string }[];
    specialities: { id: string; name: string }[];
    organizations: { id: string; name: string }[];
    restrictionTypes?: { id: string; code: string; name: string }[];
}

export const NurseModal: React.FC<Props> = ({
    isOpen, onClose, onSubmit, nurse, isSubmitting, users, departments, specialities, organizations, restrictionTypes = []
}) => {
    const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm<NurseFormInputs>();

    // Estados para el Buscador del Usuario Vinculado
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Observamos el valor actual del userId en React Hook Form
    const selectedUserId = watch("userId");

    const { fields, append, remove } = useFieldArray({
        control,
        name: "restrictions"
    });

    // Cerrar el buscador si el usuario hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (nurse) {
                const profile = nurse.nurseProfiles?.[0];

                const existingRestrictions = nurse.nurseRestrictions || [];
                const formattedRestrictions = existingRestrictions.map(r => ({
                    id: r.id,
                    restrictionTypeId: r.restrictionTypeId || "",
                    startDate: r.startDate ? new Date(r.startDate).toISOString().split("T")[0] : "",
                    endDate: r.endDate ? new Date(r.endDate).toISOString().split("T")[0] : "",
                    isTemporary: r.isTemporary || false,
                    isActive: r.isActive ?? true,
                    notes: r.notes || ""
                }));

                const hireDateFmt = nurse.hire_date ? new Date(nurse.hire_date).toISOString().split("T")[0] : "";
                const birthDateFmt = profile?.birthDate ? new Date(profile.birthDate).toISOString().split("T")[0] : "";

                reset({
                    userId: nurse.userId,
                    departmentId: nurse.departmentId,
                    specialityId: nurse.speciality?.id || "",
                    organizationId: nurse.organizationId,
                    contract_type: nurse.contract_type,
                    status: nurse.status,
                    hire_date: hireDateFmt,
                    isCrossDepartmental: nurse.isCrossDepartmental,
                    birthDate: birthDateFmt,
                    emergencyContactName: profile?.emergencyContactName?.toString()?.toUpperCase() || "",
                    emergencyContactPhone: profile?.emergencyContactPhone || "",
                    educationLevel: profile?.educationLevel || "",
                    yearsOfExperience: profile?.yearsOfExperience || 0,
                    notes: profile?.notes?.toUpperCase() || "",
                    restrictions: formattedRestrictions,
                });
            } else {
                reset({
                    userId: "", departmentId: "", specialityId: "", organizationId: "",
                    contract_type: ContracTypeList.PERMANENT, status: NurseStatusType.ACTIVE,
                    hire_date: "", isCrossDepartmental: false,
                    birthDate: "", emergencyContactName: "", emergencyContactPhone: "",
                    educationLevel: EducationLevelTypes.BACHELOR_DEGREE, yearsOfExperience: 0,
                    notes: "",
                    restrictions: [],
                });
                setSearchTerm("");
            }
        }
    }, [nurse, reset, isOpen]);

    useEffect(() => {
        if (isOpen && nurse?.userId && users && users.length > 0) {
            setValue("userId", nurse.userId);
        }
    }, [users, nurse, isOpen, setValue]);

    // Filtrado inteligente de usuarios en tiempo real
    const filteredUsers = users.filter(u => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        // Limpiamos acentos para búsquedas más flexibles
        const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedFullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedFullName.includes(normalizedSearch);
    });

    // Encontrar el objeto del usuario seleccionado para pintar su nombre en el input principal
    const currentSelectedUser = users.find(u => u.id === selectedUserId);

    // Manejador local del submit para inyectar los strings requeridos por el backend
    const handleLocalSubmit = (data: any) => {
        const matchedUser = users.find(u => u.id === data.userId);
        const enrichedPayload = {
            ...data,
            firstName: matchedUser ? matchedUser.firstName : "",
            lastName: matchedUser ? matchedUser.lastName : "",
            email: matchedUser ? (matchedUser as any).email || "" : ""
        };
        onSubmit(enrichedPayload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[95vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                    {nurse ? "🩺 Editar Ficha de Enfermería" : "🩺 Nueva Ficha de Enfermería"}
                </h2>

                <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-6">
                    {/* SECCIÓN 1: DATOS OPERATIVOS */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-3">1. Asignación Laboral</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* INPUT AUTOCOMPLETABLE / SEARCHABLE DROPDOWN */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-gray-700">Usuario Vinculado</label>
                                
                                {/* Registro oculto para que react-hook-form valide el ID */}
                                <input type="hidden" {...register("userId", { required: "Seleccione un usuario" })} />
                                
                                <div 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`mt-1 flex items-center justify-between w-full rounded-lg border p-2 text-sm shadow-sm cursor-pointer bg-white transition-all ${
                                        errors.userId ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    <span className={currentSelectedUser ? "text-gray-900 font-medium" : "text-gray-400"}>
                                        {currentSelectedUser ? `${currentSelectedUser.firstName} ${currentSelectedUser.lastName}` : "Buscar usuario..."}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                                        <div className="p-2 border-b bg-gray-50 rounded-t-lg">
                                            <input
                                                type="text"
                                                autoFocus
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Escribe el nombre o apellido..."
                                                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <ul className="max-h-56 overflow-y-auto p-1 text-sm text-gray-700">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((u) => (
                                                    <li
                                                        key={u.id}
                                                        onClick={() => {
                                                            setValue("userId", u.id, { shouldValidate: true });
                                                            setIsDropdownOpen(false);
                                                            setSearchTerm("");
                                                        }}
                                                        className={`cursor-pointer rounded-md p-2 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                                                            selectedUserId === u.id ? "bg-blue-100 font-semibold text-blue-800" : ""
                                                        }`}
                                                    >
                                                        {u.firstName} {u.lastName}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-3 text-center text-xs text-gray-500 italic">No se encontraron usuarios</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                {errors.userId && <span className="text-xs text-red-500 block mt-1">{errors.userId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Departamento Principal</label>
                                <select {...register("departmentId", { required: "Requerido" })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm">
                                    <option value="">Seleccione...</option>
                                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {errors.departmentId && <span className="text-xs text-red-500">{errors.departmentId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Especialidad (Opcional)</label>
                                <select {...register("specialityId")} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm">
                                    <option value="" key={""}>Ninguna</option>
                                    {specialities.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Organización</label>
                                <select {...register("organizationId", { required: "Requerido" })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm">
                                    <option value="">Seleccione...</option>
                                    {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Contrato</label>
                                <select {...register("contract_type")} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm">
                                    {Object.values(ContracTypeList).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                                <input type="date" {...register("hire_date", { required: "Requerido" })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: PERFIL PROFESIONAL Y DEMOGRÁFICO */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-3">2. Perfil Profesional y Demográfico</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nivel de Educación</label>
                                <select {...register("educationLevel")} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm">
                                    {Object.values(EducationLevelTypes).map(v => <option key={v} value={v}>{v.replace("_", " ")}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Años de Experiencia</label>
                                <input type="number" {...register("yearsOfExperience", { valueAsNumber: true })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                                <input type="date" {...register("birthDate", { required: "Requerido" })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia (Opcional)</label>
                                <input
                                    type="text"
                                    {...register("emergencyContactName", {
                                        required: false,
                                        onChange: (e) => { if (e.target.value) e.target.value = e.target.value.toUpperCase(); }
                                    })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm uppercase"
                                    placeholder="NOMBRE COMPLETO..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono de Emergencia (Opcional)</label>
                                <input type="text" {...register("emergencyContactPhone", { required: false })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm" placeholder="+1..." />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Notas Generales / Observaciones del Perfil</label>
                                <textarea
                                    {...register("notes", {
                                        onChange: (e) => { if (e.target.value) e.target.value = e.target.value.toUpperCase(); }
                                    })}
                                    rows={2}
                                    className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm uppercase resize-none"
                                    placeholder="DETALLES IMPORTANTES..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: ARREGLO DINÁMICO DE RESTRICCIONES */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-amber-700 flex items-center gap-2">
                                ⚠️ 3. Restricciones de Salud (Múltiples)
                            </h3>
                            <button
                                type="button"
                                onClick={() => append({ id: "", restrictionTypeId: "", startDate: "", endDate: "", isTemporary: false, isActive: true, notes: "" })}
                                className="bg-amber-100 text-amber-800 px-3 py-1 text-sm rounded-lg font-medium hover:bg-amber-200 transition-colors"
                            >
                                + Añadir Restricción
                            </button>
                        </div>

                        {fields.length === 0 && (
                            <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-lg text-center">
                                Esta enfermera no cuenta con restricciones médicas asignadas.
                            </div>
                        )}

                        {fields.map((field, index) => {
                            const isTemporary = watch(`restrictions.${index}.isTemporary`);

                            return (
                                <div key={field.id} className="relative bg-amber-50/50 p-5 rounded-xl border border-amber-200/70 mb-4 pr-12">
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md"
                                        title="Eliminar restricción"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo de Restricción Operativa</label>
                                            <select
                                                {...register(`restrictions.${index}.restrictionTypeId`, { required: "Requerido" })}
                                                className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm bg-white"
                                            >
                                                <option value="">Seleccione...</option>
                                                {restrictionTypes.length > 0 ? (
                                                    restrictionTypes.map((t) => (
                                                        <option key={t.id} value={t.id}>{RestrictionLabels[t.name as NurseRestrictionTypes] || t.code}</option>
                                                    ))
                                                ) : (
                                                    Object.values(NurseRestrictionTypes).map((enumValue) => (
                                                        <option key={enumValue} value={enumValue}>{RestrictionLabels[enumValue]}</option>
                                                    ))
                                                )}
                                            </select>
                                            {errors.restrictions?.[index]?.restrictionTypeId && <span className="text-xs text-red-500">{(errors.restrictions[index] as any).restrictionTypeId.message}</span>}
                                        </div>

                                        <div className="flex flex-col justify-end pb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`temp-${field.id}`}
                                                    {...register(`restrictions.${index}.isTemporary`)}
                                                    className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                                />
                                                <label htmlFor={`temp-${field.id}`} className="ml-2 text-sm text-gray-800 font-medium">¿Es Temporal?</label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-end pb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`active-${field.id}`}
                                                    {...register(`restrictions.${index}.isActive`)}
                                                    className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                                />
                                                <label htmlFor={`active-${field.id}`} className="ml-2 text-sm text-gray-800 font-medium">Activa</label>
                                            </div>
                                        </div>

                                        {isTemporary && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                                    <input
                                                        type="date"
                                                        {...register(`restrictions.${index}.startDate`, { required: isTemporary ? "Requerido" : false })}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Fecha de Finalización</label>
                                                    <input
                                                        type="date"
                                                        {...register(`restrictions.${index}.endDate`, { required: isTemporary ? "Requerido" : false })}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm bg-white"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className={isTemporary ? "md:col-span-1" : "md:col-span-3"}>
                                            <label className="block text-sm font-medium text-gray-700">Detalles Clínicos / Observaciones</label>
                                            <input
                                                type="text"
                                                {...register(`restrictions.${index}.notes`)}
                                                className="mt-1 block w-full rounded-lg border-gray-300 p-2 border shadow-sm bg-white"
                                                placeholder="Especificaciones de la restricción..."
                                                onChange={(e) => { if (e.target.value) e.target.value = e.target.value.toUpperCase(); }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* SECCIÓN 4: CONFIGURACIONES EXTRA */}
                    <div className="flex space-x-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <input type="checkbox" id="isCrossDepartmental" {...register("isCrossDepartmental")} className="h-4 w-4 text-blue-600 rounded" />
                            <label htmlFor="isCrossDepartmental" className="ml-2 text-sm text-gray-800">Permitir Soporte Cruzado (Cross-Department)</label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-800 font-medium">Estado General:</label>
                            <select {...register("status")} className="rounded-md border-gray-300 p-1 text-sm border shadow-sm">
                                {Object.values(NurseStatusType).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50">
                            {isSubmitting ? "Guardando..." : "Guardar Ficha"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};