import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartPie,
    faShoePrints,
    faBoxesStacked,
    faCartShopping,
    faUsers,
    faRightFromBracket,
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faBell,
    faSun,
    faMoon,
    faTruckRampBox,
    faIndustry,
    faDollarSign,
    faReply,
    faKey,
    faUserGear,
    faList,
    faCashRegister,
    faReceipt,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../../shared/hooks/useTheme";
import { Link, useRouterState } from "@tanstack/react-router";

interface NavItem {
    id: string;
    label: string;
    icon: typeof faChartPie;
    badge?: string;
    badgeColor?: "primary" | "accent";
    to: string;
}

interface NavSection {
    id: string;
    title: string;
    items: NavItem[];
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    const navigationSections: NavSection[] = [
        {
            id: "principal",
            title: "Principal",
            items: [
                { id: "dashboard", label: "Dashboard", icon: faChartPie, to: "/dashboard" },
                { id: "bills", label: "Gastos", icon: faReceipt, to: "/dashboard/bills" },
                { id: "boxes", label: 'Cajas', icon: faCashRegister, to: "/dashboard/boxes" }
            ],
        },
        {
            id: "compras",
            title: "Gestión de compras",
            items: [
                { id: "products", label: "Productos", icon: faShoePrints, to: "/dashboard/products" },
                { id: "category-supplier", label: "Categoría proveedor", icon: faTruckRampBox, to: "/dashboard/category-supplier" },
                { id: "supplier", label: "Proveedores", icon: faIndustry, to: "/dashboard/supplier" },
                { id: "shopping-purchases", label: "Compras", icon: faCartShopping, to: "/dashboard/shopping" }
            ],
        },
        {
            id: "ventas",
            title: "Gestión de ventas",
            items: [
                { id: "clients", label: "Clientes", icon: faUsers, to: "/dashboard/clients" },
                { id: "orders", label: "Pedidos", icon: faBoxesStacked, to: "/dashboard/orders" },
                { id: "sales", label: "Ventas", icon: faDollarSign, to: "/dashboard/sales" },
                { id: "returns", label: "Devoluciones", icon: faReply, to: "/dashboard/returns" }
            ],
        },
        {
            id: "configuracion",
            title: "Configuración",
            items: [
                { id: "users", label: "Usuarios", icon: faUserGear, to: "/dashboard/users" },
                { id: "roles", label: "Roles", icon: faList, to: "/dashboard/roles" },
                { id: "permissions", label: "Permisos", icon: faKey, to: "/dashboard/permissions" }
            ]
        }
    ];

    // Control individual de secciones colapsables (por defecto todas abiertas)
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (sectionId: string) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    return (
        <aside
            className={`relative flex flex-col h-screen bg-brand-white dark:bg-brand-navy text-app-text border-r border-brand-royal/20 transition-all duration-300 ease-in-out select-none ${isCollapsed ? "w-20" : "w-72"
                }`}
        >
            {/* Botón Flotante para Colapsar/Expandir la barra lateral completa */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-8 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-brand-royal text-white shadow-md hover:bg-brand-sky hover:text-brand-navy transition-all cursor-pointer border-2 border-brand-white dark:border-brand-navy"
                title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
                aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
            >
                <FontAwesomeIcon
                    icon={isCollapsed ? faChevronRight : faChevronLeft}
                    className="text-xs"
                />
            </button>

            {/* =========================================
                ENCABEZADO / MARCA ISABEL
            ========================================= */}
            <div className="flex items-center h-20 px-4 border-b border-app-border dark:border-white/10 gap-3 overflow-hidden shrink-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs border border-brand-navy/10">
                    <img
                        src="/Logo Isabel Zapatos.svg"
                        alt="Isabel Logo"
                        className="h-full w-full object-contain"
                    />
                </div>

                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 transition-opacity duration-300">
                        <span className="text-lg font-bold tracking-tight text-brand-navy dark:text-white leading-none truncate">
                            ISABEL
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-brand-royal dark:text-brand-sky font-semibold mt-1 truncate">
                            Panel Administrativo
                        </span>
                    </div>
                )}
            </div>

            {/* =========================================
                NAVEGACIÓN PRINCIPAL
            ========================================= */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-4 scrollbar-thin scrollbar-thumb-brand-royal/30">
                {navigationSections.map((section) => {
                    const isSectionCollapsed = !!collapsedSections[section.id];
                    // Si algún hijo está activo en la ruta actual, se destaca sutilmente el encabezado
                    const hasActiveChild = section.items.some(
                        (item) => currentPath === item.to || currentPath.startsWith(`${item.to}/`)
                    );

                    return (
                        <div key={section.id} className="space-y-1">
                            {/* Cabecera de Sección (Colapsable con clic) */}
                            {!isCollapsed ? (
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.id)}
                                    className={`group flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${hasActiveChild
                                        ? "text-brand-royal dark:text-brand-sky"
                                        : "text-brand-navy/60 dark:text-brand-sky/70 hover:text-brand-navy dark:hover:text-white"
                                        }`}
                                    title={isSectionCollapsed ? `Expandir ${section.title}` : `Colapsar ${section.title}`}
                                >
                                    <span className="truncate">{section.title}</span>
                                    <span
                                        className={`flex items-center justify-center w-4 h-4 text-[10px] transition-transform duration-300 ease-in-out ${isSectionCollapsed ? "-rotate-90 text-brand-navy/40 dark:text-brand-sky/50" : "rotate-0"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </span>
                                </button>
                            ) : (
                                <div className="h-px bg-app-border dark:bg-white/10 mx-2 my-2" />
                            )}

                            {/* Contenedor Animado con CSS Grid transition (0fr -> 1fr) */}
                            <div
                                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${!isCollapsed && isSectionCollapsed
                                    ? "grid-rows-[0fr] opacity-0 pointer-events-none"
                                    : "grid-rows-[1fr] opacity-100"
                                    }`}
                            >
                                <div className="overflow-hidden space-y-1">
                                    {section.items.map((item) => {
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.to}
                                                activeProps={{
                                                    className: "bg-brand-royal text-white shadow-sm shadow-brand-royal/40 font-semibold"
                                                }}
                                                inactiveProps={{
                                                    className: "text-brand-navy/80 dark:text-white/75 hover:bg-brand-sky/10 dark:hover:bg-white/5 hover:text-brand-royal dark:hover:text-white"
                                                }}
                                                activeOptions={{
                                                    exact: true
                                                }}
                                                className="group relative flex w-full items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                                                title={isCollapsed ? item.label : undefined}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        {/* Indicador lateral activo */}
                                                        {isActive && (
                                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-sky rounded-r-md" />
                                                        )}

                                                        {/* Icono */}
                                                        <div
                                                            className={`flex h-6 w-6 items-center justify-center shrink-0 text-base transition-colors ${isActive
                                                                ? "text-white"
                                                                : "text-brand-royal dark:text-brand-sky group-hover:scale-105"
                                                                }`}
                                                        >
                                                            <FontAwesomeIcon icon={item.icon} />
                                                        </div>

                                                        {!isCollapsed && (
                                                            <div className="flex flex-1 items-center justify-between min-w-0">
                                                                <span className="truncate">{item.label}</span>
                                                                {item.badge && (
                                                                    <span
                                                                        className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${item.badgeColor === "accent"
                                                                            ? "bg-brand-sky text-brand-navy"
                                                                            : "bg-white/20 text-white"
                                                                            }`}
                                                                    >
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Tooltip flotante cuando el sidebar completo está colapsado */}
                                                        {isCollapsed && (
                                                            <div className="absolute left-full ml-3 hidden rounded-lg bg-brand-navy border border-brand-sky/30 px-3 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:flex z-50 whitespace-nowrap items-center gap-2">
                                                                <span>{item.label}</span>
                                                                {item.badge && (
                                                                    <span
                                                                        className={`px-1.5 py-0.2 rounded-full text-[9px] ${item.badgeColor === "accent"
                                                                            ? "bg-brand-sky text-brand-navy"
                                                                            : "bg-brand-royal text-white"
                                                                            }`}
                                                                    >
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* =========================================
                ACCESO DIRECTO A LA LANDING PAGE
            ========================================= */}
            <div className="px-3 py-2 border-t border-app-border dark:border-white/10 shrink-0">
                <Link
                    to="/"
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-brand-navy dark:text-white bg-brand-sky/10 dark:bg-white/5 hover:bg-brand-royal hover:text-white dark:hover:bg-brand-royal transition-all duration-200 border border-brand-sky/20 hover:border-brand-royal shadow-2xs ${isCollapsed ? "justify-center" : ""
                        }`}
                    title={isCollapsed ? "Ir a la Landing Page" : undefined}
                >
                    <div className="flex h-6 w-6 items-center justify-center shrink-0 text-brand-royal dark:text-brand-sky group-hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                            <span className="">Volver a inicio</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-royal/10 dark:bg-white/10 text-brand-royal dark:text-brand-sky group-hover:bg-white/20 group-hover:text-white font-medium transition-colors">
                                Web
                            </span>
                        </div>
                    )}

                    {/* Tooltip flotante al estar colapsado el sidebar */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-3 hidden rounded-lg dark:bg-brand-navy bg-brand-white border border-brand-sky/30 px-3 py-1.5 text-xs font-semibold dark:text-white text-brand-royal shadow-xl group-hover:flex z-50 whitespace-nowrap items-center gap-1.5">
                            <span>Volver a inicio</span>
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-brand-sky" />
                        </div>
                    )}
                </Link>
            </div>

            {/* =========================================
                PERFIL DE USUARIO & CERRAR SESIÓN
            ========================================= */}
            <div className="p-3 border-t border-app-border dark:border-white/10 dark:bg-brand-navy/90 bg-brand-white shrink-0">
                <div
                    className={`flex items-center gap-3 p-2 rounded-xl hover:bg-brand-sky/10 dark:hover:bg-white/5 transition-colors ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    {/* Avatar del Administrador */}
                    <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-brand-royal to-brand-sky text-white font-bold text-sm shadow-sm">
                            AD
                        </div>
                        {/* Indicador en línea */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-brand-white dark:border-brand-navy" />
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-brand-navy dark:text-white truncate">
                                    Admin Calzado
                                </p>
                                <p className="text-[10px] text-brand-royal dark:text-brand-sky truncate">
                                    admin@isabel.com
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Switch Tema */}
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="p-1.5 rounded-lg text-brand-royal dark:text-brand-sky/70 hover:text-brand-navy dark:hover:text-white hover:bg-brand-sky/15 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                    title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                                    aria-label="Alternar tema"
                                >
                                    <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-brand-royal dark:text-brand-sky/70 hover:text-brand-navy dark:hover:text-white hover:bg-brand-sky/15 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                    title="Notificaciones"
                                    aria-label="Ver notificaciones"
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-brand-royal dark:text-brand-sky/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                    title="Cerrar Sesión"
                                    aria-label="Cerrar Sesión"
                                >
                                    <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
