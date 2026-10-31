import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { documentService } from "../services/documentService";
import { DocumentTemplate, DocumentFilter } from "../types";

export const DOCUMENT_TEMPLATES_KEY = "document-templates";
export const DOCUMENTS_KEY = "generated-documents";

export function useDocumentTemplates(filters?: { documentType?: string; status?: string }) {
    const queryClient = useQueryClient();

    const query = useQuery<DocumentTemplate[]>({
        queryKey: [DOCUMENT_TEMPLATES_KEY, filters?.documentType, filters?.status],
        queryFn: () => documentService.getTemplates(filters),
        staleTime: 60 * 1000,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [DOCUMENT_TEMPLATES_KEY] });

    const createMutation = useMutation({
        mutationFn: documentService.createTemplate,
        onSuccess: () => { invalidate(); toast.success("Plantilla creada exitosamente"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al crear la plantilla"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DocumentTemplate> }) =>
            documentService.updateTemplate(id, data),
        onSuccess: () => { invalidate(); toast.success("Plantilla actualizada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al actualizar la plantilla"),
    });

    const activateMutation = useMutation({
        mutationFn: documentService.activateTemplate,
        onSuccess: () => { invalidate(); toast.success("Plantilla activada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al activar la plantilla"),
    });

    const setDefaultMutation = useMutation({
        mutationFn: documentService.setDefaultTemplate,
        onSuccess: () => { invalidate(); toast.success("Plantilla establecida como predeterminada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al establecer predeterminada"),
    });

    const archiveMutation = useMutation({
        mutationFn: documentService.archiveTemplate,
        onSuccess: () => { invalidate(); toast.success("Plantilla archivada"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al archivar la plantilla"),
    });

    return {
        templates: query.data || [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        createTemplate: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateTemplate: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        activateTemplate: activateMutation.mutateAsync,
        setDefaultTemplate: setDefaultMutation.mutateAsync,
        archiveTemplate: archiveMutation.mutateAsync,
    };
}

export function useDocuments(filters?: DocumentFilter) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [DOCUMENTS_KEY, filters?.documentType, filters?.status, filters?.employeeId, filters?.branchId, filters?.search, filters?.dateFrom, filters?.dateTo, filters?.page, filters?.limit],
        queryFn: () => documentService.getDocuments(filters),
        staleTime: 30 * 1000,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });

    const generateMutation = useMutation({
        mutationFn: documentService.generateDocument,
        onSuccess: () => { invalidate(); toast.success("Documento generado exitosamente"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al generar el documento"),
    });

    const substituteMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => documentService.substituteDocument(id, data),
        onSuccess: () => { invalidate(); toast.success("Documento sustituido (el original se conserva como histórico)"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al sustituir el documento"),
    });

    const voidMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => documentService.voidDocument(id, reason),
        onSuccess: () => { invalidate(); toast.success("Documento anulado (se conserva copia y auditoría)"); },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Error al anular el documento"),
    });

    return {
        documents: query.data?.data || [],
        meta: query.data?.meta || null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        generateDocument: generateMutation.mutateAsync,
        isGenerating: generateMutation.isPending,
        substituteDocument: substituteMutation.mutateAsync,
        voidDocument: voidMutation.mutateAsync,
        isVoiding: voidMutation.isPending,
    };
}
