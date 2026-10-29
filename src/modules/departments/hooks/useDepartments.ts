import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "../services/department.services";
import { DepartmentFormData, DepartmentFilters, PaginatedDepartments } from "../types";
import { toast } from "sonner";

export function useDepartments(filters?: DepartmentFilters) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["departments", filters?.search, filters?.type, filters?.branchId, filters?.criticalLevel, filters?.isEmergencyDepartment, filters?.isActive, filters?.page, filters?.limit],
        queryFn: () => departmentService.getAll(filters),
        placeholderData: (prev: PaginatedDepartments | undefined) => prev,
    });

    const createMutation = useMutation({
        mutationFn: departmentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments", "departments-list"] });
            toast.success("Departamento registrado exitosamente");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) =>
            departmentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments", "departments-list"] });
            toast.success("Configuración del departamento actualizada");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: departmentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments", "departments-list"] });
            toast.success("Departamento eliminado del sistema");
        }
    });

    return {
        departments: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createDepartment: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateDepartment: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteDepartment: deleteMutation.mutateAsync
    };
}