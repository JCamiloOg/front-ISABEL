import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    label?: string;
    helper?: string;
    error?: string;
    /** Icono a la izquierda del campo (FontAwesome IconDefinition o nodo React) */
    iconLeft?: ReactNode | IconDefinition;
    /** Soporte retrocompatible */
    icon?: IconDefinition | ReactNode;
    /** Opciones estructuradas opcionales (o pasar <option> como children) */
    options?: SelectOption[];
    /** "sm" | "md" — default: "md" */
    size?: "sm" | "md";
    /** Contenedor opcional */
    containerClassName?: string;
    children?: ReactNode;
}

const renderIcon = (iconTarget?: ReactNode | IconDefinition) => {
    if (!iconTarget) return null;
    if (typeof iconTarget === "object" && "icon" in (iconTarget as object) && "prefix" in (iconTarget as object)) {
        return <FontAwesomeIcon icon={iconTarget as IconDefinition} className="text-sm" />;
    }
    return <>{iconTarget}</>;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            helper,
            error,
            iconLeft,
            icon,
            options,
            size = "md",
            disabled,
            id,
            className,
            containerClassName = "",
            children,
            ...rest
        },
        ref
    ) => {
        const hasError = Boolean(error);
        const resolvedIconLeft = iconLeft ?? icon;
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        const sizeStyles = {
            sm: "py-1.5 text-xs rounded-lg min-h-[34px]",
            md: "py-2.5 text-sm rounded-xl min-h-[42px]",
        };

        return (
            <div className={`w-full flex flex-col ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${
                            hasError
                                ? "text-rose-500 dark:text-rose-400"
                                : disabled
                                ? "text-app-muted/60"
                                : "text-app-text"
                        }`}
                    >
                        {label}
                    </label>
                )}

                <div
                    className={`relative flex items-center w-full transition-all rounded-xl ${
                        disabled ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    {resolvedIconLeft && (
                        <span
                            className="absolute left-3.5 flex items-center justify-center pointer-events-none text-brand-navy/40 dark:text-brand-sky/60 z-10"
                            aria-hidden="true"
                        >
                            {renderIcon(resolvedIconLeft)}
                        </span>
                    )}

                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            error ? `${selectId}-error` : helper ? `${selectId}-helper` : undefined
                        }
                        className={`isabel-input ${sizeStyles[size]} ${
                            resolvedIconLeft ? "pl-10" : "pl-3.5"
                        } pr-10 appearance-none cursor-pointer bg-app-surface ${
                            hasError
                                ? "border-rose-500! !focus:border-rose-500 !focus:ring-rose-500/20 text-rose-600 dark:text-rose-400"
                                : ""
                        } ${className ?? ""}`}
                        {...rest}
                    >
                        {options
                            ? options.map((opt) => (
                                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                      {opt.label}
                                  </option>
                              ))
                            : children}
                    </select>

                    {/* Icono de flecha hacia abajo a la derecha */}
                    <span
                        className="absolute right-3.5 flex items-center justify-center pointer-events-none text-brand-navy/50 dark:text-brand-sky/70 z-10"
                        aria-hidden="true"
                    >
                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                    </span>
                </div>

                {/* Texto de ayuda o error */}
                {(hasError || helper) && (
                    <p
                        id={hasError ? `${selectId}-error` : `${selectId}-helper`}
                        className={`mt-1.5 text-xs font-medium ${
                            hasError ? "text-rose-500 dark:text-rose-400" : "text-app-muted"
                        }`}
                        role={hasError ? "alert" : undefined}
                    >
                        {error ?? helper}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
