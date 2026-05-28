import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { AuthResponse, useAuthStore } from "@/stores/auth.store";
import { LoginCredentials } from "../types";

export function useLogin() {
    const router = useRouter();
    const loginGlobal = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
        onSuccess: (resp: AuthResponse) => {
            const user = resp.user
            const accessToken = resp.accessToken
            const refreshToken = resp.refreshToken
            // 1. Guardar usuario y token en el estado global (Zustand)
            loginGlobal(user, accessToken, refreshToken);

            // 2. Redireccionar a la pantalla principal del sistema
            router.push("/dashboard");
        },
        onError: (error: any) => {
            console.log(error)
            // Aquí puedes manejar respuestas de error específicas del backend
            console.error("Login error:", error?.message);
        },
    });
}