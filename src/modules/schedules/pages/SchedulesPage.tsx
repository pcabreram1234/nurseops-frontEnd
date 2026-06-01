"use client";

import React from 'react';
import { useSchedules } from '../hooks/useSchedules';
// Nota: Aquí irían tus componentes compartidos de UI como Button, Table, etc.
import { Button } from '@/components/ui/button'; 

interface SchedulesPageProps {
  departmentId: string;
}

export default function SchedulesPage({ departmentId }: SchedulesPageProps) {
  const { data: schedules, isLoading, isError } = useSchedules(departmentId);

  if (isLoading) return <div className="p-6 text-center">Cargando cronogramas...</div>;
  if (isError) return <div className="p-6 text-red-500">Error al cargar datos del servidor.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Planificación de Turnos</h1>
        <Button size="sm">Generar Nuevo Mes</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules?.map((schedule) => (
          <div key={schedule.id} className="p-4 border rounded-xl bg-card shadow-sm">
            <h3 className="font-semibold text-lg">Mes: {new Date(schedule.targetDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
            <p className="text-sm text-muted-foreground mt-1">Cobertura: {schedule.coveragePercentage.toFixed(1)}%</p>
            <div className="text-xs text-slate-400 mt-2">
              Slots: {schedule.slotsCovered} / {schedule.slotsCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}