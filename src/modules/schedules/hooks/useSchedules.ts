import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/scheduleService';

export function useSchedules(departmentId: string) {
    return useQuery({
        queryKey: ['schedules', departmentId],
        queryFn: () => scheduleService.getSchedules(departmentId),
        enabled: !!departmentId, // Evita ejecutar si no hay ID de departamento elegido
    });
}

export function useGenerateSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: scheduleService.generateSchedule,
        onSuccess: (_, variables) => {
            // Invalida la caché para refrescar la lista de horarios automáticamente
            queryClient.invalidateQueries({ queryKey: ['schedules', variables.departmentId] });
        },
    });
}