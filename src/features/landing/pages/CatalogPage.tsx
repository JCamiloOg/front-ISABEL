import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faBoxesStacked,
    faFilter,
    faRotateLeft,
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
    faSliders,
    faCertificate,
} from "@fortawesome/free-solid-svg-icons";
import { MOCK_PRODUCTOS_PRISMA } from "../../../data/products";
import CardProduct from "../../../shared/components/CardProduct";
import { Input } from "../../../shared/components/Inputs/Input";
import { Button } from "../../../shared/components/Button";

const ITEMS_PER_PAGE = 10;

type GeneroFilter = "TODOS" | "Hombre" | "Mujer" | "Unisex";
type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "nombre-asc";

export default function CatalogPage() {
    // Estados de filtrado y búsqueda
    const [busqueda, setBusqueda] = useState("");
    const [generoSeleccionado, setGeneroSeleccionado] = useState<GeneroFilter>("TODOS");
    const [orden, setOrden] = useState<SortOption>("relevancia");
    const [soloEnStock, setSoloEnStock] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);

    // Filtrar y ordenar la lista de productos
    const productosFiltrados = useMemo(() => {
        const query = busqueda.trim().toLowerCase();

        return MOCK_PRODUCTOS_PRISMA.filter((prod) => {
            // Filtro por estado activo y público
            if (prod.estado !== "Activo" || !prod.publico) return false;

            // Filtro por texto (nombre, SKU)
            if (query) {
                const matchNombre = prod.nombre.toLowerCase().includes(query);
                const matchSku = prod.sku.toLowerCase().includes(query);
                const matchGenero = prod.genero.toLowerCase().includes(query);
                if (!matchNombre && !matchSku && !matchGenero) {
                    return false;
                }
            }

            // Filtro por género
            if (generoSeleccionado !== "TODOS" && prod.genero !== generoSeleccionado) {
                return false;
            }

            // Filtro por stock disponible
            if (soloEnStock) {
                const totalStock = prod.colores.reduce((accC, c) => {
                    return accC + c.variantes.reduce((accV, v) => accV + (v.stockActual || 0), 0);
                }, 0);
                if (totalStock <= 0) return false;
            }

            return true;
        }).sort((a, b) => {
            if (orden === "precio-asc") return a.precioVenta - b.precioVenta;
            if (orden === "precio-desc") return b.precioVenta - a.precioVenta;
            if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
            return 0; // Relevancia / orden original
        });
    }, [busqueda, generoSeleccionado, soloEnStock, orden]);

    // Paginación
    const totalResultados = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalResultados / ITEMS_PER_PAGE) || 1;

    // Asegurar que la página actual sea válida al cambiar filtros
    const safePagina = Math.min(Math.max(1, paginaActual), totalPaginas);

    const inicio = (safePagina - 1) * ITEMS_PER_PAGE;
    const fin = inicio + ITEMS_PER_PAGE;
    const productosPaginados = productosFiltrados.slice(inicio, fin);

    const handleCambiarPagina = (nuevaPagina: number) => {
        setPaginaActual(nuevaPagina);
        window.scrollTo({ top: 300, behavior: "smooth" });
    };

    const handleLimpiarFiltros = () => {
        setBusqueda("");
        setGeneroSeleccionado("TODOS");
        setOrden("relevancia");
        setSoloEnStock(false);
        setPaginaActual(1);
    };

    const hayFiltrosActivos =
        busqueda.trim() !== "" ||
        generoSeleccionado !== "TODOS" ||
        orden !== "relevancia" ||
        soloEnStock;

    return (
        <main className="min-h-screen bg-app-bg text-app-text transition-colors duration-200">
            {/* Header Hero del Catálogo */}
            <section className="relative overflow-hidden bg-linear-to-b from-brand-navy to-brand-sky dark:to-app-bg  via-[#122A54] pt-14 pb-12 border-b border-brand-royal/15">
                {/* Glow ambiental */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-sky/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-royal/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-royal/25 text-brand-sky border border-brand-sky/30 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-sm">
                            <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
                            <span>Bodega Mayorista &bull; Disponibilidad Inmediata</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                            Catálogo Oficial de Calzado
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-slate-200/90 leading-relaxed">
                            Precios de bodega accesibles por pares o surtidos. Modelos listos para despacho inmediato a tu negocio o emprendimiento.
                        </p>
                    </div>

                    {/* Barra de Búsqueda Principal integrada */}
                    <div className="mt-8 p-3 sm:p-4 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/15 shadow-xl max-w-4xl">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-8 lg:col-span-8">
                                <Input
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    placeholder="Buscar por modelo, SKU o estilo (ej: Air Force, NK-AF1, Running)..."
                                    iconLeft={faMagnifyingGlass}
                                    containerClassName="w-full"
                                    className="bg-white! dark:bg-slate-900/90! shadow-sm"
                                />
                            </div>

                            <div className="sm:col-span-4 lg:col-span-4 flex items-center gap-2">
                                <div className="relative w-full">
                                    <select
                                        value={orden}
                                        onChange={(e) => {
                                            setOrden(e.target.value as SortOption);
                                            setPaginaActual(1);
                                        }}
                                        className="w-full h-11 px-3.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-sky transition-colors cursor-pointer"
                                    >
                                        <option value="relevancia">Destacados / Relevancia</option>
                                        <option value="precio-asc">Precio: Menor a Mayor</option>
                                        <option value="precio-desc">Precio: Mayor a Menor</option>
                                        <option value="nombre-asc">Nombre: A - Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Chips de filtro rápido */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-slate-300 font-semibold mr-1 flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
                                    Género:
                                </span>
                                {(["TODOS", "Hombre", "Mujer", "Unisex"] as const).map((gen) => (
                                    <button
                                        key={gen}
                                        type="button"
                                        onClick={() => {
                                            setGeneroSeleccionado(gen);
                                            setPaginaActual(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${generoSeleccionado === gen
                                            ? "bg-brand-sky text-brand-navy font-bold shadow-sm"
                                            : "bg-white/10 hover:bg-white/20 text-white/90 cursor-pointer"
                                            }`}
                                    >
                                        {gen === "TODOS" ? "Todos los géneros" : gen}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-200 font-medium select-none">
                                    <input
                                        type="checkbox"
                                        checked={soloEnStock}
                                        onChange={(e) => {
                                            setSoloEnStock(e.target.checked);
                                            setPaginaActual(1);
                                        }}
                                        className="rounded border-slate-400 text-brand-royal focus:ring-brand-sky h-4 w-4"
                                    />
                                    <span>Solo con stock</span>
                                </label>

                                {hayFiltrosActivos && (
                                    <button
                                        type="button"
                                        onClick={handleLimpiarFiltros}
                                        className="text-brand-sky hover:text-white underline decoration-dashed flex items-center gap-1 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenido Principal / Listado */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Barra de Estado y Metadatos */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-app-border gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-app-text">
                            Mostrando {totalResultados > 0 ? inicio + 1 : 0} - {Math.min(fin, totalResultados)} de{" "}
                            <span className="text-brand-royal dark:text-brand-sky font-bold">
                                {totalResultados} {totalResultados === 1 ? "producto" : "productos"}
                            </span>
                        </span>
                        {busqueda && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Búsqueda: "{busqueda}"
                            </span>
                        )}
                    </div>

                    <div className="text-xs text-app-muted flex items-center gap-2">
                        <FontAwesomeIcon icon={faCertificate} className="text-brand-royal dark:text-brand-sky" />
                        <span>Precios mayoristas vigentes con garantía de bodega</span>
                    </div>
                </div>

                {/* Grid de Productos */}
                {productosPaginados.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productosPaginados.map((producto) => (
                            <CardProduct key={producto.idProducto} producto={producto} />
                        ))}
                    </div>
                ) : (
                    /* Empty State amigable */
                    <div className="py-20 text-center isabel-card rounded-3xl border border-app-border max-w-xl mx-auto my-8 px-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-sky/10 text-brand-royal dark:text-brand-sky mx-auto flex items-center justify-center text-2xl mb-4">
                            <FontAwesomeIcon icon={faSliders} />
                        </div>
                        <h3 className="text-xl font-bold text-app-text mb-2">
                            No encontramos zapatos con ese criterio
                        </h3>
                        <p className="text-sm text-app-muted max-w-md mx-auto mb-6">
                            Intenta verificar la ortografía, buscar términos más generales como "running" o "básquet", o reiniciar los filtros de búsqueda.
                        </p>
                        <Button
                            variant="primary"
                            icon={faRotateLeft}
                            onClick={handleLimpiarFiltros}
                        >
                            Ver todos los productos
                        </Button>
                    </div>
                )}

                {/* Paginación - Solo se muestra si hay más de 1 página */}
                {totalPaginas > 1 && (
                    <nav
                        aria-label="Paginación del catálogo"
                        className="mt-14 pt-8 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="text-sm text-app-muted">
                            Página <span className="font-bold text-app-text">{safePagina}</span> de{" "}
                            <span className="font-bold text-app-text">{totalPaginas}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-app-border">
                            {/* Botón Primera Página */}
                            <button
                                type="button"
                                onClick={() => handleCambiarPagina(1)}
                                disabled={safePagina <= 1}
                                title="Primera página"
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium text-app-muted hover:text-app-text hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                            >
                                <FontAwesomeIcon icon={faAnglesLeft} />
                            </button>

                            {/* Botón Anterior */}
                            <button
                                type="button"
                                onClick={() => handleCambiarPagina(safePagina - 1)}
                                disabled={safePagina <= 1}
                                title="Página anterior"
                                className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-app-text hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                            >
                                <FontAwesomeIcon icon={faAngleLeft} />
                                <span className="hidden sm:inline">Anterior</span>
                            </button>

                            {/* Números de página */}
                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
                                    const activo = num === safePagina;
                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleCambiarPagina(num)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${activo
                                                ? "bg-brand-royal text-white shadow-md shadow-brand-royal/25 scale-105"
                                                : "text-app-muted hover:text-app-text hover:bg-white dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Botón Siguiente */}
                            <button
                                type="button"
                                onClick={() => handleCambiarPagina(safePagina + 1)}
                                disabled={safePagina >= totalPaginas}
                                title="Página siguiente"
                                className="px-3 h-9 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-app-text hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                            >
                                <span className="hidden sm:inline">Siguiente</span>
                                <FontAwesomeIcon icon={faAngleRight} />
                            </button>

                            {/* Botón Última Página */}
                            <button
                                type="button"
                                onClick={() => handleCambiarPagina(totalPaginas)}
                                disabled={safePagina >= totalPaginas}
                                title="Última página"
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium text-app-muted hover:text-app-text hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                            >
                                <FontAwesomeIcon icon={faAnglesRight} />
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </main>
    );
}
