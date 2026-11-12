import {
    faArrowRight,
    faQuoteLeft,
    faStore,
    faCheck,
    faBagShopping,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
            <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-brand-sky/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-brand-royal/15 rounded-full blur-3xl pointer-events-none" />

            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    {/* Texto Hero: Bodega con compra flexible a pocas cantidades */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="badge-sky gap-2 py-1.5 px-3.5 text-xs">
                            <span className="inline-block w-2 h-2 rounded-full bg-brand-royal dark:bg-brand-sky" />
                            Bodega Mayorista • Compra desde Pocas Unidades
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-app-text tracking-tight leading-[1.12]">
                            Precios directos de bodega{" "}
                            <span className="text-brand-royal dark:text-brand-sky underline decoration-brand-sky decoration-4 underline-offset-4">
                                sin exigirte grandes volúmenes
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-app-muted max-w-xl leading-relaxed">
                            Somos proveedores de calzado para tiendas y emprendedores. Accede a nuestro inventario mayorista con la ventaja exclusiva de comprar lotes pequeños o surtidos a tu medida.
                        </p>

                        {/* Botones de Acción */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link
                                to="/catalog"
                                className="btn-primary py-3.5 px-6 shadow-lg shadow-brand-royal/25"
                            >
                                Explorar Catálogo
                                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                            </Link>

                            <a
                                href="#catalogo"
                                className="btn-outline py-3.5 px-6"
                            >
                                Ver Muestras y Lotes
                            </a>
                        </div>

                        {/* Métricas clave */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-app-border max-w-lg">
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-app-text">Desde 3-6</p>
                                <p className="text-xs text-app-muted font-medium">Pares por pedido</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-brand-royal dark:text-brand-sky">Directo</p>
                                <p className="text-xs text-app-muted font-medium">Precio de bodega</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-app-text">24/48h</p>
                                <p className="text-xs text-app-muted font-medium">Despacho nacional</p>
                            </div>
                        </div>
                    </div>

                    {/* LADO DERECHO: PANEL FOTOGRÁFICO INMERSIVO EDITORIAL */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative mx-auto max-w-lg lg:max-w-none">
                            {/* Resplandor corporativo posterior */}
                            <div className="absolute inset-0 bg-linear-to-tr from-brand-royal to-brand-sky rounded-3xl transform rotate-2 scale-95 opacity-30 filter blur-2xl pointer-events-none" />

                            {/* Contenedor Editorial Inmersivo */}
                            <div className="relative aspect-4/5 sm:aspect-square lg:aspect-4/5 w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-royal/25 text-white select-none flex flex-col justify-between p-6 sm:p-8">
                                {/* Imagen Fotográfica de Fondo a Pantalla Completa */}
                                <img
                                    src="/shoesGreenSplash.jpg"
                                    alt="Calzado en bodega Isabel para compras minoristas y surtidas"
                                    className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700 ease-out"
                                />

                                {/* lineare y atmósfera corporativa */}
                                <div className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/60 to-brand-royal/35 mix-blend-multiply" />
                                <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-brand-navy/95" />

                                {/* Cabecera Superior del Panel Flotante */}
                                <div className="relative z-10 flex items-center justify-between gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-brand-sky animate-pulse" />
                                        <span>Venta Flexible en Línea</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy/80 backdrop-blur-md border border-white/10 text-[11px] font-bold uppercase tracking-wider text-brand-sky">
                                        <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                                        <span>Sin Mínimos Forzados</span>
                                    </div>
                                </div>

                                {/* Tarjeta Flotante Inferior con Glassmorphism */}
                                <div className="relative z-10 mt-auto space-y-3">
                                    <div className="bg-brand-navy/85 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-3">
                                        <div className="flex items-center justify-between text-brand-sky">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faQuoteLeft} className="text-base opacity-80" />
                                                <span className="text-[11px] font-extrabold uppercase tracking-widest">
                                                    Bodega & Suministro
                                                </span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-brand-royal text-white font-bold text-[10px] uppercase tracking-wider">
                                                Lotes Pequeños
                                            </span>
                                        </div>

                                        <p className="text-base sm:text-lg font-bold text-white leading-snug">
                                            "El respaldo de una gran bodega mayorista con la libertad de surtir tu tienda par a par o por medias docenas."
                                        </p>

                                        {/* Fichas rápidas de logística y flexibilidad */}
                                        <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-white/85">
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-brand-royal text-white flex items-center justify-center text-[10px]">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </span>
                                                <span className="truncate">Surtido de tallas libre</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-brand-royal text-white flex items-center justify-center text-[10px]">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </span>
                                                <span className="truncate">Margen alto desde el día 1</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pie del panel con sello de confianza */}
                                    <div className="flex items-center justify-between text-[11px] text-white/75 px-1">
                                        <span>isabelzapatos.com / Catálogo en Línea</span>
                                        <span className="flex items-center gap-1.5 text-brand-sky">
                                            <FontAwesomeIcon icon={faStore} className="text-xs" />
                                            <span>Envíos a tiendas en todo el país</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
