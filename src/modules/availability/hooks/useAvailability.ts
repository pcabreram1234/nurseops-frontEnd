import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityService } from "../services/availabilityService";
import { AvailabilityFilters, PaginatedAvailability } from "../types";
import { toast } from "sonner";

export const AVAILABILITY_KEY = "nurse-availability";

export function useAvailability(filters?: AvailabilityFilters) {
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedAvailability>({
        queryKey: [AVAILABILITY_KEY, filters?.nurseId, filters?.branchId, filters?.status, filters?.startDate, filters?.endDate, filters?.page, filters?.limit],
        queryFn: () => availabilityService.getAll(filters),
        placeholderData: (prev) => prev,
        retry: 1,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [AVAILABILITY_KEY] });

    const createMutation = useMutation({
        mutationFn: availabilityService.create,
        onSuccess: () => { invalidate(); toast.success("Disponibilidad registrada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al registrar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => availabilityService.update(id, data),
        onSuccess: () => { invalidate(); toast.success("Disponibilidad actualizada"); },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Error al actualizar";
            toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
        },
    });

    return {
        availabilities: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createAvailability: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateAvailability: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
