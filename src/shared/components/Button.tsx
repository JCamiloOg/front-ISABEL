import React, { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

export type ButtonVariant = "primary" | "outline" | "ghost" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconDefinition;
  rightIcon?: IconDefinition;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      rightIcon,
      isLoading = false,
      loadingText,
      fullWidth = false,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Variantes según los tokens y clases del sistema
    const variantStyles: Record<ButtonVariant, string> = {
      primary: "btn-primary",
      outline: "btn-outline",
      ghost: "btn-ghost",
      accent: "btn-accent",
    };

    // Escalas de tamaño equilibradas
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "!py-1.5 !px-3.5 !text-xs !rounded-lg",
      md: "!py-2.5 !px-5 !text-sm !rounded-xl",
      lg: "!py-3.5 !px-6 !text-base !rounded-xl",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`${variantStyles[variant]} ${sizeStyles[size]} ${
          fullWidth ? "w-full" : ""
        } ${isLoading ? "cursor-wait opacity-80" : ""} ${className}`}
        {...props}
      >
        {/* Spinner animado cuando está en estado de carga */}
        {isLoading ? (
          <>
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-sm" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {icon && <FontAwesomeIcon icon={icon} className="text-sm" />}
            {children && <span>{children}</span>}
            {rightIcon && <FontAwesomeIcon icon={rightIcon} className="text-sm" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

