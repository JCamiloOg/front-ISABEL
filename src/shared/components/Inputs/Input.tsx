import { useState, forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    helper?: string;
    error?: string;
    /** Icono a la izquierda del campo (FontAwesome IconDefinition o nodo React) */
    iconLeft?: ReactNode | IconDefinition;
    /** Icono a la derecha del campo (FontAwesome IconDefinition o nodo React) */
    iconRight?: ReactNode | IconDefinition;
    /** Soporte retrocompatible */
    icon?: IconDefinition | ReactNode;
    helperText?: string;
    /** "sm" | "md" — default: "md" */
    size?: "sm" | "md";
    containerClassName?: string;
    onRightIconClick?: () => void;
}

const renderIcon = (iconTarget?: ReactNode | IconDefinition) => {
    if (!iconTarget) return null;
    if (typeof iconTarget === "object" && "icon" in (iconTarget as object) && "prefix" in (iconTarget as object)) {
        return <FontAwesomeIcon icon={iconTarget as IconDefinition} className="text-sm" />;
    }
    return <>{iconTarget}</>;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helper,
            helperText,
            error,
            iconLeft,
            iconRight,
            icon,
            onRightIconClick,
            size = "md",
            type = "text",
            disabled,
            id,
            className,
            containerClassName = "",
            ...rest
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        const effectiveHelper = helper ?? helperText;
        const hasError = Boolean(error);
        const resolvedIconLeft = iconLeft ?? icon;
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        const sizeStyles = {
            sm: "py-1.5 text-xs rounded-lg min-h-[34px]",
            md: "py-2.5 text-sm rounded-xl min-h-[42px]",
        };

        return (
            <div className={`w-full flex flex-col ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${hasError
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
                    className={`relative flex items-center w-full transition-all rounded-xl ${disabled ? "opacity-60 cursor-not-allowed" : ""
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

                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? `${inputId}-error` : effectiveHelper ? `${inputId}-helper` : undefined
                        }
                        className={`isabel-input ${sizeStyles[size]} ${resolvedIconLeft ? "pl-10" : "pl-3.5"
                            } ${isPassword || iconRight ? "pr-10" : "pr-3.5"} ${hasError
                                ? "border-rose-500! !focus:border-rose-500 !focus:ring-rose-500/20 text-rose-600 dark:text-rose-400"
                                : ""
                            } ${className ?? ""}`}
                        {...rest}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                            className="absolute right-3.5 flex items-center text-app-muted hover:text-brand-royal dark:hover:text-brand-sky cursor-pointer transition-colors z-10"
                            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                        </button>
                    ) : iconRight ? (
                        <button
                            type="button"
                            onClick={onRightIconClick}
                            disabled={!onRightIconClick}
                            tabIndex={onRightIconClick ? 0 : -1}
                            className={`absolute right-3.5 flex items-center z-10 ${onRightIconClick
                                    ? "text-app-muted hover:text-brand-royal dark:hover:text-brand-sky cursor-pointer"
                                    : "pointer-events-none text-brand-navy/40 dark:text-brand-sky/60"
                                } transition-colors`}
                            aria-hidden={!onRightIconClick}
                        >
                            {renderIcon(iconRight)}
                        </button>
                    ) : null}
                </div>

                {/* Texto de ayuda o error — solo uno a la vez */}
                {(hasError || effectiveHelper) && (
                    <p
                        id={hasError ? `${inputId}-error` : `${inputId}-helper`}
                        className={`mt-1.5 text-xs font-medium ${hasError ? "text-rose-500 dark:text-rose-400" : "text-app-muted"
                            }`}
                        role={hasError ? "alert" : undefined}
                    >
                        {error ?? effectiveHelper}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
