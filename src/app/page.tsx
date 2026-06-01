"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated) {
      if (isAuthenticated && accessToken) {
        // Si ya está logueado, directo al panel interno
        router.replace("/dashboard");
      } else {
        // Si no está autenticado, directo al login
        router.replace("/login");
      }
    }
  }, [_hasHydrated, isAuthenticated, accessToken, router]);

  // Pantalla neutra de carga rápida mientras Zustand lee el almacenamiento local
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm font-medium text-muted-foreground">Inicializando sistema...</p>
      </div>
    </div>
  );
}