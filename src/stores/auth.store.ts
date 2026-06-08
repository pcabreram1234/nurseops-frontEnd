import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Definición del contrato del usuario autenticado basado en tu modelo de negocio
export interface AuthUser {
    id: string;
    sub:string;
    email: string;
    name: string;
    organizationId: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'NURSE' | 'SUPER'; // Tipado fuerte para tus roles
    permissions: string[]; // Por lo general los permisos son un array de strings (ej: ['create:users', 'read:shifts'])
}


export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser; // Reutilizamos la interfaz de arriba
}

// 2. Definición de la estructura del estado y sus acciones lógicas
interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean; // <-- NUEVO: Rastreador de sincronización
    setHasHydrated: (state: boolean) => void; // <-- NUEVO
    login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<AuthUser>) => void;
}

// 3. Creación del Store con Persistencia en LocalStorage
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            _hasHydrated: false, // <-- Inicialmente en falso

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            login: (user, accessToken, refreshToken) => {
                if (typeof window !== 'undefined') {
                    console.log(accessToken);
                    localStorage.setItem('auth_token', accessToken);
                }
                set({ user, accessToken, refreshToken, isAuthenticated: true, _hasHydrated: true });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            updateUser: (partialUser) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...partialUser } : null,
                })),
        }),
        {
            name: 'nurse-scheduler-auth',
            storage: createJSONStorage(() => localStorage),
            // 🌟 SOLUCIÓN AL ERROR 1: 
            // Filtramos el estado para que '_hasHydrated' JAMÁS se guarde en el localStorage
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            // <-- NUEVO: Se ejecuta automáticamente cuando Zustand termina de leer el LocalStorage
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },

        }
    )
);