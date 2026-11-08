import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
            <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-brand-sky/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-brand-royal/15 rounded-full blur-3xl pointer-events-none" />

            <div className="section-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    {/* Texto Hero */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="badge-sky gap-2 py-1.5 px-3.5 text-xs">
                            <span className="inline-block w-2 h-2 rounded-full bg-brand-royal dark:bg-brand-sky" />
                            Nueva Colección Isabel 2026
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-app-text tracking-tight leading-[1.12]">
                            La elegancia que camina con{" "}
                            <span className="text-brand-royal dark:text-brand-sky underline decoration-brand-sky decoration-4 underline-offset-4">
                                tu autenticidad
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-app-muted max-w-xl leading-relaxed">
                            Descubre calzado diseñado con precisión artesanal, materiales de primera calidad
                            y la comodidad justa para acompañar cada uno de tus pasos importantes.
                        </p>

                        {/* Botones de Acción */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <a
                                href="#catalogo"
                                className="btn-primary py-3.5 px-6 shadow-lg shadow-brand-royal/25"
                            >
                                Ver Catálogo Destacado
                                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                            </a>

                            <a
                                href="#artesania"
                                className="btn-outline py-3.5 px-6"
                            >
                                Conocer Fabricación
                            </a>
                        </div>

                        {/* Métricas / Social Proof */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-app-border max-w-lg">
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-app-text">+15k</p>
                                <p className="text-xs text-app-muted font-medium">Clientes satisfechos</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-brand-royal dark:text-brand-sky">100%</p>
                                <p className="text-xs text-app-muted font-medium">Cuero genuino</p>
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-app-text">4.9/5</p>
                                <p className="text-xs text-app-muted font-medium">Valoración media</p>
                            </div>
                        </div>
                    </div>

                    {/* Imagen / Composición Visual Hero */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            <div className="absolute inset-0 bg-linear-to-tr from-brand-royal to-brand-sky rounded-3xl transform rotate-3 scale-95 opacity-25 filter blur-lg" />

                            <div className="relative isabel-card p-6 sm:p-8 shadow-xl">
                                <div className="relative overflow-hidden rounded-2xl bg-linear-to-b from-brand-sky/15 to-transparent p-6 text-center">
                                    <img
                                        src="/Logo Isabel Zapatos.svg"
                                        alt="Caja y Calzado Isabel"
                                        className="w-full max-w-[320px] mx-auto h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="mt-6 flex items-center justify-between bg-brand-sky/10 dark:bg-brand-surface-alt rounded-2xl p-4 border border-brand-sky/20">
                                    <div>
                                        <p className="section-subtitle">
                                            Edición Especial
                                        </p>
                                        <h4 className="text-base font-bold text-app-text">
                                            Empaque Artesanal Isabel
                                        </h4>
                                    </div>
                                    <span className="badge-royal px-3 py-1 text-xs">
                                        Premium
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}