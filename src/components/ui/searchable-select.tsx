"use client";

import * as React from "react";
import { debounce } from "@/lib/utils";
import { Loader2, Search, AlertCircle, ChevronDown, X } from "lucide-react";

/**
 * Opción genérica para el selector de búsqueda.
 */
export interface SearchableOption {
    value: string;
    label: string;
    /** Texto secundario opcional para mostrar contexto (departamento, sede, etc.) */
    description?: string;
    /** Deshabilitar esta opción específica */
    disabled?: boolean;
}

/**
 * Resultado paginado devuelto por el loader de opciones.
 */
export interface SearchableResult<T = SearchableOption> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Resultado simplificado que los loaders pueden devolver.
 * El componente solo usa `items` y `totalPages`.
 */
export interface SearchableLoaderResult<T = SearchableOption> {
    items: T[];
    totalPages: number;
}

/**
 * Función cargadora de opciones. Recibe el texto de búsqueda y filtros adicionales,
 * devuelve una promesa con el resultado paginado.
 */
export type SearchableLoader<T = SearchableOption> = (
    search: string,
    filters?: Record<string, string | number | boolean | undefined>,
    page?: number,
    limit?: number,
) => Promise<SearchableLoaderResult<T>>;

interface SearchableSelectProps<T = SearchableOption> {
    /** Valor actualmente seleccionado (id). */
    value: string;
    /** Callback al cambiar la selección. */
    onValueChange: (value: string | null) => void;
    /** Función cargadora de opciones bajo demanda. */
    loader: SearchableLoader<T>;
    /** Filtros estáticos adicionales (ej: departmentId, branchId). */
    filters?: Record<string, string | number | boolean | undefined>;
    /** Placeholder del input. */
    placeholder?: string;
    /** Etiqueta del campo. */
    label?: string;
    /** Si el campo es obligatorio. */
    required?: boolean;
    /** Mensaje de error a mostrar. */
    error?: string | null;
    /** Deshabilitar el componente. */
    disabled?: boolean;
    /** Renderizado personalizado de la etiqueta de la opción seleccionada. */
    labelRenderer?: (option: T | null) => React.ReactNode;
    /** Renderizado personalizado de cada opción en el desplegable. */
    optionRenderer?: (option: T) => React.ReactNode;
    /** Límite de resultados por página. */
    pageSize?: number;
    /** Texto cuando no hay resultados. */
    emptyMessage?: string;
    /** ID del input para accesibilidad. */
    inputId?: string;
    /** Nombre del input para formularios. */
    name?: string;
}

const DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 20;
const EMPTY_OPTION_LABEL = "Sin selección";

function defaultLabelRenderer<T>(option: T | null): React.ReactNode {
    if (!option) return EMPTY_OPTION_LABEL;
    const opt = option as unknown as SearchableOption;
    return <span className="text-sm truncate">{opt.label}</span>;
}

function defaultOptionRenderer<T>(option: T): React.ReactNode {
    const opt = option as unknown as SearchableOption;
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{opt.label}</div>
                {opt.description && (
                    <div className="text-xs text-muted-foreground truncate">{opt.description}</div>
                )}
            </div>
            <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{opt.value}</span>
        </div>
    );
}

export function SearchableSelect<T = SearchableOption>({
    value,
    onValueChange,
    loader,
    filters,
    placeholder = "Buscar...",
    label,
    required = false,
    error = null,
    disabled = false,
    labelRenderer = defaultLabelRenderer as (option: T | null) => React.ReactNode,
    optionRenderer = defaultOptionRenderer as (option: T) => React.ReactNode,
    pageSize = DEFAULT_PAGE_SIZE,
    emptyMessage = "No se encontraron resultados",
    inputId,
    name,
}: SearchableSelectProps<T>) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [query, setQuery] = React.useState("");
    const [options, setOptions] = React.useState<T[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [totalPages, setTotalPages] = React.useState(0);
    const [selectedOption, setSelectedOption] = React.useState<T | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const ignoreBlur = React.useRef(false);
    const isMounting = React.useRef(true);

    // Resolver la opción seleccionada desde el valor inicial (solo después del montaje inicial).
    React.useEffect(() => {
        if (isMounting.current) {
            isMounting.current = false;
            return;
        }
        const found = options.find((o) => (o as unknown as SearchableOption).value === value);
        setSelectedOption(found ?? null);
    }, [value, options]);

    // Resetear highlightedIndex cuando las opciones cambian.
    React.useEffect(() => {
        setHighlightedIndex(-1);
    }, [options]);

    // Función local para decidir si una opción coincide con la búsqueda,
    // considerando tanto el label principal como el description secundario.
    const matchesSearch = React.useCallback(
        (opt: T, search: string): boolean => {
            if (!search || !search.trim()) return true;
            const s = search.trim().toLowerCase();
            const o = opt as unknown as SearchableOption;
            const label = (o.label ?? "").toLowerCase();
            const description = (o.description ?? "").toLowerCase();
            return label.includes(s) || description.includes(s);
        },
        [],
    );

    // Loader con debounce.
    const debouncedLoad = React.useCallback(
        debounce(async (searchText: string) => {
            if (!searchText || !searchText.trim()) {
                setOptions([]);
                setCurrentPage(1);
                setTotalPages(0);
                setHighlightedIndex(-1);
                return;
            }

            setIsLoading(true);
            setErrorMessage(null);
            try {
                const result = await loader(searchText, filters, currentPage, pageSize);
                // Filtrado local adicional: considerar coincidencia en label O description (secundario)
                const rawItems = result.items ?? [];
                const filtered = rawItems.filter((opt) => matchesSearch(opt, searchText));
                setOptions(filtered);
                setHighlightedIndex(-1);
                setTotalPages(Math.ceil(rawItems.length / pageSize));
            } catch {
                setOptions([]);
                setErrorMessage("Error al cargar los resultados.");
                setHighlightedIndex(-1);
            } finally {
                setIsLoading(false);
            }
        }, DEBOUNCE_MS),
        [loader, filters, currentPage, pageSize, matchesSearch],
    );

    const handleSearchChange = React.useCallback(
        (next: string) => {
            const val = next ?? "";
            setQuery(val);
            setCurrentPage(1);
            setIsOpen(true);
            setHighlightedIndex(-1);
            debouncedLoad(val);
        },
        [debouncedLoad],
    );

    const handleSelectOption = React.useCallback(
        (opt: T) => {
            const optVal = (opt as unknown as SearchableOption).value;
            const optLabel = (opt as unknown as SearchableOption).label;
            setSelectedOption(opt);
            setQuery(optLabel);
            setIsOpen(false);
            setHighlightedIndex(-1);
            ignoreBlur.current = true;
            onValueChange(optVal ?? null);
        },
        [onValueChange],
    );

    const handleClear = React.useCallback(() => {
        setQuery("");
        setSelectedOption(null);
        setOptions([]);
        setCurrentPage(1);
        setTotalPages(0);
        setHighlightedIndex(-1);
        setIsOpen(false);
        ignoreBlur.current = true;
        onValueChange(null);
    }, [onValueChange]);

    const handleLoadMore = React.useCallback(() => {
        if (isLoading || currentPage >= totalPages) return;
        setCurrentPage((p) => p + 1);
        debouncedLoad(query);
    }, [query, isLoading, currentPage, totalPages, debouncedLoad]);

    // Manejo de teclado: Enter para seleccionar, flechas para navegar, Escape para cerrar.
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;

            if (e.key === "Enter") {
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
                    handleSelectOption(options[highlightedIndex]);
                } else if (options.length === 1) {
                    // Si solo hay un resultado y Enter se presiona, seleccionarlo
                    handleSelectOption(options[0]);
                }
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex((prev) =>
                    prev >= options.length - 1 ? prev : prev + 1,
                );
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => (prev <= 0 ? -1 : prev - 1));
                return;
            }
        },
        [isOpen, options, highlightedIndex, handleSelectOption, disabled],
    );

    // Cerrar dropdown al hacer clic fuera del componente.
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasValue = !!selectedOption;

    return (
        <div ref={containerRef} className="w-full space-y-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className={`text-xs font-medium text-foreground ${required ? "text-destructive" : "text-muted-foreground"}`}
                >
                    {label}{required ? <span className="text-red-500 ml-0.5">*</span> : null}
                </label>
            )}

            <div
                className="relative"
                onClick={(e) => {
                    if (disabled) return;
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
            >
                <input
                    id={inputId}
                    name={name}
                    type="search"
                    value={query ?? ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (disabled) return;
                        setIsOpen(true);
                        if ((query ?? "").trim() === "") {
                            setCurrentPage(1);
                            debouncedLoad("");
                        }
                    }}
                    onBlur={(e) => {
                        if (ignoreBlur.current) {
                            ignoreBlur.current = false;
                            return;
                        }
                        // Usar setTimeout para permitir que el clic en una opción se procese antes de cerrar
                        setTimeout(() => {
                            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                                setIsOpen(false);
                                setHighlightedIndex(-1);
                            }
                        }, 200);
                    }}
                    disabled={disabled}
                    readOnly={Boolean(selectedOption)}
                    className={`flex w-full h-full items-center gap-2 rounded-lg border border-input bg-input py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:border-input dark:text-foreground ${
                        hasValue ? "pl-3 pr-20" : "px-3 pr-16"
                    }`}
                    placeholder={hasValue ? "" : placeholder}
                />

                {/* Valor seleccionado mostrado como píldora estética sin solapamiento */}
                {hasValue && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 max-w-[calc(100%-4.5rem)] flex items-center gap-1.5 rounded-md border border-input bg-background px-1 py-1 text-xs text-foreground shadow-sm truncate"
                    >
                        <span className="truncate">{labelRenderer(selectedOption)}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            disabled={disabled}
                            className="shrink-0 rounded-full p-0.5 hover:bg-accent text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* Ícono de búsqueda / carga */}
                {isLoading ? (
                    <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
                ) : (
                    <Search className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                )}

                <ChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-muted-foreground pointer-events-none`}
                />

                {/* Desplegable de opciones */}
                {isOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-input bg-popover text-popover-foreground shadow-lg animate-in fade-in slide-in-from-top-2">
                        {/* Mensaje inicial cuando no hay búsqueda todavía */}
                        {(query ?? "").trim() === "" && options.length === 0 && !isLoading && !errorMessage && (
                            <div className="px-3 py-3 text-center">
                                <p className="text-xs text-muted-foreground">{placeholder}</p>
                            </div>
                        )}

                        {/* Estado de carga */}
                        {isLoading && options.length === 0 && (
                            <div className="px-3 py-4 text-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto mb-1" />
                                <p className="text-xs text-muted-foreground">Cargando resultados...</p>
                            </div>
                        )}

                        {/* Error */}
                        {errorMessage && (
                            <div className="px-3 py-2 border-b border-destructive/20 bg-destructive/5">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                    <p className="text-xs text-destructive">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Lista de opciones */}
                        <div className="max-h-[300px] overflow-y-auto">
                            {options.length === 0 && !isLoading && !errorMessage && (query ?? "").trim() !== "" && (
                                <div className="px-3 py-3 text-center">
                                    <p className="text-xs text-muted-foreground">{emptyMessage}</p>
                                </div>
                            )}
                            {options.map((opt, index) => {
                                const optVal = (opt as unknown as SearchableOption).value ?? `opt-${index}`;
                                const isSelected = optVal === value;
                                const isHighlighted = highlightedIndex === index;
                                return (
                                    <button
                                        key={`${optVal}-opt-${index}`}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Evitar que el input pierda el foco antes del clic
                                            handleSelectOption(opt);
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        disabled={
                                            disabled ||
                                            (opt as unknown as SearchableOption).disabled === true
                                        }
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left
                                            ${isSelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent hover:text-accent-foreground"}
                                            ${isHighlighted ? "bg-accent/50 text-accent-foreground" : ""}
                                            ${(opt as unknown as SearchableOption).disabled === true
                                                ? "text-muted-foreground cursor-not-allowed opacity-50"
                                                : "cursor-pointer"}
                                        `}
                                    >
                                        {optionRenderer(opt)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Cargar más */}
                        {currentPage < totalPages && !isLoading && options.length > 0 && (
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleLoadMore();
                                }}
                                className="w-full px-3 py-2 text-xs text-primary hover:bg-accent/50 text-center font-medium border-t border-input/40"
                            >
                                Cargar más resultados…
                            </button>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-[11px] font-semibold text-destructive">{error}</p>
            )}
        </div>
    );
}
