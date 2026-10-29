"use client";

import React, { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  Users,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
  Loader2,
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  color?: "blue" | "green" | "orange" | "red" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950",
    orange: "bg-amber-50 text-amber-600 dark:bg-amber-950",
    red: "bg-red-50 text-red-600 dark:bg-red-950",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useDashboard();

  const role = user?.role;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando dashboard...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-muted-foreground">Error al cargar el dashboard</p>
        <p className="text-xs text-muted-foreground">Verifica tu conexión con el servidor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Centro de control operativo - Panel Principal
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Alerta contextual por rol */}
      {role === "SUPER" && (
        <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Vista Global - Super Administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-purple-700 dark:text-purple-400">
            Tienes acceso consolidado a todas las organizaciones del sistema.
          </CardContent>
        </Card>
      )}
      {role === "ADMIN" && (
        <Card className="border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Panel Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-red-700 dark:text-red-400">
            Gestión administrativa de tu organización.
          </CardContent>
        </Card>
      )}
      {role === "SUPERVISOR" && (
        <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Panel de Control de Guardia
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-amber-700 dark:text-amber-400">
            Monitoreo de turnos, cobertura y alertas operacionales.
          </CardContent>
        </Card>
      )}
      {role === "NURSE" && (
        <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Mi Cuadrante
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-700 dark:text-blue-400">
            Vista personal de tus turnos y solicitudes.
          </CardContent>
        </Card>
      )}

      {/* Indicadores principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {role === "SUPER" && (
          <>
            <StatCard
              title="Organizaciones"
              value={data?.overview?.totalOrganizations || 0}
              description={`${data?.overview?.activeOrganizations || 0} activas`}
              icon={Building2}
              color="purple"
            />
          </>
        )}
        <StatCard
          title="Departamentos"
          value={data?.overview?.totalDepartments || 0}
          description="Departamentos registrados"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Enfermeras Activas"
          value={data?.overview?.activeNurses || 0}
          description={`Total: ${data?.overview?.totalNurses || 0} registradas`}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Turnos Hoy"
          value={data?.overview?.scheduleEntriesToday || 0}
          description={`Cobertura: ${data?.overview?.coveragePercent || 0}%`}
          icon={CalendarDays}
          color="orange"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Alertas Abiertas"
          value={data?.overview?.openAlerts || 0}
          description={`${data?.overview?.criticalAlerts || 0} críticas/urgentes`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Ausencias Pendientes/Activas"
          value={data?.overview?.pendingAbsences || 0}
          description="Requieren atención"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Vacaciones Activas"
          value={data?.overview?.activeVacations || 0}
          description="En curso hoy"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Turnos sin asignar"
          value={data?.overview?.openToday || 0}
          description="Requieren cobertura"
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Turnos de hoy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Turnos de Hoy
            </CardTitle>
            <Link href="/dashboard/schedule-entries">
              <Button variant="ghost" size="sm">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.todaySchedule && data.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {data.todaySchedule.slice(0, 8).map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {entry.nurse?.user
                          ? `${entry.nurse.user.firstName} ${entry.nurse.user.lastName}`
                          : "Sin asignar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.shiftTemplate?.name || entry.shift?.name} •{" "}
                        {entry.shift?.startTime} - {entry.shift?.endTime}
                        {entry.shiftTemplate?.department?.name &&
                          ` • ${entry.shiftTemplate.department.name}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        entry.status === "ASSIGNED" || entry.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : entry.status === "OPEN"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {entry.status === "ASSIGNED"
                        ? "Asignado"
                        : entry.status === "CONFIRMED"
                        ? "Confirmado"
                        : entry.status === "OPEN"
                        ? "Abierto"
                        : entry.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay turnos programados para hoy
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alertas operacionales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Operacionales
            </CardTitle>
            <Link href="/dashboard/alerts">
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentAlerts && data.recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {data.recentAlerts.slice(0, 6).map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.department?.name} •{" "}
                          {new Date(alert.createdAt).toLocaleString("es-ES")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                            : alert.severity === "URGENT" || alert.severity === "HIGH"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay alertas pendientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vista global para SUPER - Organizaciones */}
      {role === "SUPER" && data?.organizations && data.organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Resumen por Organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Organización
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Código
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Departamentos
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Enfermeras
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                      Usuarios
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.organizations.map((org: any) => (
                    <tr
                      key={org.id}
                      className="border-b hover:bg-accent/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{org.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {org.code}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            org.status === "A"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {org.status === "A" ? "Activo" : org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{org.departmentsCount}</td>
                      <td className="py-3 px-4 text-center">{org.nursesCount}</td>
                      <td className="py-3 px-4 text-center">{org.usersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departamentos */}
      {data?.departments && data.departments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Departamentos
            </CardTitle>
            <Link href="/dashboard/departments">
              <Button variant="ghost" size="sm">
                Gestionar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.departments.map((dept: any) => (
                <div
                  key={dept.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <p className="font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Código: {dept.code}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{dept.nursesCount} enfermeras</span>
                    <span>{dept.usersCount} usuarios</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accesos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/schedules">
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <CalendarDays className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Calendarios</div>
                  <div className="text-xs text-muted-foreground">Planificación</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/schedule-entries">
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <Clock className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Asignaciones</div>
                  <div className="text-xs text-muted-foreground">Diarias</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/nurses">
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <Users className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Enfermeras</div>
                  <div className="text-xs text-muted-foreground">Personal</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/alerts">
              <Button variant="outline" className="justify-start h-auto py-3 w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Alertas</div>
                  <div className="text-xs text-muted-foreground">Operacionales</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
