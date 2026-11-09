import { forwardRef } from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helper?: string;
    error?: string;
    /** Icono en la esquina superior izquierda */
    iconLeft?: ReactNode | IconDefinition;
    /** Soporte retrocompatible */
    icon?: IconDefinition | ReactNode;
    /** "sm" | "md" — default: "md" */
    size?: "sm" | "md";
    /** Contenedor opcional */
    containerClassName?: string;
    /** Contador opcional de caracteres actuales / máximos */
    showCount?: boolean;
    currentLength?: number;
}

const renderIcon = (iconTarget?: ReactNode | IconDefinition) => {
    if (!iconTarget) return null;
    if (typeof iconTarget === "object" && "icon" in (iconTarget as object) && "prefix" in (iconTarget as object)) {
        return <FontAwesomeIcon icon={iconTarget as IconDefinition} className="text-sm" />;
    }
    return <>{iconTarget}</>;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            helper,
            error,
            iconLeft,
            icon,
            size = "md",
            disabled,
            id,
            rows = 4,
            maxLength,
            currentLength,
            className,
            containerClassName = "",
            ...rest
        },
        ref
    ) => {
        const hasError = Boolean(error);
        const resolvedIconLeft = iconLeft ?? icon;
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        const sizeStyles = {
            sm: "py-2 text-xs rounded-lg",
            md: "py-2.5 text-sm rounded-xl",
        };

        return (
            <div className={`w-full flex flex-col ${containerClassName}`}>
                {label && (
                    <div className="flex items-center justify-between mb-2">
                        <label
                            htmlFor={textareaId}
                            className={`block text-xs font-bold uppercase tracking-wider transition-colors ${hasError
                                    ? "text-rose-500 dark:text-rose-400"
                                    : disabled
                                        ? "text-app-muted/60"
                                        : "text-app-text"
                                }`}
                        >
                            {label}
                        </label>

                        {maxLength && typeof currentLength === "number" && (
                            <span className="text-[11px] text-app-muted">
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                )}

                <div
                    className={`relative flex w-full transition-all rounded-xl ${disabled ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                >
                    {resolvedIconLeft && (
                        <span
                            className="absolute left-3.5 top-3 flex items-center justify-center pointer-events-none text-brand-navy/40 dark:text-brand-sky/60 z-10"
                            aria-hidden="true"
                        >
                            {renderIcon(resolvedIconLeft)}
                        </span>
                    )}

                    <textarea
                        ref={ref}
                        id={textareaId}
                        rows={rows}
                        maxLength={maxLength}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            error ? `${textareaId}-error` : helper ? `${textareaId}-helper` : undefined
                        }
                        className={`isabel-input resize-y min-h-22.5 ${sizeStyles[size]} ${resolvedIconLeft ? "pl-10" : "pl-3.5"
                            } pr-3.5 ${hasError
                                ? "border-rose-500! !focus:border-rose-500 !focus:ring-rose-500/20 text-rose-600 dark:text-rose-400"
                                : ""
                            } ${className ?? ""}`}
                        {...rest}
                    />
                </div>

                {/* Texto de ayuda o error */}
                {(hasError || helper) && (
                    <p
                        id={hasError ? `${textareaId}-error` : `${textareaId}-helper`}
                        className={`mt-1.5 text-xs font-medium ${hasError ? "text-rose-500 dark:text-rose-400" : "text-app-muted"
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

Textarea.displayName = "Textarea";

export default Textarea;
