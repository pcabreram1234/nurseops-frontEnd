import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 minutos
            gcTime: 1000 * 60 * 10,   // Tiempo en memoria antes de limpieza (antiguo cacheTime)
            refetchOnWindowFocus: false, // Evita peticiones dobles al cambiar de pestaña
            retry: 1, // Reintentos en caso de fallo de red
        },
    },
});