"use client"

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  RestrictionTypeFormInput, NurseRestrictionType, 
  PRIORITY_LEVELS, RESTRICTION_TYPE_NAMES, RESTRICTION_DESCRIPTIONS 
} from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, id?: string) => Promise<void>;
  typeItem?: NurseRestrictionType | null;
}

export const RestrictionTypeFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, typeItem }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RestrictionTypeFormInput>();

  useEffect(() => {
    if (isOpen) {
      if (typeItem) {
        reset({ ...typeItem });
      } else {
        reset({
          code: "", name: "", description: "", severity: "LOW",
          affects_scheduler: false, affects_overtime: false, affects_nights: false,
          isSystem: false, isActive: true
        });
      }
    }
  }, [typeItem, isOpen, reset]);

  const handleFormSubmit = async (data: RestrictionTypeFormInput) => {
    await onSave(data, typeItem?.id);
    onClose();
  };

  if (!isOpen) return null;

  // Bloqueamos la edición de campos críticos si es de sistema
  const isSystemLocked = typeItem?.isSystem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {typeItem ? "🛠️ Editar Tipo de Restricción" : "🛠️ Nuevo Tipo de Restricción (Catálogo)"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* CÓDIGO */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Único</label>
              <input 
                type="text" 
                {...register("code", { required: "Requerido" })}
                disabled={isSystemLocked}
                placeholder="Ej. MAT-01"
                className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm uppercase disabled:bg-gray-100" 
              />
              {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
            </div>

            {/* SEVERIDAD */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Severidad</label>
              <select {...register("severity")} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm">
                {PRIORITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* NOMBRE DEL ENUM */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Identificador (Enum)</label>
              <select 
                {...register("name", { required: "Requerido" })} 
                disabled={isSystemLocked}
                className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm disabled:bg-gray-100"
              >
                <option value="">Seleccionar...</option>
                {RESTRICTION_TYPE_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>

            {/* DESCRIPCION DEL ENUM */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción (Enum)</label>
              <select 
                {...register("description", { required: "Requerido" })} 
                className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm"
              >
                <option value="">Seleccionar...</option>
                {RESTRICTION_DESCRIPTIONS.map(desc => <option key={desc} value={desc}>{desc}</option>)}
              </select>
              {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
            </div>
          </div>

          {/* REGLAS DEL SISTEMA (Booleanos) */}
          <div className="mt-4 p-4 bg-slate-50 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Configuración de Impacto Operativo</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" {...register("affects_scheduler")} className="rounded text-blue-600" />
                <span>Bloquea Agendamiento Automático</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" {...register("affects_overtime")} className="rounded text-blue-600" />
                <span>Inhabilita Horas Extra</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" {...register("affects_nights")} className="rounded text-blue-600" />
                <span>Inhabilita Turno Nocturno</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" {...register("isActive")} className="rounded text-emerald-600" />
                <span>Disponible en Sistema</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-slate-800 px-5 py-2 text-sm text-white hover:bg-slate-900 font-medium">
              {isSubmitting ? "Guardando..." : "Guardar Tipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};