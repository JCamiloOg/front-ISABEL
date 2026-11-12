import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faTruckFast,
    faShoppingCart,
    faCheck,
    // faHeart,
    faLayerGroup,
    faTriangleExclamation,
    faPalette,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { productRoute } from "../../../app/Routes";
import { MOCK_PRODUCTOS_PRISMA } from "../../../data/products";
import Button from "../../../shared/components/Button";
import { Toast } from "../../../shared/utils/alerts";
import useCart from "../../../shared/hooks/useCart";
import type { CartItemType } from "../../../shared/context/cart.context";
import { useUser } from "../../../shared/hooks/useUser";

// Nombres y tonos representativos según idColor
const COLOR_MAP: Record<number, { name: string; hex: string; border?: string }> = {
    101: { name: "Blanco Puro", hex: "#FFFFFF", border: "#E2E8F0" },
    102: { name: "Negro Obsidiana", hex: "#111827" },
    103: { name: "Azul Real", hex: "#2B62D9" },
    104: { name: "Gris Platino", hex: "#94A3B8" },
    105: { name: "Rojo Carmesí", hex: "#E11D48" },
    106: { name: "Miel / Trigo", hex: "#D97706" },
    107: { name: "Tiza Vintage", hex: "#F5F5F4", border: "#D6D3D1" },
};

export default function ProductPage() {
    const { SKU } = productRoute.useParams();
    const { addToCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    // Búsqueda del producto por SKU
    const producto = MOCK_PRODUCTOS_PRISMA.find(
        (p) => p.sku.toLowerCase() === SKU.toLowerCase()
    );

    // Estados de selección del comprador
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedTallaId, setSelectedTallaId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    // const [isFavorite, setIsFavorite] = useState(false);

    // Color seleccionado y sus variantes
    const colorActual = producto?.colores[selectedColorIndex] || producto?.colores[0];
    const variantesDisponibles = colorActual?.variantes || [];

    // Lista de imágenes del color seleccionado
    const imagenesDelColor = useMemo(() => {
        if (colorActual?.imagenes && colorActual.imagenes.length > 0) {
            return colorActual.imagenes;
        }
        return ["/shoesGreenSplash.jpg"];
    }, [colorActual]);

    // Imagen activa actual
    const imagenActiva = imagenesDelColor[selectedImageIndex] || imagenesDelColor[0];

    // Si no existe el producto
    if (!producto) {
        return (
            <div className="section-container py-24 text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center mx-auto text-2xl">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-app-text">
                        Referencia no encontrada
                    </h1>
                    <p className="text-sm text-app-muted max-w-md mx-auto">
                        No encontramos en el inventario de bodega ningún calzado asociado al código SKU:{" "}
                        <span className="font-bold text-brand-royal dark:text-brand-sky">{SKU}</span>
                    </p>
                </div>
                <Link to="/" className="btn-primary inline-flex">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    <span>Volver a la Bodega</span>
                </Link>
            </div>
        );
    }

    // Cálculo del stock total del producto
    const stockTotalProducto = producto.colores.reduce((acc, c) => {
        return (
            acc +
            c.variantes.reduce((sum, v) => sum + (v.stockActual || 0), 0)
        );
    }, 0);

    // Variante seleccionada por talla
    const selectedColor = producto.colores[selectedColorIndex];
    const varianteSeleccionada = selectedColor?.variantes.find(
        (v) => v.idVariante === selectedTallaId
    );

    // Determinar si hay descuento aplicable (por variante seleccionada o máximo del color actual)
    const descuentoAplicable = useMemo(() => {
        if (varianteSeleccionada) {
            return varianteSeleccionada.descuento || 0;
        }
        // Si no hay talla seleccionada, mostrar el mayor descuento disponible en este color si existe
        return (
            selectedColor?.variantes.reduce((max, v) => Math.max(max, v.descuento || 0), 0) || 0
        );
    }, [varianteSeleccionada, selectedColor]);

    const tieneDescuento = descuentoAplicable > 0;
    const precioBase = producto.precioVenta;
    const precioFinal = tieneDescuento
        ? precioBase - (precioBase * descuentoAplicable) / 100
        : precioBase;

    // Formatear precios COP
    const formatCOP = (val: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(val);

    const precioVentaFormateado = formatCOP(precioFinal);
    const precioOriginalFormateado = formatCOP(precioBase);

    // Cambio de color: actualiza el índice y resetea la imagen a la primera del nuevo color
    const handleColorChange = (index: number) => {
        setSelectedColorIndex(index);
        setSelectedImageIndex(0);
        setSelectedTallaId(null);
    };

    // Navegación de imágenes en carrusel
    const handlePrevImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? imagenesDelColor.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === imagenesDelColor.length - 1 ? 0 : prev + 1
        );
    };

    // Manejar agregar al carrito / pedido
    const handleAddToCart = () => {
        if (!selectedTallaId) {
            Toast.fire({
                icon: "warning",
                title: "Selecciona una talla para continuar",
            });
            return;
        }
        const selectedColor = producto.colores[selectedColorIndex];
        const selectedSize = selectedColor.variantes.find(variante => variante.idVariante === selectedTallaId);

        if (!selectedSize) return Toast.fire({
            icon: "error",
            title: "Error al añadir el producto."
        });

        const productCart: CartItemType = {
            idProducto: producto.idProducto,
            nombreProducto: producto.nombre,
            color: COLOR_MAP[selectedColor.idColor].name,
            idProductoColor: selectedColor.idColor,
            imagen: selectedColor.imagenes[0],
            idVariante: selectedTallaId,
            descuento: selectedSize.descuento,
            stockDisponible: selectedSize.stockActual,
            talla: selectedSize.talla.numeroTalla,
            precioVenta: producto.precioVenta,
            cantidad: quantity,
            sku: producto.sku
        }

        addToCart(productCart);


        Toast.fire({
            icon: "success",
            title: `${quantity} ${quantity === 1 ? "par añadido" : "pares añadidos"} al pedido`,
            timer: 1500
        });
    };

    return (
        <div className="py-8 lg:py-12 bg-app-bg transition-colors duration-200">
            <div className="section-container space-y-10">
                {/* Migas de pan / Volver */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-app-muted hover:text-brand-royal dark:hover:text-brand-sky transition-colors group"
                    >
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="text-xs transition-transform duration-200 group-hover:-translate-x-1"
                        />
                        <span>Volver al catálogo de bodega</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="badge-sky text-[11px] py-1 px-3">
                            SKU: {producto.sku}
                        </span>
                    </div>
                </div>

                {/* Grid Principal: Galería Izquierda + Detalle Comercial Derecho */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    {/* ========================================================
                        COLUMNA IZQUIERDA: GALERÍA VISUAL DEL COLOR SELECCIONADO
                    ======================================================== */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Contenedor Principal de la Imagen */}
                        <div className="relative aspect-4/3 sm:aspect-16/11 w-full rounded-3xl overflow-hidden isabel-card border-2 border-brand-sky/25 shadow-xl bg-brand-sky/5 dark:bg-brand-surface-alt group">
                            <img
                                key={imagenActiva}
                                src={imagenActiva}
                                alt={`${producto.nombre} - Vista ${selectedImageIndex + 1}`}
                                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {/* Badge Género */}
                            <span className="badge-navy absolute top-4 left-4 shadow-sm text-xs py-1 px-3">
                                {producto.genero}
                            </span>

                            {/* Botón Favorito */}
                            {/* <button
                                type="button"
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md z-10 ${isFavorite
                                    ? "bg-rose-500 text-white"
                                    : "bg-app-surface/90 text-app-muted hover:text-rose-500"
                                    }`}
                                aria-label="Guardar en favoritos"
                            >
                                <FontAwesomeIcon icon={faHeart} className="text-sm" />
                            </button> */}

                            {/* Flechas de Navegación en Imagen (si hay más de 1 imagen para el color) */}
                            {imagenesDelColor.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-app-surface/80 hover:bg-app-surface text-app-text flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover:opacity-100 z-10"
                                        aria-label="Imagen anterior"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-app-surface/80 hover:bg-app-surface text-app-text flex items-center justify-center transition-all cursor-pointer shadow-md opacity-0 group-hover:opacity-100 z-10"
                                        aria-label="Siguiente imagen"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                    </button>
                                </>
                            )}

                            {/* Franja flotante de disponibilidad */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-brand-navy/85 backdrop-blur-md text-white text-xs border border-white/10 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-bold">
                                        {stockTotalProducto > 0
                                            ? `Stock en Bodega: ${stockTotalProducto} pares disponibles`
                                            : "Agotado en Bodega"}
                                    </span>
                                </div>
                                <span className="text-brand-sky font-semibold text-[11px] uppercase tracking-wider hidden sm:inline">
                                    Despacho en 24h
                                </span>
                            </div>
                        </div>

                        {/* Miniaturas de Imágenes del Color Actual */}
                        {imagenesDelColor.length > 1 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-app-muted">
                                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                                        Galería del color ({imagenesDelColor.length} fotos)
                                    </span>
                                    <span>
                                        Foto {selectedImageIndex + 1} de {imagenesDelColor.length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                    {imagenesDelColor.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${selectedImageIndex === idx
                                                ? "border-brand-royal dark:border-brand-sky ring-4 ring-brand-sky/30 shadow-md scale-102"
                                                : "border-app-border opacity-70 hover:opacity-100 hover:border-brand-royal/50"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Miniatura ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================================
                        COLUMNA DERECHA: SELECTOR DE COLOR & INFORMACIÓN
                    ======================================================== */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Cabecera del producto */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="section-subtitle">
                                    Línea Mayorista & Tienda
                                </span>
                                <span className="text-xs text-app-border">•</span>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    {producto.estado}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
                                {producto.nombre}
                            </h1>

                            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                                Calzado de alto rendimiento comercial para exhibición en vitrina. Construcción resistente, horma confortable y alta rotación garantizada en piso de venta.
                            </p>
                        </div>

                        {/* ====================================================
                            SELECTOR DE COLORES CON UI INTERACTIVA
                        ==================================================== */}
                        <div className="p-4 rounded-3xl bg-app-surface border border-app-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPalette} className="text-xs text-brand-royal dark:text-brand-sky" />
                                    <label className="text-xs font-bold uppercase tracking-wider text-app-text">
                                        Selecciona Color
                                    </label>
                                </div>
                                <span className="text-xs font-bold text-brand-royal dark:text-brand-sky">
                                    {COLOR_MAP[colorActual?.idColor || 107]?.name || `Color #${colorActual?.idColor}`}
                                </span>
                            </div>

                            {/* Tarjetas interactivas de color tipo radio button enriquecido */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {producto.colores.map((color, idx) => {
                                    const infoColor = COLOR_MAP[color.idColor] || {
                                        name: `Color #${color.idColor}`,
                                        hex: "#64748B",
                                    };
                                    const isSelected = selectedColorIndex === idx;

                                    return (
                                        <button
                                            key={color.idProductoColor}
                                            type="button"
                                            onClick={() => handleColorChange(idx)}
                                            className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer text-left ${isSelected
                                                ? "bg-brand-sky/15 dark:bg-brand-surface-alt border-brand-royal dark:border-brand-sky ring-3 ring-brand-sky/30 shadow-xs"
                                                : "bg-app-surface border-app-border hover:border-brand-royal/40 hover:bg-brand-sky/5"
                                                }`}
                                        >
                                            {/* Círculo indicador del color físico */}
                                            <div
                                                className="w-7 h-7 rounded-full shadow-inner shrink-0 flex items-center justify-center border"
                                                style={{
                                                    backgroundColor: infoColor.hex,
                                                    borderColor: infoColor.border || "rgba(0,0,0,0.15)",
                                                }}
                                            >
                                                {isSelected && (
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        className={`text-xs ${infoColor.hex === "#FFFFFF"
                                                            ? "text-brand-navy"
                                                            : "text-white"
                                                            }`}
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={`text-xs font-bold truncate ${isSelected
                                                        ? "text-brand-royal dark:text-brand-sky"
                                                        : "text-app-text"
                                                        }`}
                                                >
                                                    {infoColor.name}
                                                </p>
                                                <p className="text-[10px] text-app-muted truncate">
                                                    {color.imagenes?.length || 0} {color.imagenes?.length === 1 ? "foto" : "fotos"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bloque de Precios Directo al Consumidor */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-brand-sky/10 dark:bg-brand-surface-alt border border-brand-sky/25 space-y-2">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-app-muted block tracking-wider">
                                        Precio
                                    </span>
                                    <div className="flex items-baseline gap-2.5 flex-wrap">
                                        <span className="text-2xl sm:text-3xl font-extrabold text-brand-royal dark:text-brand-sky tracking-tight">
                                            {precioVentaFormateado}
                                        </span>

                                        {tieneDescuento && (
                                            <span className="text-base sm:text-lg font-bold text-app-muted line-through decoration-rose-500/70">
                                                {precioOriginalFormateado}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-app-muted block mt-0.5">
                                        IVA incluido &bull; Envío disponible a todo el país
                                    </span>
                                </div>

                                {tieneDescuento ? (
                                    <div className="text-right flex flex-col items-end">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                                            -{descuentoAplicable}% OFF
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                            Ahorras {formatCOP(precioBase - precioFinal)}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-sky/20 text-brand-royal dark:text-brand-sky border border-brand-sky/30">
                                            Precio directo de fábrica
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selector de Tallas para el color seleccionado */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-app-text">
                                    Tallas para este Color
                                </label>
                                <span className="text-xs font-semibold text-brand-royal dark:text-brand-sky">
                                    {varianteSeleccionada
                                        ? `Stock: ${varianteSeleccionada.stockActual} pares disp.`
                                        : "Selecciona una talla"}
                                </span>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                {variantesDisponibles.map((variante) => {
                                    const isOutOfStock = variante.stockActual <= 0;
                                    const isSelected = selectedTallaId === variante.idVariante;

                                    return (
                                        <button
                                            key={variante.idVariante}
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedTallaId(variante.idVariante)}
                                            className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${isOutOfStock
                                                ? "opacity-35 cursor-not-allowed bg-app-surface border-app-border"
                                                : isSelected
                                                    ? "bg-brand-royal text-white border-brand-royal ring-4 ring-brand-sky/30 shadow-md font-bold"
                                                    : "bg-app-surface text-app-text border-app-border hover:border-brand-royal dark:hover:border-brand-sky hover:bg-brand-sky/10"
                                                }`}
                                        >
                                            <span className="text-sm font-extrabold leading-none">
                                                {variante.talla.numeroTalla}
                                            </span>
                                            <span className="text-[9px] opacity-80 mt-1 uppercase">
                                                {variante.talla.tallaInternacional || "COL"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cantidad y Acciones de Compra */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3">
                                {/* Control de Cantidad */}
                                <div className="flex items-center rounded-2xl border border-app-border bg-app-surface p-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-app-text hover:bg-brand-sky/15 cursor-pointer transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center text-sm font-extrabold text-app-text">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-app-text hover:bg-brand-sky/15 cursor-pointer transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Botón Agregar al Pedido */}
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    disabled={Boolean(user && !selectedTallaId)}
                                    onClick={user ? handleAddToCart : () => navigate({ to: "/login" })}
                                    icon={faShoppingCart}
                                    className="shadow-lg shadow-brand-royal/20 disabled:cursor-not-allowed!"
                                >
                                    {user ? 'Añadir al Carrito' : "Inicia sesión para comprar"}
                                </Button>
                            </div>

                            {/* Beneficios Rápidos B2B */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border text-xs">
                                    <div className="w-8 h-8 rounded-xl bg-brand-sky/20 text-brand-royal dark:text-brand-sky flex items-center justify-center shrink-0">
                                        <FontAwesomeIcon icon={faTruckFast} className="text-xs" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-app-text truncate">Despacho 24/48h</p>
                                        <p className="text-[10px] text-app-muted truncate">A nivel nacional</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border text-xs">
                                    <div className="w-8 h-8 rounded-xl bg-brand-royal text-white flex items-center justify-center shrink-0">
                                        <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-app-text truncate">Lotes Flexibles</p>
                                        <p className="text-[10px] text-app-muted truncate">Combina tallas libres</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
