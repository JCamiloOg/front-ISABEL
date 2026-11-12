import { useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faTrashCan,
    faPlus,
    faMinus,
    faArrowRight,
    faBagShopping,
    faShieldHalved,
    faTruckFast,
    faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import useCart from "../../../shared/hooks/useCart";
import { Link } from "@tanstack/react-router";

export default function Cart() {
    const {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        removeFromCart,
        plusOne,
        deductOne,
        totalCartPrice,
        totalCartItems,
        clearCart,
    } = useCart();

    // Cerrar al pulsar Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && isCartOpen) {
            setIsCartOpen(false);
        }
    }, [isCartOpen, setIsCartOpen]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Bloquear scroll del body cuando el offcanvas esté abierto
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isCartOpen]);

    const totalArticulos = totalCartItems();
    const subtotal = totalCartPrice();

    const calcularPrecioConDescuento = (precio: number, descuento: number) => {
        if (!descuento) return precio;
        return precio - (precio * descuento) / 100;
    };

    return (
        <>
            {/* Backdrop oscuro con blur y fade suave */}
            <div
                className={`fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsCartOpen(false)}
                aria-hidden="true"
            />

            {/* Panel Offcanvas Derecho */}
            <aside
                aria-label="Carrito de compras"
                aria-modal="true"
                role="dialog"
                className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md bg-app-surface border-l border-app-border shadow-2xl transition-transform duration-300 ease-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* ─── ENCABEZADO ─── */}
                <div className="flex items-center justify-between p-5 border-b border-app-border bg-app-surface/90 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-lg">
                            <FontAwesomeIcon icon={faBagShopping} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-app-text leading-tight">
                                    Tu Carrito
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-sky/20 text-brand-royal dark:text-brand-sky">
                                    {totalArticulos} {totalArticulos === 1 ? "par" : "pares"}
                                </span>
                            </div>
                            <p className="text-[11px] text-app-muted">
                                Precios mayoristas de bodega
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {cartItems.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="p-2 rounded-lg text-app-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors cursor-pointer"
                                title="Vaciar carrito"
                                aria-label="Vaciar carrito"
                            >
                                <FontAwesomeIcon icon={faRotateLeft} className="mr-1 text-[10px]" />
                                <span className="text-[11px] font-medium hidden sm:inline">Vaciar</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(false)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-app-muted hover:text-app-text hover:bg-brand-sky/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Cerrar carrito"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-base" />
                        </button>
                    </div>
                </div>

                {/* ─── CUERPO / LISTA DE ITEMS ─── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scrollbar-thin">
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => {
                            const precioFinal = calcularPrecioConDescuento(item.precioVenta, item.descuento);
                            const totalFila = precioFinal * item.cantidad;

                            return (
                                <div
                                    key={item.idVariante}
                                    className="group relative flex gap-3.5 p-3 rounded-2xl bg-app-surface-alt border border-app-border hover:border-brand-sky/40 transition-all duration-200"
                                >
                                    {/* Imagen del zapato con enlace */}
                                    <Link
                                        to="/products/$SKU"
                                        params={{ SKU: String(item.sku) }}
                                        onClick={() => setIsCartOpen(false)}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-app-border flex items-center justify-center group-hover:scale-102 transition-transform"
                                    >
                                        <img
                                            src={item.imagen || "/shoesGreenSplash.jpg"}
                                            alt={item.nombreProducto}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = "/shoesGreenSplash.jpg";
                                            }}
                                        />
                                        {item.descuento > 0 && (
                                            <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[9px] font-extrabold shadow-xs">
                                                -{item.descuento}%
                                            </span>
                                        )}
                                    </Link>

                                    {/* Detalles del producto */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <Link
                                                    to="/products/$SKU"
                                                    params={{ SKU: String(item.sku) }}
                                                    onClick={() => setIsCartOpen(false)}
                                                    className="text-xs font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky truncate leading-snug transition-colors"
                                                    title={item.nombreProducto}
                                                >
                                                    {item.nombreProducto}
                                                </Link>

                                                {/* Botón eliminar */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.idVariante)}
                                                    className="text-app-muted hover:text-rose-500 p-1 -mt-1 -mr-1 transition-colors cursor-pointer"
                                                    title="Eliminar del carrito"
                                                    aria-label={`Eliminar ${item.nombreProducto}`}
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                                                </button>
                                            </div>

                                            {/* Badges de color y talla */}
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-app-muted">
                                                <span className="px-2 py-0.5 rounded-md bg-app-surface border border-app-border font-medium">
                                                    Color: <strong className="text-app-text">{item.color}</strong>
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-app-surface border border-app-border font-medium">
                                                    Talla: <strong className="text-app-text">{item.talla}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fila de Controles de Cantidad y Precio */}
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-app-border/60">
                                            {/* Selector de Cantidad */}
                                            <div className="inline-flex items-center rounded-xl bg-app-surface border border-app-border shadow-2xs p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => deductOne(item.idVariante)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-lg text-app-muted hover:text-app-text hover:bg-brand-sky/10 transition-colors cursor-pointer"
                                                    aria-label="Restar una unidad"
                                                >
                                                    <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                                                </button>
                                                <span className="w-7 text-center text-xs font-bold text-app-text select-none">
                                                    {item.cantidad}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => plusOne(item.idVariante)}
                                                    disabled={Boolean(item.stockDisponible && item.cantidad >= item.stockDisponible)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-lg text-app-muted hover:text-app-text hover:bg-brand-sky/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                    aria-label="Sumar una unidad"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                                                </button>
                                            </div>

                                            {/* Precios */}
                                            <div className="text-right">
                                                <div className="text-xs font-extrabold text-brand-royal dark:text-brand-sky">
                                                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totalFila)} COP
                                                </div>
                                                {item.cantidad > 1 && (
                                                    <div className="text-[10px] text-app-muted">
                                                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precioFinal)} COP c/u
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* Estado Vacío */
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                            <div className="w-16 h-16 rounded-3xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-2xl mb-4 shadow-inner">
                                <FontAwesomeIcon icon={faBagShopping} />
                            </div>
                            <h3 className="text-base font-bold text-app-text mb-1">
                                Tu carrito está vacío
                            </h3>
                            <p className="text-xs text-app-muted max-w-xs mb-6">
                                Explora nuestra bodega de calzado y aprovecha los precios por pares o surtidos.
                            </p>
                            <Link
                                to="/catalog"
                                onClick={() => setIsCartOpen(false)}
                                className="btn-primary text-xs! py-2.5! px-5!"
                            >
                                <span>Ver Catálogo de Calzado</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER CON TOTALES Y CHECKOUT ─── */}
                {cartItems.length > 0 && (
                    <div className="p-5 border-t border-app-border bg-app-surface/95 backdrop-blur-md space-y-3 shrink-0">
                        {/* Desglose de totales */}
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-app-muted">
                                <span>Artículos seleccionados:</span>
                                <span className="font-semibold text-app-text">{totalArticulos} pares</span>
                            </div>
                            <div className="flex justify-between text-app-muted">
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faTruckFast} className="text-brand-royal dark:text-brand-sky" />
                                    Despacho bodega:
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Calculado al pagar
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-app-border">
                                <span className="text-sm font-bold text-app-text">Subtotal estimado:</span>
                                <span className="text-lg font-extrabold text-brand-royal dark:text-brand-sky">
                                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(subtotal)} COP
                                </span>
                            </div>
                        </div>

                        {/* Botón de Checkout */}
                        <button
                            type="button"
                            className="btn-primary w-full py-3! text-sm! font-bold! shadow-md shadow-brand-royal/20 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            <span>Continuar con el Pedido</span>
                            <FontAwesomeIcon
                                icon={faArrowRight}
                                className="text-xs transition-transform group-hover:translate-x-1"
                            />
                        </button>

                        <div className="flex items-center justify-center gap-2 text-[10px] text-app-muted pt-1">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-xs" />
                            <span>Compra mayorista directa y segura con Bodega Isabel</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
