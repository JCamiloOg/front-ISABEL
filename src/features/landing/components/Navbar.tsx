import { useState, useRef, useEffect } from "react";
import {
    faMoon,
    faShoppingCart,
    faSun,
    faUser,
    faRightFromBracket,
    faShieldHalved,
    faTableColumns,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTheme from "../../../shared/hooks/useTheme";
import { Link } from "@tanstack/react-router";
import { useUser } from "../../../shared/hooks/useUser";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        {
            label: "Inicio",
            to: "/",
        },
        {
            label: "Catálogo",
            to: "/catalog",
        },
    ];

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    // Iniciales para el avatar
    const getInitials = () => {
        if (!user) return "U";
        const first = user.name?.charAt(0) || "";
        const last = user.lastName?.charAt(0) || "";
        return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
    };

    // Nombre completo a mostrar
    const fullName = user
        ? `${user.name || ""} ${user.lastName || ""}`.trim() || user.email
        : "";

    // Rol normalizado (ej: Admin, Administrador)
    const isAdmin = user?.role?.toLowerCase().includes("admin");

    return (
        <header className="sticky top-0 z-50 bg-app-surface/95 backdrop-blur-md border-b border-app-border transition-colors duration-200">
            <div className="section-container h-20 flex items-center justify-between">
                {/* Logo Brand */}
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="p-1 rounded-xl  shadow-xs">
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
                                Calzado
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Enlaces de Navegación */}
                <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            activeOptions={{ exact: to === "/" }}
                            activeProps={{
                                className:
                                    "text-brand-royal dark:text-brand-sky font-bold bg-brand-sky/15 dark:bg-brand-surface-alt shadow-2xs after:scale-x-100",
                            }}
                            inactiveProps={{
                                className:
                                    "text-app-text/75 hover:text-brand-royal dark:hover:text-brand-sky hover:bg-brand-sky/10 dark:hover:bg-white/5",
                            }}
                            className="relative px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer select-none after:content-[''] after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-brand-royal dark:after:bg-brand-sky after:rounded-full after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Botones de Acción: Sesión / Dropdown Usuario, Carrito, Modo Claro/Oscuro */}
                <div className="flex items-center gap-2 sm:gap-3">
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

                    {/* Botón de Carrito */}
                    {
                        user && (
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

                        )
                    }

                    {/* ========================================================
                        CONDICIONAL: BOTÓN INICIAR SESIÓN vs DROPDOWN DE USUARIO
                    ======================================================== */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            {/* Disparador del Dropdown */}
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-brand-sky/10 dark:bg-brand-surface-alt border border-brand-sky/25 hover:border-brand-royal dark:hover:border-brand-sky transition-all duration-200 cursor-pointer shadow-2xs group"
                                aria-expanded={isMenuOpen}
                                aria-label="Menú de usuario"
                            >
                                {/* Avatar con iniciales en estilo Isabel */}
                                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-brand-royal to-brand-sky text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                                    {getInitials()}
                                </div>

                                <div className="hidden sm:flex flex-col text-left max-w-30 lg:max-w-37.5">
                                    <span className="text-xs font-bold text-app-text truncate leading-tight">
                                        {user.name || "Usuario"}
                                    </span>
                                    <span className="text-[10px] text-app-muted truncate">
                                        {user.role || "Cliente"}
                                    </span>
                                </div>

                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`text-[10px] text-app-muted group-hover:text-brand-royal dark:group-hover:text-brand-sky transition-transform duration-200 ${isMenuOpen ? "rotate-180" : "rotate-0"
                                        }`}
                                />
                            </button>

                            {/* Panel Dropdown Flotante estilo Isabel */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2.5 w-72 rounded-3xl bg-app-surface border border-app-border shadow-2xl shadow-brand-navy/15 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Cabecera del usuario: Avatar grande, Nombre y Correo */}
                                    <div className="p-4 flex items-center gap-3.5 border-b border-app-border bg-brand-sky/5 dark:bg-white/5">
                                        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-brand-royal to-brand-sky text-white flex items-center justify-center text-base font-extrabold shadow-sm shrink-0">
                                            {getInitials()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-app-text truncate leading-snug">
                                                {fullName}
                                            </p>
                                            <p className="text-xs text-app-muted truncate" title={user.email}>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badge de Rol */}
                                    <div className="px-4 py-3 border-b border-app-border">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sky/15 text-brand-royal dark:text-brand-sky border border-brand-sky/30 text-xs font-bold shadow-2xs">
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                                            <span className="capitalize">{user.role || "Cliente"}</span>
                                        </div>
                                    </div>

                                    {/* Opciones del menú */}
                                    <div className="p-2 space-y-1">
                                        {/* Ir al Dashboard (Solo visible si es Admin o tiene privilegios) */}
                                        {isAdmin && (
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-app-text hover:bg-brand-royal hover:text-white dark:hover:bg-brand-royal transition-all duration-200 group cursor-pointer"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-brand-royal/10 dark:bg-white/10 group-hover:bg-white/20 text-brand-royal dark:text-brand-sky group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                                    <FontAwesomeIcon icon={faTableColumns} className="text-xs" />
                                                </div>
                                                <span className="flex-1 truncate">Ir al Dashboard</span>
                                            </Link>
                                        )}

                                        {/* Cerrar Sesión */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200 group cursor-pointer text-left"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                                <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                                            </div>
                                            <span className="flex-1 truncate">Cerrar sesión</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Botón de Inicio de Sesión cuando no hay usuario autenticado */
                        <Link to="/login" className="btn-ghost">
                            <FontAwesomeIcon icon={faUser} className="text-brand-royal dark:text-brand-sky" />
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
