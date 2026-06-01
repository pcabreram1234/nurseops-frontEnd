import React from "react";
import AuthGuard from "@/modules/auth/components/AuthGuard";
import Sidebar from "@/modules/dashboard/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Menú Lateral Fijo */}
        <Sidebar />

        {/* Contenedor del Contenido Principal (Margen izquierdo de 64 para no taparse con el Sidebar) */}
        <div className="pl-64">
          <main className="container mx-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}