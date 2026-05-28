"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { MENU_ITEMS } from "../config/menu.config";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Filtrar los ítems del menú basados estrictamente en el rol del usuario actual
  const allowedMenu = MENU_ITEMS.filter((item) =>
    user?.role ? item.allowedRoles.includes(user.role) : false,
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-950">
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
          <span className="inline-flex rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Menú de Navegación Dinámico */}
      <nav className="flex-1 space-y-1">
        {allowedMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
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
