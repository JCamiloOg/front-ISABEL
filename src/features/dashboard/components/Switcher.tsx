import React from "react";

export interface SwitcherProps {
    /**
     * Estado booleano actual (true: Activo, false: Inactivo)
     */
    checked: boolean;
    /**
     * Callback invocado al alternar el estado
     */
    onChange?: (checked: boolean) => void;
    /**
     * Deshabilitar la interacción
     */
    disabled?: boolean;
    /**
     * Mostrar u ocultar la etiqueta de texto ("Activo" / "Inactivo")
     * Por defecto true
     */
    showLabel?: boolean;
    /**
     * Etiquetas personalizadas (por defecto "Activo" / "Inactivo")
     */
    labels?: {
        active?: string;
        inactive?: string;
    };
    /**
     * Tamaño del switch ('sm' | 'md' | 'lg')
     * Por defecto 'md'
     */
    size?: "sm" | "md" | "lg";
    /**
     * Clases adicionales para el contenedor
     */
    className?: string;
    /**
     * Accesibilidad aria-label
     */
    ariaLabel?: string;
}

export const Switcher: React.FC<SwitcherProps> = ({
    checked,
    onChange,
    disabled = false,
    showLabel = true,
    labels = { active: "Activo", inactive: "Inactivo" },
    size = "md",
    className = "",
    ariaLabel,
}) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || !onChange) return;
        onChange(!checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled || !onChange) return;
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onChange(!checked);
        }
    };

    // Dimensiones según el tamaño
    const sizeConfig = {
        sm: {
            track: "w-8 h-4.5 p-0.5",
            thumb: "w-3.5 h-3.5",
            translate: "translate-x-3.5",
            text: "text-[11px]",
            gap: "gap-1.5",
        },
        md: {
            track: "w-11 h-6 p-0.5",
            thumb: "w-5 h-5",
            translate: "translate-x-5",
            text: "text-xs",
            gap: "gap-2.5",
        },
        lg: {
            track: "w-14 h-7.5 p-1",
            thumb: "w-5.5 h-5.5",
            translate: "translate-x-6.5",
            text: "text-sm",
            gap: "gap-3",
        },
    }[size];

    const activeLabel = labels.active || "Activo";
    const inactiveLabel = labels.inactive || "Inactivo";

    return (
        <div
            className={`inline-flex items-center select-none ${sizeConfig.gap} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                } ${className}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel || (checked ? activeLabel : inactiveLabel)}
            tabIndex={disabled ? -1 : 0}
        >
            {/* Píldora del Switch (Track) */}
            <div
                className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-250 ease-in-out shadow-inner ${sizeConfig.track
                    } ${checked
                        ? "bg-[#059669] dark:bg-[#10B981]" // Verde esmeralda nítido idéntico a la imagen de referencia
                        : "bg-[#D1D5DB] dark:bg-[#475569]" // Gris claro suave desactivado
                    }`}
            >
                {/* Círculo Blanco Flotante (Thumb) */}
                <span
                    className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md transition-transform duration-250 ease-in-out ${sizeConfig.thumb
                        } ${checked ? sizeConfig.translate : "translate-x-0"}`}
                />
            </div>

            {/* Etiqueta de Texto Dinámica */}
            {showLabel && (
                <span
                    className={`font-bold transition-colors duration-200 ${sizeConfig.text} ${checked
                        ? "text-[#065F46] dark:text-[#34D399]" // Verde bosque para Activo
                        : "text-isabel-muted dark:text-[#94A3B8]" // Gris neutro para Inactivo
                        }`}
                >
                    {checked ? activeLabel : inactiveLabel}
                </span>
            )}
        </div>
    );
};

export default Switcher;