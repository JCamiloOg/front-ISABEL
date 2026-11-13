import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxesStacked,
    faEye,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import type { ProductoConRelaciones } from "../../@types/Products";

interface CardProductProps {
    producto: ProductoConRelaciones;
    className?: string;
}

// Imágenes de respaldo de alta calidad por SKU
const FALLBACK_IMAGES: Record<string, string> = {
    "NK-AF1-001": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80",
    "AD-UBL-002": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    "PM-SDC-003": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=700&q=80",
    "NB-574-004": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80",
    "CV-CTA-005": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=700&q=80",
};

export default function CardProduct({ producto, className = "" }: CardProductProps) {
    const [imgError, setImgError] = useState(false);

    // Obtener la primera imagen del primer color que tenga imágenes disponibles
    const primerColorConImagenes = producto.colores.find(
        (c) => Array.isArray(c.imagenes) && c.imagenes.length > 0
    );
    const imagenOriginal = primerColorConImagenes?.imagenes[0];

    // Si la imagen falla o es un placeholder de prueba, usamos fallback de calzado
    const imagenSrc =
        imgError || !imagenOriginal || imagenOriginal.includes("example.com")
            ? FALLBACK_IMAGES[producto.sku] || "/shoesGreenSplash.jpg"
            : imagenOriginal;

    // Calcular el stock total sumando variantes activas
    const stockTotal = producto.colores.reduce((accColor, color) => {
        return (
            accColor +
            color.variantes.reduce((accVar, variante) => {
                return accVar + (variante.stockActual || 0);
            }, 0)
        );
    }, 0);

    // Verificar si alguna variante tiene descuento
    const maxDescuento = producto.colores.reduce((max, color) => {
        const descColor = Math.max(
            0,
            ...color.variantes.map((v) => Number(v.descuento) || 0)
        );
        return Math.max(max, descColor);
    }, 0);

    // Formatear precio COP
    const precioFormateado = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(producto.precioVenta);

    return (
        <div
            className={`group relative flex flex-col isabel-card justify-between transition-all duration-300 hover:-translate-y-1 ${className}`}
        >
            {/* Contenedor Superior: Imagen y Badges */}
            <div className="relative aspect-square w-full overflow-hidden bg-brand-sky/10 dark:bg-brand-surface-alt">
                <img
                    src={imagenSrc}
                    alt={producto.nombre}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                />

                {/* Overlay de acción rápida en hover */}
                <div className="absolute inset-0 bg-brand-navy/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-brand-navy/95 text-brand-navy dark:text-brand-sky text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                        <span>Ver Detalle</span>
                    </span>
                </div>

                {/* Badge Superior Izquierdo: Género */}
                <span className="badge-navy absolute top-3 left-3 shadow-xs">
                    {producto.genero}
                </span>

                {/* Badge Superior Derecho: Descuento o Disponibilidad */}
                {maxDescuento > 0 ? (
                    <span className="badge-royal absolute top-3 right-3 shadow-xs bg-emerald-600 text-[10px]">
                        -{maxDescuento}% OFF
                    </span>
                ) : (
                    <span className="badge-sky absolute top-3 right-3 shadow-xs text-[10px] bg-white/90 dark:bg-brand-navy/90 backdrop-blur-xs">
                        SKU: {producto.sku}
                    </span>
                )}
            </div>

            {/* Contenido / Información Comercial */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-app-muted">
                        <span className="font-semibold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                            {producto.colores.length} {producto.colores.length === 1 ? "Color" : "Colores"}
                        </span>

                        <span className="inline-flex items-center gap-1 font-medium">
                            <FontAwesomeIcon icon={faBoxesStacked} className="text-[10px]" />
                            <span>{stockTotal} pares disp.</span>
                        </span>
                    </div>

                    {/* Nombre del producto */}
                    <h3
                        className="font-bold text-sm sm:text-base text-app-text line-clamp-1 group-hover:text-brand-royal dark:group-hover:text-brand-sky transition-colors"
                        title={producto.nombre}
                    >
                        {producto.nombre}
                    </h3>
                </div>

                {/* Precio y Botón de Enlace al Detalle /products/:SKU */}
                <div className="pt-2 border-t border-app-border flex items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
                            Precio Bodega
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-brand-royal dark:text-brand-sky leading-none">
                            {precioFormateado}
                        </span>
                    </div>

                    {/* Botón que navega a /products/:SKU */}
                    <Link
                        to={`/products/${producto.sku}`}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-brand-royal hover:bg-brand-navy dark:hover:bg-brand-sky dark:hover:text-brand-navy text-white font-semibold text-xs transition-colors duration-200 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title={`Ver detalles de ${producto.nombre}`}
                        aria-label={`Ver detalles de ${producto.nombre}`}
                    >
                        <span className="hidden sm:inline">Ver</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </Link>
                </div>
            </div>

            {/* Enlace global invisible para toda la tarjeta */}
            <Link
                to={`/products/${producto.sku}`}
                aria-label={`Ir a ${producto.nombre}`}
                className="absolute inset-0 z-0"
                tabIndex={-1}
            />
        </div>
    );
}
