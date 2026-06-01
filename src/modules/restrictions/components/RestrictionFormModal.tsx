"use client"

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { NurseRestrictionType } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, id?: string) => Promise<void>;
  restrictionGroup?: any | null;
  types: NurseRestrictionType[];
  nurses: { id: string; user?: { firstName: string; lastName: string } }[];
}

export const RestrictionFormModal: React.FC<Props> = ({
  isOpen, onClose, onSave, restrictionGroup, types, nurses
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<any>();

  const [isNurseDropdownOpen, setIsNurseDropdownOpen] = useState(false);
  const [nurseSearch, setNurseSearch] = useState("");
  const nurseDropdownRef = useRef<HTMLDivElement>(null);

  const selectedNurseIds = watch("nurseIds") || [];
  const isTemporary = watch("isTemporary");

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (nurseDropdownRef.current && !nurseDropdownRef.current.contains(e.target as Node)) {
        setIsNurseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (restrictionGroup) {
        reset({
          nurseIds: restrictionGroup.nurseIds || [],
          restrictionTypeId: restrictionGroup.restrictionTypeId,
          isTemporary: restrictionGroup.isTemporary,
          isActive: restrictionGroup.isActive,
          startDate: restrictionGroup.startDate ? restrictionGroup.startDate.split("T")[0] : "",
          endDate: restrictionGroup.endDate ? restrictionGroup.endDate.split("T")[0] : "",
          notes: restrictionGroup.notes || ""
        });
      } else {
        reset({
          nurseIds: [], restrictionTypeId: "", isTemporary: false, isActive: true,
          startDate: "", endDate: "", notes: ""
        });
        setNurseSearch("");
      }
    }
  }, [restrictionGroup, isOpen, reset]);

  const filteredNurses = nurses.filter(n => {
    const fullName = `${n.user?.firstName || ""} ${n.user?.lastName || ""}`.toLowerCase();
    return fullName.includes(nurseSearch.toLowerCase());
  });

  const toggleNurseSelection = (id: string) => {
    const current = [...selectedNurseIds];
    if (current.includes(id)) {
      setValue("nurseIds", current.filter(nId => nId !== id), { shouldValidate: true });
    } else {
      setValue("nurseIds", [...current, id], { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (data: any) => {
    await onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {restrictionGroup ? "⚠️ Modificar Restricción Masiva" : "⚠️ Nueva Restricción Masiva"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

          {/* MULTI-SELECTOR DE PERSONAL */}
          <div className="relative" ref={nurseDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Afectado (Selección Múltiple)</label>
            <input type="hidden" {...register("nurseIds", { validate: v => v && v.length > 0 || "Seleccione al menos un profesional" })} />

            <div
              onClick={() => setIsNurseDropdownOpen(true)}
              className={`min-h-[42px] w-full rounded-lg border p-2 text-sm bg-white cursor-text flex flex-wrap gap-2 ${errors.nurseIds ? "border-red-500" : "border-gray-300"}`}
            >
              {selectedNurseIds.length === 0 && <span className="text-gray-400 mt-0.5">Buscar y añadir enfermeras...</span>}
              {selectedNurseIds.map((id: string) => {
                const n = nurses.find(x => x.id === id);
                if (!n) return null;
                return (
                  <span key={id} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold">
                    {n.user?.firstName} {n.user?.lastName}
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleNurseSelection(id); }} className="hover:text-red-500 ml-1 font-bold">✕</button>
                  </span>
                )
              })}
            </div>

            {isNurseDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                <input
                  type="text"
                  autoFocus
                  value={nurseSearch}
                  onChange={(e) => setNurseSearch(e.target.value)}
                  placeholder="Filtrar por nombre..."
                  className="w-full p-2 text-sm border-b focus:outline-none"
                />
                <ul className="max-h-48 overflow-y-auto p-1">
                  {filteredNurses.map(n => {
                    const isSelected = selectedNurseIds.includes(n.id);
                    return (
                      <li
                        key={n.id}
                        onClick={() => toggleNurseSelection(n.id)}
                        className={`p-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${isSelected ? 'bg-amber-50 text-amber-900 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <span>{n.user?.firstName} {n.user?.lastName}</span>
                        {isSelected && <span className="text-amber-600 font-bold">✓</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {errors.nurseIds?.message && <span className="text-xs text-red-500">{String(errors.nurseIds.message)}</span>}
          </div>

          {/* SELECCIONAR TIPO DE RESTRICCIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Limitación Clínica</label>
            <select
              {...register("restrictionTypeId", { required: "Campo requerido" })}
              disabled={!!restrictionGroup}
              className={`mt-1 block w-full rounded-lg border p-2 text-sm ${restrictionGroup ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "border-gray-300"}`}
            >
              <option value="">Seleccione...</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.description} ({t.code})</option>
              ))}
            </select>
            {errors.restrictionTypeId?.message && <span className="text-xs text-red-500">{String(errors.restrictionTypeId.message)}</span>}
          </div>

          {/* CHECKBOXES CONFIGURACIONES */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center">
              <input type="checkbox" id="modal-isTemporary" {...register("isTemporary")} className="h-4 w-4 rounded text-amber-600" />
              <label htmlFor="modal-isTemporary" className="ml-2 text-sm font-medium text-gray-800">¿Es Temporal?</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="modal-isActive" {...register("isActive")} className="h-4 w-4 rounded text-amber-600" />
              <label htmlFor="modal-isActive" className="ml-2 text-sm font-medium text-gray-800">Estado Activo</label>
            </div>
          </div>

          {/* CAMPOS CONDICIONALES DE FECHAS */}
          {isTemporary && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <input type="date" {...register("startDate", { required: isTemporary })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                <input type="date" {...register("endDate", { required: isTemporary })} className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm" />
              </div>
            </div>
          )}

          {/* DETALLES Y OBSERVACIONES */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones (Aplica para todo el lote)</label>
            <textarea
              {...register("notes", { onChange: (e) => e.target.value = e.target.value.toUpperCase() })}
              rows={3}
              placeholder="ESPECIFICACIONES MÉDICAS O DISPOSICIONES LEGALES..."
              className="mt-1 block w-full rounded-lg border-gray-300 p-2 border text-sm uppercase resize-none"
            />
          </div>

          {/* ACCIONES */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-amber-600 px-5 py-2 text-sm text-white hover:bg-amber-700 font-medium">
              {isSubmitting ? "Sincronizando..." : "Sincronizar Lote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};