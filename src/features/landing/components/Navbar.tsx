import { faMoon, faShoppingCart, faSun, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTheme from "../../../shared/hooks/useTheme";

export default function Navbar() {
    const { theme, toggleTheme, } = useTheme();

    return (
        <header className="sticky top-0 z-50 bg-app-surface/95 backdrop-blur-md border-b border-app-border transition-colors duration-200">
            <div className="section-container h-20 flex items-center justify-between">
                {/* Logo Brand */}
                <div className="flex items-center gap-3">
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="p-1 rounded-xl bg-white shadow-xs">
                            <img
                                src="/Logo Isabel Zapatos.svg"
                                alt="Logo Isabel Zapatos"
                                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-app-text leading-none">
                                ISABEL
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-brand-royal dark:text-brand-sky font-semibold mt-0.5">
                                Calzado Artesanal
                            </span>
                        </div>
                    </a>
                </div>

                {/* Enlaces de Navegación */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-app-text">
                    <a href="#catalogo" className="hover:text-brand-royal dark:hover:text-brand-sky transition-colors">
                        Catálogo
                    </a>
                    <a href="#artesania" className="hover:text-brand-royal dark:hover:text-brand-sky transition-colors">
                        Nuestra Esencia
                    </a>
                    <a href="#beneficios" className="hover:text-brand-royal dark:hover:text-brand-sky transition-colors">
                        Beneficios
                    </a>
                    <a href="#contacto" className="hover:text-brand-royal dark:hover:text-brand-sky transition-colors">
                        Contacto
                    </a>
                </nav>

                {/* Botones de Acción: Modo Claro/Oscuro, Carrito e Inicio de Sesión */}
                <div className="flex items-center gap-2.5 sm:gap-3.5">

                    {/* Botón de Carrito */}
                    <button
                        type="button"
                        className="relative p-2.5 rounded-full text-app-text hover:bg-brand-sky/15 hover:text-brand-royal dark:hover:text-brand-sky transition-colors duration-200 cursor-pointer"
                        aria-label="Ver carrito de compras"
                    >
                        <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
                        <span className="badge-royal absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] shadow-sm">
                            2
                        </span>
                    </button>

                    {/* Botón de Inicio de Sesión */}
                    <button
                        type="button"
                        className="btn-ghost"
                    >
                        <FontAwesomeIcon icon={faUser} className="text-brand-royal dark:text-brand-sky" />
                        <span className="hidden sm:inline">Iniciar Sesión</span>
                    </button>

                    {/* CTA Primario rápido */}
                    <a
                        href="#catalogo"
                        className="hidden lg:inline-flex btn-primary"
                    >
                        Explorar Colección
                    </a>
                    {/* Botón Switch Tema */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full text-app-text hover:bg-brand-sky/15 hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer"
                        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        aria-label="Alternar tema"
                    >
                        <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="text-base" />
                    </button>

                </div>
            </div>
        </header>
    );
}