import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Speciality, SpecialityFormData } from "@/modules/specialities/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<SpecialityFormData>;
    speciality?: Speciality | null;
    isSubmitting: boolean;
    organizations: { id: string; name: string }[];
    departments: { id: string; name: string }[];
}

export const SpecialityModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSubmit,
    speciality,
    isSubmitting,
    organizations,
    departments,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SpecialityFormData>({
        defaultValues: {
            name: "",
            code: "",
            description: "",
            organizationId: "",
            isActive: true,
            departmentIds: [] as string[], // 🌟 Corrección: Forzar tipo string[] para evitar problemas de inferencia (never[])
        },
    });

    useEffect(() => {
        if (isOpen) { // 🌟 Optimización: Solo ejecutar el reset si el modal está abierto
            if (speciality) {
                const currentDeptIds = speciality.departmentSpecialities?.map(ds => ds.departmentId) || [];

                reset({
                    name: speciality.name,
                    code: speciality.code,
                    description: speciality.description,
                    organizationId: speciality.organizationId,
                    isActive: speciality.isActive,
                    departmentIds: currentDeptIds,
                });
            } else {
                reset({
                    name: "",
                    code: "",
                    description: "",
                    organizationId: "",
                    isActive: true,
                    departmentIds: [] as string[],
                });
            }
        }
    }, [speciality, reset, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {speciality ? "🎯 Editar Especialidad" : "🎯 Nueva Especialidad"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                {...register("name", { required: "El nombre es requerido" })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                {...register("code", { required: "El código es requerido" })}
                                className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            {...register("description")}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Organización</label>
                        <select
                            {...register("organizationId", { required: "Debe seleccionar una organización" })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Seleccione una organización</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                        {/* 🌟 Corrección: Se agregó el renderizado del mensaje de error para la organización */}
                        {errors.organizationId && <span className="text-xs text-red-500">{errors.organizationId.message}</span>}
                    </div>

                    {/* Asignación de Departamentos Relacionados */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departamentos que requieren esta Especialidad
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                            {departments.map((dept) => (
                                <label key={dept.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer user-select-none">
                                    <input
                                        type="checkbox"
                                        value={dept.id}
                                        {...register("departmentIds")}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{dept.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register("isActive")}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 font-medium cursor-pointer">
                            Especialidad Activa
                        </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};