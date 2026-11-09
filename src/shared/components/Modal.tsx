import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

/** Debe coincidir con las clases `duration-*` de más abajo. */
const EXIT_DURATION_MS = 200;

const SIZES = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
} as const;

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    /** Icono opcional que se muestra junto al título. */
    icon?: IconDefinition;
    size?: keyof typeof SIZES;
    children?: ReactNode;
    /** Zona de acciones (botones). Se renderiza en una barra inferior. */
    footer?: ReactNode;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    hideCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    icon,
    size = "md",
    children,
    footer,
    closeOnBackdrop = true,
    closeOnEscape = true,
    hideCloseButton = false,
}: ModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const panelRef = useRef<HTMLDivElement>(null);

    // `mounted` mantiene el modal en el DOM mientras dura la animación de salida.
    // `entered` se activa un frame después de montar para que el navegador
    // registre el estado inicial y pueda animar hacia el estado visible.
    const [mounted, setMounted] = useState(isOpen);
    const [entered, setEntered] = useState(false);

    if (isOpen && !mounted) {
        setMounted(true);
    }

    useEffect(() => {
        if (isOpen) {
            let secondFrame = 0;
            const firstFrame = requestAnimationFrame(() => {
                secondFrame = requestAnimationFrame(() => setEntered(true));
            });
            return () => {
                cancelAnimationFrame(firstFrame);
                cancelAnimationFrame(secondFrame);
            };
        }

        const timeout = setTimeout(() => {
            setMounted(false);
            setEntered(false);
        }, EXIT_DURATION_MS);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    const visible = isOpen && entered;

    // Bloqueo de scroll del body (compensando el ancho de la barra de scroll)
    useEffect(() => {
        if (!mounted) return;

        const { body, documentElement } = document;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, [mounted]);

    // Foco: entra al modal al abrir y vuelve al elemento previo al cerrar
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        panelRef.current?.focus({ preventScroll: true });

        return () => previouslyFocused?.focus?.();
    }, [isOpen]);

    // Escape para cerrar + focus trap con Tab
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEscape) {
                event.stopPropagation();
                onClose();
                return;
            }

            if (event.key !== "Tab" || !panelRef.current) return;

            const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (focusables.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === panelRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeOnEscape, onClose]);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo */}
            <div
                aria-hidden="true"
                onMouseDown={closeOnBackdrop ? onClose : undefined}
                className={`absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity motion-reduce:transition-none ${visible ? "opacity-100 duration-300 ease-out" : "opacity-0 duration-200 ease-in"
                    }`}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`relative flex max-h-[calc(100dvh-2rem)] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface text-app-text shadow-2xl outline-none transition-[opacity,transform] motion-reduce:transition-none ${visible
                    ? "translate-y-0 scale-100 opacity-100 duration-300 ease-out"
                    : "translate-y-3 scale-95 opacity-0 duration-200 ease-in"
                    }`}
            >
                {/* Encabezado */}
                <header className="flex items-start gap-4 px-6 pt-6 pb-4">
                    {icon && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-sky/30 bg-brand-sky/15 text-brand-royal dark:text-brand-sky">
                            <FontAwesomeIcon icon={icon} />
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-app-text">
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className="mt-1 text-sm text-app-muted">
                                {description}
                            </p>
                        )}
                    </div>

                    {!hideCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="-mt-1.5 -mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-brand-sky/15 hover:text-brand-royal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky/50 dark:hover:text-brand-sky"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                </header>

                {/* Contenido */}
                {children && (
                    <div className={`flex-1 overflow-y-auto px-6 text-sm ${footer ? "pb-5" : "pb-6"}`}>
                        {children}
                    </div>
                )}

                {/* Acciones */}
                {footer && (
                    <footer className="flex flex-col-reverse gap-3 border-t border-app-border bg-app-surface-alt px-6 py-4 sm:flex-row sm:justify-end">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body,
    );
}
