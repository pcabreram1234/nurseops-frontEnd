"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Asegúrate de importar tu componente Button

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  const pages: number[] = [];
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 border-t bg-slate-50 dark:bg-slate-900/20 ${className}`}>
      <span className="text-xs text-muted-foreground">
        Página {currentPage} de {totalPages} ({totalItems} registros)
      </span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="text-xs"
        >
          <ChevronLeft className="h-3 w-3" /> Anterior
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={`text-xs font-medium ${
              currentPage === p
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "text-gray-600 hover:bg-slate-100"
            }`}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="gap-1 text-xs"
        >
          Siguiente <ChevronRight className="h-3 w-3.5" />
        </Button>
      </div>
    </div>
  );
} 