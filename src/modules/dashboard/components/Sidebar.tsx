"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MENU_ITEMS, MenuItem } from "../../../config/menu.config";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronDown, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Estado para controlar qué submenús están abiertos de forma simultánea
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Filtrar los ítems principales basados en el rol del usuario
  const allowedMenu = MENU_ITEMS.filter((item) =>
    user?.role ? item.allowedRoles.includes(user.role) : false
  );

  // Efecto automático: Si se recarga la página en una ruta interna (ej. /dashboard/departments)
  // el submenú correspondiente ("Estructura Médica") se abrirá solo.
  useEffect(() => {
    allowedMenu.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.href === pathname);
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950 overflow-y-auto">
      {/* Header del Sidebar */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="text-xl">👩‍⚕️</span>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          NurseScheduler
        </h2>
      </div>

      {/* Perfil Corto del Usuario */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
            {user?.name}
          </p>
          <span className="inline-flex rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Menú de Navegación Dinámico e Interactivo */}
      <nav className="flex-1 space-y-1">
        {allowedMenu.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children && item.children.length > 0;
          const isMenuOpen = !!openMenus[item.title];
          
          // Verificar si el link principal exacto está activo
          const isRootActive = item.href ? pathname === item.href : false;
          // Verificar si alguno de sus hijos está activo para estilizar el contenedor principal
          const isChildActive = item.children?.some((child) => child.href === pathname) ?? false;

          // Si NO tiene submenú, renderiza un Link directo estándar
          if (!hasChildren && item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isRootActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.title}</span>
              </Link>
            );
          }

          // Si TIENE submenú, renderiza un contenedor colapsable interactivo
          return (
            <div key={item.title} className="space-y-1">
              <button
                onClick={() => toggleSubMenu(item.title)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isChildActive 
                    ? "bg-slate-100/80 text-primary dark:bg-slate-900 dark:text-white" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.title}</span>
                {isMenuOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>

              {/* Renderizado de los Sub-Items condicionado por el rol */}
              {isMenuOpen && item.children && (
                <div className="ml-6 pl-2 border-l border-slate-100 dark:border-slate-800 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {item.children
                    .filter((child) => user?.role ? child.allowedRoles.includes(user.role) : false)
                    .map((child) => {
                      const isSubActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSubActive
                              ? "text-primary font-bold bg-primary/5 dark:bg-primary/10"
                              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                          }`}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}