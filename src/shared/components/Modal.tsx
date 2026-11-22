import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

/** Duración de la animación de salida en ms (debe sincronizarse con las clases Tailwind) */
const EXIT_DURATION_MS = 220;

const SIZES = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    '2xl': "max-w-7xl"
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
    // `entered` controla la interpolación visual entre estado oculto y visible.
    const [mounted, setMounted] = useState(isOpen);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (isOpen) {
            // eslint-disable-next-line
            setMounted(true);
            // Doble requestAnimationFrame garantiza que el DOM renderice primero
            // el estado inicial (opacity-0, scale-[0.97]) antes de aplicar la transición a visible
            let secondFrame = 0;
            const firstFrame = requestAnimationFrame(() => {
                secondFrame = requestAnimationFrame(() => {
                    setEntered(true);
                });
            });
            return () => {
                cancelAnimationFrame(firstFrame);
                cancelAnimationFrame(secondFrame);
            };
        } else {
            // Al cerrarse, quitamos la clase visible para iniciar la transición de salida
            setEntered(false);
            // Esperamos a que la animación CSS concluya antes de desmontar del DOM
            timer = setTimeout(() => {
                setMounted(false);
            }, EXIT_DURATION_MS);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Fondo / Backdrop con suave difuminado gradual */}
            <div
                aria-hidden="true"
                onMouseDown={closeOnBackdrop ? onClose : undefined}
                className={`fixed inset-0 bg-brand-navy/60 backdrop-blur-md transition-all motion-reduce:transition-none ${visible
                        ? "opacity-100 duration-300 ease-out pointer-events-auto"
                        : "opacity-0 duration-200 ease-in pointer-events-none"
                    }`}
            />

            {/* Panel del Modal con interpolación suave tipo resorte (ease-out cubic al entrar, ease-in al salir) */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`relative flex max-h-[calc(100dvh-2.5rem)] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface text-app-text shadow-2xl outline-none transform-gpu will-change-[transform,opacity] transition-all motion-reduce:transition-none ${visible
                        ? "translate-y-0 scale-100 opacity-100 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto"
                        : "translate-y-4 sm:translate-y-6 scale-[0.97] opacity-0 duration-200 ease-in pointer-events-none"
                    }`}
            >
                {/* Encabezado */}
                <header className="flex items-start gap-4 px-6 pt-6 pb-4 border-b border-app-border/40 bg-app-surface">
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
                            className="-mt-1.5 -mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-app-muted transition-all duration-150 hover:bg-brand-sky/15 hover:text-brand-royal hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky/50 dark:hover:text-brand-sky"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                </header>

                {/* Contenido */}
                {children && (
                    <div className={`flex-1 overflow-y-auto px-6 text-sm ${footer ? "py-5" : "pt-4 pb-6"}`}>
                        {children}
                    </div>
                )}

                {/* Acciones */}
                {footer && (
                    <footer className="flex flex-col-reverse gap-3 border-t border-app-border bg-app-surface-alt/80 px-6 py-4 sm:flex-row sm:justify-end">
                        {footer}
                    </footer>
                )}
            </div>
        </div>,
        document.body,
    );
}
