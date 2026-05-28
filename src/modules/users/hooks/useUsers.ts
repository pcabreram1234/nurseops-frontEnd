import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UsersQueryParams } from "../services/user.services";
import { UserFormData } from "../types";
import { toast } from "sonner";

export function useUsers(params: UsersQueryParams) {
    const queryClient = useQueryClient();

    // 🌟 CLAVE: La queryKey incluye los parámetros para re-ejecutarse cuando cambien
    const usersQuery = useQuery({
        queryKey: ["users", params],
        queryFn: () => userService.getAll(params),
        placeholderData: (previousData) => previousData, // Evita parpadeos molestos de carga al paginar
    })


    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario creado correctamente");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al crear usuario");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) =>
            userService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario actualizado correctamente");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al actualizar usuario");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("Usuario eliminado del sistema");
        }
    });

    return {
        users: usersQuery.data?.data || [],
        meta: usersQuery.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
        isLoading: usersQuery.isLoading,
        isFetching: usersQuery.isFetching, // Útil para saber si está buscando en background
        isError: usersQuery.isError,
        createUser: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateUser: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteUser: deleteMutation.mutateAsync,
    };
}