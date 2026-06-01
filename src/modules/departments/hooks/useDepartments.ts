import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "../services/department.services";
import { DepartmentFormData } from "../types";
import { toast } from "sonner";

export function useDepartments() {
    const queryClient = useQueryClient();

    const departmentsQuery = useQuery({
        queryKey: ["departments"],
        queryFn: departmentService.getAll
    });

    const createMutation = useMutation({
        mutationFn: departmentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast.success("Departamento registrado exitosamente");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) => 
            departmentService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast.success("Configuración del departamento actualizada");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: departmentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            toast.success("Departamento eliminado del sistema");
        }
    });

    return {
        departments: departmentsQuery.data || [],
        isLoading: departmentsQuery.isLoading,
        createDepartment: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateDepartment: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteDepartment: deleteMutation.mutateAsync
    };
}