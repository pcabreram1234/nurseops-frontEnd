import {
    Building2,
    Users,
    CalendarDays,
    Clock,
    AlertTriangle,
    SlidersHorizontal,
    LayoutDashboard,
    ShieldAlert
} from "lucide-react";

export interface SubMenuItem {
    title: string;
    href: string;
    allowedRoles: string[];
}

export interface MenuItem {
    title: string;
    href?: string; // Si tiene submenús, href queda opcional
    icon: any;
    allowedRoles: string[];
    children?: SubMenuItem[]; // Submenús opcionales
}

export const MENU_ITEMS: MenuItem[] = [
    {
        title: "Panel Principal",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"],
    },
    {
        title: "Estructura Médica",
        icon: Building2,
        allowedRoles: ["SUPER", "ADMIN"],
        children: [
            { title: "Organizaciones", href: "/dashboard/organizations", allowedRoles: ["SUPER"] },
            { title: "Sucursales (Branches)", href: "/dashboard/branches", allowedRoles: ["SUPER", "ADMIN"] },
            { title: "Departamentos", href: "/dashboard/departments", allowedRoles: ["SUPER", "ADMIN"] },
            { title: "Especialidades", href: "/dashboard/specialities", allowedRoles: ["SUPER", "ADMIN"] },
        ],
    },
    {
        title: "Gestión de Personal",
        icon: Users,
        allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"],
        children: [
            { title: "Personal Operativo (Users)", href: "/dashboard/users", allowedRoles: ["SUPER", "ADMIN"] },
            { title: "Roles y Permisos", href: "/dashboard/roles", allowedRoles: ["SUPER", "ADMIN"] },
            { title: "Fichas de Enfermería", href: "/dashboard/nurses", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"] },
            { title: "Restricciones Médicas", href: "/dashboard/restrictions", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"] },
        ],
    },
    {
        title: "Planificación (Schedules)",
        icon: CalendarDays,
        allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"],
        children: [
            { title: "Calendarios Globales", href: "/dashboard/schedules", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
            { title: "Plantillas de Turnos", href: "/dashboard/shift-templates", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"] },
            { title: "Asignaciones Diarias", href: "/dashboard/schedule-entries", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
            { title: "Intercambios de Turno", href: "/dashboard/shift-changes", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
        ],
    },
    {
        title: "Control de Asistencia",
        icon: Clock,
        allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"],
        children: [
            { title: "Ausencias y Reportes", href: "/dashboard/absences", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
            { title: "Vacaciones", href: "/dashboard/vacations", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
            { title: "Disponibilidad Horaria", href: "/dashboard/availability", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] },
        ],
    },
    {
        title: "Métricas y Alertas",
        icon: AlertTriangle,
        allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"],
        children: [
            { title: "Alertas Operacionales", href: "/dashboard/alerts", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"] },
            { title: "Carga de Trabajo (Fatiga)", href: "/dashboard/workload-metrics", allowedRoles: ["SUPER", "ADMIN", "SUPERVISOR"] },
            { title: "Resultados de Optimización AI", href: "/dashboard/optimization-scores", allowedRoles: ["SUPER", "ADMIN"] },
        ],
    },
    {
        title: "Configuración del Sistema",
        icon: SlidersHorizontal,
        allowedRoles: ["SUPER", "ADMIN"],
        children: [
            { title: "Reglas de Negocio", href: "/dashboard/settings/rules", allowedRoles: ["SUPER", "ADMIN"] },
            { title: "Integraciones API", href: "/dashboard/settings/integrations", allowedRoles: ["SUPER"] },
            { title: "Auditoría (Audit Logs)", href: "/dashboard/settings/audit-logs", allowedRoles: ["SUPER"] },
        ],
    },
];