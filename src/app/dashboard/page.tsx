"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground">
          Aquí tienes el resumen operativo para tu rol asignado.
        </p>
      </div>

      {/* Vistas específicas utilizando bloques lógicos rápidos por Roles */}
      {user?.role === "ADMIN" && (
        <Card className="border-red-200 bg-red-50/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-800">Módulo de Administración Activo</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-red-700">
            Tienes permisos totales. Puedes crear nuevos departamentos, dar de alta supervisores y auditar el historial de cambios del sistema.
          </CardContent>
        </Card>
      )}

      {user?.role === "SUPERVISOR" && (
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-amber-800">Panel de Control de Guardia</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-amber-700">
            Como Supervisor, puedes aprobar cambios de turnos solicitados por los enfermeros y cuadrar las horas semanales del departamento.
          </CardContent>
        </Card>
      )}

      {user?.role === "NURSE" && (
        <Card className="border-blue-200 bg-blue-50/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-800">Mi Cuadrante de Planta</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-700">
            Puedes visualizar tus turnos asignados del mes en curso y aplicar a solicitudes de intercambio o días libres.
          </CardContent>
        </Card>
      )}

      {/* Estadísticas de ejemplo accesibles para todos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Turno Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">En Curso</div>
            <p className="text-xs text-muted-foreground">Siguiente rotación a las 14:00 hrs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}