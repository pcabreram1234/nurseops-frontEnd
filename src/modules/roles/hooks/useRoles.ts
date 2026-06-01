import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../services/role.services";
import { RoleFormData, AssingPermisions, UpadeteRoleFormData } from "../types";
import { toast } from "sonner";

export function useRoles() {
    const queryClient = useQueryClient();

    const rolesQuery = useQuery({
        queryKey: ["roles"],
        queryFn: roleService.getAll
    });

    const permissionsQuery = useQuery({
        queryKey: ["permissions-catalog"],
        queryFn: roleService.getPermissionsCatalog
    });

    const assingPermissionsMutation = useMutation({
        // 🌟 Corregido el tipado interno para mayor consistencia
        mutationFn: ({ id, data }: { id: string; data: AssingPermisions }) =>
            roleService.assignPermissions(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Permisos asignadas al rol");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al sincronizar permisos");
        }
    });

    const createMutation = useMutation({
        mutationFn: roleService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Rol creado correctamente");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpadeteRoleFormData }) =>
            roleService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: roleService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Rol eliminado");
        }
    });

    return {
        roles: rolesQuery.data || [],
        permissionsCatalog: permissionsQuery.data || [],
        isLoading: rolesQuery.isLoading || permissionsQuery.isLoading,
        isFetching: rolesQuery.isFetching,
        createUserRole: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateUserRole: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        // 🌟 RETORNAMOS LA FUNCIÓN ASÍNCRONA Y SU ESTADO DE CARGA
        assignPermissions: assingPermissionsMutation.mutateAsync,
        isAssigning: assingPermissionsMutation.isPending,
        deleteUserRole: deleteMutation.mutateAsync
    };
}