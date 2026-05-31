import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nurseService } from "../services/nurseService";

export const useNurses = () => {
  const queryClient = useQueryClient();

  const { data: nurses = [], isLoading, isError } = useQuery({
    queryKey: ["nurses"],
    queryFn: nurseService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: nurseService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nurses"] }),
  });


  const deleteMutation = useMutation({
    mutationFn: nurseService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nurses"] }),
  });

  return {
    nurses,
    isLoading: isLoading || createMutation.isPending || deleteMutation.isPending,
    isError,
    createNurse: createMutation.mutateAsync,
    deleteNurse: deleteMutation.mutateAsync,
  };
};