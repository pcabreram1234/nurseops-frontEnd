import { LayoutDashboard, Users, Calendar, Clock, FileSpreadsheet, ShieldAlert } from "lucide-react";

export interface MenuItem {
    title: string;
    href: string;
    icon: any;
    allowedRoles: ('ADMIN' | 'SUPERVISOR' | 'NURSE' | 'SUPER')[];
}

export const MENU_ITEMS: MenuItem[] = [
    {
        title: "Panel General",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["ADMIN", "SUPERVISOR", "NURSE", "SUPER"], // Acceso universal
    },
    {
        title: "Gestión de Personal",
        href: "/dashboard/users",
        icon: Users,
        allowedRoles: ["ADMIN", "SUPER"], // Solo administradores
    },
    {
        title: "Planificación de Turnos",
        href: "/dashboard/schedules",
        icon: Calendar,
        allowedRoles: ["ADMIN", "SUPERVISOR", "SUPER"], // Admin y Supervisores de enfermería
    },
    {
        title: "Mis Horarios",
        href: "/dashboard/my-shifts",
        icon: Clock,
        allowedRoles: ["NURSE", "SUPER"], // Solo enfermeros de planta
    },
    {
        title: "Reportes e Incidencias",
        href: "/dashboard/reports",
        icon: FileSpreadsheet,
        allowedRoles: ["ADMIN", "SUPERVISOR", "SUPER"],
    },
];