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
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../../../shared/hooks/useTheme";
import { Link } from "@tanstack/react-router";

interface NavItem {
    id: string;
    label: string;
    icon: typeof faChartPie;
    badge?: string;
    badgeColor?: "primary" | "accent";
    to: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const navigationSections: NavSection[] = [
        {
            title: "Principal",
            items: [
                { id: "dashboard", label: "Dashboard", icon: faChartPie, to: "/dashboard" },
            ],
        },
        {
            title: "Gestión de compras",
            items: [
                { id: "products", label: "Productos", icon: faShoePrints, to: "/dashboard/products" },
                { id: "category-supplier", label: "Categoría proveedor", icon: faTruckRampBox, to: "/dashboard/category-supplier" },
                { id: "supplier", label: "Proveedores", icon: faIndustry, to: "/dashboard/supplier" },
                { id: "shopping-purchases", label: "Compras", icon: faCartShopping, to: "/dashboard/shopping" }
            ],
        },
        {
            title: "Gesitón de ventas",
            items: [
                { id: "clients", label: "Clientes", icon: faUsers, to: "/dashboard/clients" },
                { id: "orders", label: "Pedidos", icon: faBoxesStacked, to: "/dashboard/orders" },
                { id: "sales", label: "Ventas", icon: faDollarSign, to: "/dashboard/sales" },
                { id: "returns", label: "Devoluciones", icon: faReply, to: "/dashboard/returns" }
            ],
        },
        {
            title: "Configuración",
            items: [
                { id: "users", label: "Usuarios", icon: faUserGear, to: "/dashboard/users" },
                { id: "roles", label: "Roles", icon: faList, to: "/dashboard/roles" },
                { id: "permissions", label: "Permisos", icon: faKey, to: "/dashboard/permissions" }
            ]
        }
    ];

    return (
        <aside
            className={`relative flex flex-col h-screen bg-brand-white dark:bg-brand-navy text-white border-r border-brand-royal/20 transition-all duration-300 ease-in-out select-none ${isCollapsed ? "w-20" : "w-72"
                }`}
        >
            {/* Botón Flotante para Colapsar/Expandir */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-8 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-brand-royal text-white shadow-md hover:bg-brand-sky hover:text-brand-navy transition-all cursor-pointer border-2 border-brand-navy"
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
            <div className="flex items-center h-20 px-4 border-b border-white/10 gap-3 overflow-hidden shrink-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
                    <img
                        src="/Logo Isabel Zapatos.svg"
                        alt="Isabel Logo"
                        className="h-full w-full object-contain"
                    />
                </div>

                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 transition-opacity duration-300">
                        <span className="text-lg font-bold tracking-tight text-brand-sky dark:text-white leading-none truncate">
                            ISABEL
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-brand-sky font-semibold mt-1 truncate">
                            Panel Administrativo
                        </span>
                    </div>
                )}
            </div>

            {/* =========================================
          NAVEGACIÓN PRINCIPAL
      ========================================= */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-6 scrollbar-thin scrollbar-thumb-brand-royal/30">
                {navigationSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        {/* Título de Sección */}
                        {!isCollapsed ? (
                            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-brand-sky/70 mb-2">
                                {section.title}
                            </p>
                        ) : (
                            <div className="h-px bg-white/10 mx-2 my-3" />
                        )}

                        {/* Elementos de Navegación */}
                        {section.items.map((item) => {
                            return (
                                <Link
                                    key={item.id}
                                    to={item.to}
                                    activeProps={{
                                        className: "bg-brand-royal text-white shadow-sm shadow-brand-royal/40"
                                    }}
                                    inactiveProps={{
                                        className: "text-black/75 hover:bg-white/5 hover:text-brand-royal dark:hover:text-white dark:text-white/75"
                                    }}
                                    activeOptions={{
                                        exact: true
                                    }}
                                    className={`group relative flex w-full items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer`}
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
                                                    : "text-brand-sky dark:group-hover:text-white group-hover:text-brand-royal"
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={item.icon} />
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex flex-1 items-center justify-between min-w-0">
                                                    <span className="truncate">{item.label}</span>
                                                    {/* {item.badge && (
                                                <span
                                                    className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${item.badgeColor === "accent"
                                                        ? "bg-brand-sky text-brand-navy"
                                                        : "bg-white/20 text-white"
                                                        }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )} */}
                                                </div>
                                            )}

                                            {/* Tooltip flotante cuando está colapsado */}
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
                                    {/* Etiqueta y Badges (cuando no está colapsado) */}
                                </Link>
                            );
                        })}
                    </div>
                ))}


            </div>

            {/* =========================================
          PERFIL DE USUARIO & CERRAR SESIÓN
      ========================================= */}
            <div className="p-3 border-t border-white/10 dark:bg-brand-navy/90 shrink-0">
                <div
                    className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    {/* Avatar del Administrador */}
                    <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-brand-royal to-brand-sky text-white font-bold text-sm shadow-sm">
                            AD
                        </div>
                        {/* Indicador en línea */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-brand-navy" />
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                            <div className="min-w-0">
                                <p className="text-xs font-bold dark:text-white text-black/75 truncate">
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
                                    className="p-1.5 rounded-lg text-brand-sky/70 hover:text-brand-royal hover:bg-white/5 transition-colors cursor-pointer"
                                    title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                                    aria-label="Alternar tema"
                                >
                                    <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-brand-sky/70 hover:text-brand-royal hover:bg-white/5 transition-colors cursor-pointer"
                                    title="Notificaciones"
                                    aria-label="Ver notificaciones"
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-brand-sky/70 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
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
