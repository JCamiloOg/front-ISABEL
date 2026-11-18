import { useState, useRef, useEffect, useId, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faChevronDown,
    faMagnifyingGlass,
    faXmark,
    faCheck,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export interface SelectBySearchOption<T = unknown> {
    value: string | number;
    label: string;
    sublabel?: string;
    description?: string;
    disabled?: boolean;
    raw?: T;
}

export interface SelectBySearchProps<T = unknown> {
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    options: SelectBySearchOption<T>[];
    value?: string | number | null;
    onChange: (value: string | number, selectedOption?: SelectBySearchOption<T>) => void;
    onSearchChange?: (searchTerm: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    error?: string;
    helperText?: string;
    iconLeft?: IconDefinition | ReactNode;
    clearable?: boolean;
    className?: string;
    size?: "sm" | "md";
}

export default function SelectBySearch<T = unknown>({
    label,
    placeholder = "Seleccionar opción...",
    searchPlaceholder = "Buscar...",
    options = [],
    value,
    onChange,
    onSearchChange,
    isLoading = false,
    disabled = false,
    error,
    helperText,
    iconLeft,
    clearable = true,
    className = "",
    size = "md",
}: SelectBySearchProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const id = useId();

    // Opción actualmente seleccionada
    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    // Manejo de búsqueda: si hay callback de búsqueda externa (API), se notifica;
    // de lo contrario, se filtra internamente.
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearchChange) {
            onSearchChange(query);
        }
    };

    const filteredOptions = onSearchChange
        ? options
        : options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    // Auto-focus en el input de búsqueda al abrir el dropdown
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            // eslint-disable-next-line
            setSearchQuery("");
        }
    }, [isOpen]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Atajos de teclado (Escape)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const handleSelect = (option: SelectBySearchOption<T>) => {
        if (option.disabled) return;
        onChange(option.value, option);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("", undefined);
        setSearchQuery("");
        if (onSearchChange) {
            onSearchChange("");
        }
    };

    const renderLeftIcon = () => {
        if (!iconLeft) return null;
        if (typeof iconLeft === "object" && "icon" in (iconLeft as object) && "prefix" in (iconLeft as object)) {
            return <FontAwesomeIcon icon={iconLeft as IconDefinition} className="text-app-muted text-xs shrink-0" />;
        }
        return <span className="shrink-0">{iconLeft as ReactNode}</span>;
    };

    return (
        <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-xs font-bold text-app-text select-none flex items-center justify-between"
                >
                    <span>{label}</span>
                    {isLoading && (
                        <span className="flex items-center gap-1 text-[10px] text-brand-royal dark:text-brand-sky font-normal">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                            Buscando...
                        </span>
                    )}
                </label>
            )}

            {/* Botón Disparador del Select */}
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`group relative flex w-full items-center justify-between gap-2 rounded-xl border bg-app-surface transition-all duration-200 outline-none text-left cursor-pointer ${size === "sm" ? "px-3 py-1.5 text-xs min-h-9" : "px-3.5 py-2.5 text-sm min-h-10.5"
                    } ${error
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : isOpen
                            ? "border-brand-royal dark:border-brand-sky ring-2 ring-brand-royal/20 dark:ring-brand-sky/20"
                            : "border-app-border hover:border-brand-royal/50 dark:hover:border-brand-sky/50"
                    } ${disabled ? "opacity-50 cursor-not-allowed bg-app-surface-alt" : ""}`}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {renderLeftIcon()}
                    {selectedOption ? (
                        <div className="flex flex-col min-w-0">
                            <span className="truncate font-semibold text-app-text text-xs sm:text-sm">
                                {selectedOption.label}
                            </span>
                            {selectedOption.sublabel && (
                                <span className="truncate text-[10px] text-app-muted">
                                    {selectedOption.sublabel}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-app-muted/60 text-xs sm:text-sm truncate select-none">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-app-muted">
                    {clearable && selectedOption && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            className="p-1 rounded-full hover:bg-app-surface-alt hover:text-rose-500 transition-colors cursor-pointer"
                            title="Limpiar selección"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </span>
                    )}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-xs transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-royal dark:text-brand-sky" : ""}`}
                    />
                </div>
            </button>

            {/* Menú Desplegable Flotante */}
            {isOpen && (
                <div
                    role="listbox"
                    className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-2xl border border-app-border bg-app-surface shadow-2xl overflow-hidden animate-fadeIn duration-150"
                    style={{ minWidth: "220px" }}
                >
                    {/* Barra de Búsqueda Interna */}
                    <div className="p-2 border-b border-app-border/70 bg-app-surface-alt">
                        <div className="relative flex items-center">
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="absolute left-3 text-app-muted text-xs pointer-events-none"
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                placeholder={searchPlaceholder}
                                className="w-full rounded-xl border border-app-border bg-app-surface pl-8 pr-7 py-1.5 text-xs text-app-text placeholder:text-app-muted/60 outline-none focus:border-brand-royal dark:focus:border-brand-sky focus:ring-1 focus:ring-brand-royal/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        if (onSearchChange) onSearchChange("");
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-2.5 text-app-muted hover:text-app-text p-0.5 rounded cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Opciones */}
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-transparent">
                        {isLoading ? (
                            <div className="py-6 text-center text-xs text-app-muted flex flex-col items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm text-brand-royal dark:text-brand-sky" />
                                <span>Buscando resultados...</span>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-xs text-app-muted italic">
                                {searchQuery
                                    ? `No se encontraron resultados para "${searchQuery}"`
                                    : "No hay opciones disponibles."}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);

                                return (
                                    <div
                                        key={String(opt.value)}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(opt)}
                                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${isSelected
                                            ? "bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-bold"
                                            : opt.disabled
                                                ? "opacity-40 cursor-not-allowed text-app-muted"
                                                : "text-app-text hover:bg-app-surface-alt hover:text-brand-royal dark:hover:text-brand-sky"
                                            }`}
                                    >
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="truncate">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="text-[10px] text-app-muted truncate mt-0.5">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                            {opt.description && (
                                                <span className="text-[10px] text-app-muted/75 truncate">
                                                    {opt.description}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                className="text-xs text-brand-royal dark:text-brand-sky shrink-0"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Helper o Error text */}
            {error ? (
                <span className="text-[11px] font-semibold text-rose-500">{error}</span>
            ) : helperText ? (
                <span className="text-[11px] text-app-muted">{helperText}</span>
            ) : null}
        </div>
    );
}

export { SelectBySearch };
