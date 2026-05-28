import axios from 'axios';
import { toast } from 'sonner'; // <-- Importamos la función global de alertas

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. INTERCEPTOR DE PETICIONES (Request) - Inyectar Token
apiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. NUEVO: INTERCEPTOR DE RESPUESTAS (Response) - Capturar Mensajes Globales
apiInstance.interceptors.response.use(
  (response) => {
    /**
     * CASO DE ÉXITO (HTTP Status 2xx)
     * Si el backend responde con éxito y adjunta una propiedad 'mensaje',
     * la mostramos automáticamente en un Toast verde (success).
     */
    const mensajeExito = response.data?.mensaje;
    if (mensajeExito) {
      toast.success(mensajeExito);
    }
    return response.data;
  },
  (error) => {
    /**
     * CASO DE ERROR (HTTP Status diferente a 2xx)
     * Buscamos la propiedad 'mensaje' dentro del cuerpo del error que envía el backend.
     * Si no viene, asignamos un mensaje genérico de error de red.
     */

    const mensajeError =
      error.response?.data?.message ||
      'Ocurrió un inconveniente en el servidor. Inténtalo más tarde.';

    // Mostramos la alerta en un Toast rojo (error)
    toast.error(mensajeError);

    /**
     * CONTROL ESTRATÉGICO (Opcional pero muy útil):
     * Si el servidor responde 401 (No autorizado), significa que el token expiró.
     * Aprovechamos para limpiar el almacenamiento de manera global.
     */
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // Aquí podrías disparar un window.location.href = '/login' si deseas forzar la salida
      }
    }

    // Es crucial retornar Promise.reject para que TanStack Query se entere 
    // de que la petición falló y maneje correctamente sus estados locales 'isError'
    return Promise.reject(error);
  }
);