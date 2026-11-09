import {
    Building2,
    Users,
    CalendarDays,
    Clock,
    AlertTriangle,
    SlidersHorizontal,
    LayoutDashboard,
    ShieldAlert,
    FileText,
    Palmtree
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
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"],
    },
    {
        title: "Estructura Médica",
        icon: Building2,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN"],
        children: [
            { title: "Organizaciones", href: "/dashboard/organizations", allowedRoles: ["SUPER"] },
            { title: "Sucursales (Branches)", href: "/dashboard/branches", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Departamentos", href: "/dashboard/departments", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Especialidades", href: "/dashboard/specialities", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
        ],
    },
    {
        title: "Gestión de Personal",
        icon: Users,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"],
        children: [
            { title: "Personal Operativo (Users)", href: "/dashboard/users", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Roles y Permisos", href: "/dashboard/roles", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Fichas de Enfermería", href: "/dashboard/nurses", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
            { title: "Restricciones Médicas", href: "/dashboard/restrictions", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
        ],
    },
    {
        title: "Planificación (Schedules)",
        icon: CalendarDays,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"],
        children: [
            { title: "Calendarios Globales", href: "/dashboard/schedules", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
            { title: "Plantillas de Turnos", href: "/dashboard/shift-templates", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
            { title: "Asignaciones Diarias", href: "/dashboard/schedule-entries", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
            { title: "Intercambios de Turno", href: "/dashboard/shift-changes", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
        ],
    },
    {
        title: "Control de Asistencia",
        icon: Clock,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"],
        children: [
            { title: "Ausencias y Reportes", href: "/dashboard/absences", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
            { title: "Vacaciones", href: "/dashboard/vacations", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
            { title: "Disponibilidad Horaria", href: "/dashboard/availability", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
        ],
    },
    {
        title: "Vacaciones y Políticas",
        icon: Palmtree,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"],
        children: [
            { title: "Solicitudes de Vacaciones", href: "/dashboard/vacations", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] },
            { title: "Políticas de Vacaciones", href: "/dashboard/settings/vacation-policies", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
        ],
    },
    {
        title: "Gestión Documental",
        icon: FileText,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"],
        children: [
            { title: "Documentos Generados", href: "/dashboard/documents", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
            { title: "Plantillas de Documentos", href: "/dashboard/settings/document-templates", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
        ],
    },
    {
        title: "Métricas y Alertas",
        icon: AlertTriangle,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"],
        children: [
            { title: "Alertas Operacionales", href: "/dashboard/alerts", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
            { title: "Carga de Trabajo (Fatiga)", href: "/dashboard/workload-metrics", allowedRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] },
            { title: "Resultados de Optimización AI", href: "/dashboard/optimization-scores", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
        ],
    },
    {
        title: "Configuración del Sistema",
        icon: SlidersHorizontal,
        allowedRoles: ["SUPER", "SYSTEM_ADMIN"],
        children: [
            { title: "Reglas de Negocio", href: "/dashboard/settings/rules", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Políticas de Cambio de Turno", href: "/dashboard/settings/shift-change-policies", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Políticas de Vacaciones", href: "/dashboard/settings/vacation-policies", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Plantillas de Documentos", href: "/dashboard/settings/document-templates", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
            { title: "Integraciones API", href: "/dashboard/settings/integrations", allowedRoles: ["SUPER"] },
            { title: "Auditoría (Audit Logs)", href: "/dashboard/settings/audit-logs", allowedRoles: ["SUPER"] },
            { title: "Gestión de Permisos", href: "/dashboard/settings/permissions", allowedRoles: ["SUPER", "SYSTEM_ADMIN"] },
        ],
    },
];