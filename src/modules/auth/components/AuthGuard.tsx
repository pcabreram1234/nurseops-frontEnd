"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function  AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Escuchamos las propiedades de Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.accessToken);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated); // <-- Escuchamos el nuevo estado

  useEffect(() => {
    // CRÍTICO: Solo evaluamos la sesión SI Y SOLO SI Zustand ya terminó
    // de recuperar los datos reales del LocalStorage
    if (_hasHydrated) {
      if (!isAuthenticated || !token) {
        router.replace("/login");
      }
    }
  }, [_hasHydrated, isAuthenticated, token, router]);

  // Mientras Zustand se sincroniza con el navegador, mostramos un indicador de carga seguro
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">
            Sincronizando sesión de usuario...
          </p>
        </div>
      </div>
    );
  }

  // Si ya se sincronizó y el usuario es válido, se desbloquea el Dashboard
  return <>{children}</>;
}
