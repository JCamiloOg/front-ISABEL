import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartPie,
    faShoePrints,
    faBoxesStacked,
    faCartShopping,
    faUsers,
    faChartLine,
    faGear,
    faRightFromBracket,
    faChevronLeft,
    faChevronRight,
    faStore,
    faBell,
    faHeadset,
} from "@fortawesome/free-solid-svg-icons";

interface NavItem {
    id: string;
    label: string;
    icon: typeof faChartPie;
    badge?: string;
    badgeColor?: "primary" | "accent";
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState("overview");

    const navigationSections: NavSection[] = [
        {
            title: "Principal",
            items: [
                { id: "overview", label: "Dashboard", icon: faChartPie },
            ],
        },
        {
            title: "Gestión de Producto",
            items: [
                { id: "products", label: "Calzado", icon: faShoePrints, badgeColor: "accent" },

            ]
        },
        {
            title: "Gestión ventas",
            items: [
                { id: "customers", label: "Clientes ", icon: faUsers },
                { id: "analytics", label: "Ventas", icon: faChartLine },
            ],
        },
        {
            title: "Sistema",
            items: [
                { id: "settings", label: "Configuración", icon: faGear },
                { id: "support", label: "Soporte Técnico", icon: faHeadset },
            ],
        },
    ];

    return (
        <aside
            className={`relative flex flex-col h-screen bg-[#0E2347] text-[#FFFFFF] border-r border-[#2B62D9]/20 transition-all duration-300 ease-in-out select-none ${isCollapsed ? "w-20" : "w-72"
                }`}
        >
            {/* Botón Flotante para Colapsar/Expandir */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-8 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-[#2B62D9] text-[#FFFFFF] shadow-md hover:bg-[#52A5E8] hover:text-[#0E2347] transition-all cursor-pointer border-2 border-[#0E2347]"
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
            <div className="flex items-center h-20 px-4 border-b border-[#FFFFFF]/10 gap-3 overflow-hidden shrink-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFFFF] p-1.5 shadow-sm">
                    <img
                        src="/Logo Isabel Zapatos.svg"
                        alt="Isabel Logo"
                        className="h-full w-full object-contain"
                    />
                </div>

                {!isCollapsed && (
                    <div className="flex flex-col min-w-0 transition-opacity duration-300">
                        <span className="text-lg font-bold tracking-tight text-[#FFFFFF] leading-none truncate">
                            ISABEL
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#52A5E8] font-semibold mt-1 truncate">
                            Panel Administrativo
                        </span>
                    </div>
                )}
            </div>

            {/* =========================================
          NAVEGACIÓN PRINCIPAL
      ========================================= */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-6 scrollbar-thin scrollbar-thumb-[#2B62D9]/30">
                {navigationSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        {/* Título de Sección */}
                        {!isCollapsed ? (
                            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#52A5E8]/70 mb-2">
                                {section.title}
                            </p>
                        ) : (
                            <div className="h-px bg-[#FFFFFF]/10 mx-2 my-3" />
                        )}

                        {/* Elementos de Navegación */}
                        {section.items.map((item) => {
                            const isActive = activeItem === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveItem(item.id)}
                                    className={`group relative flex w-full items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                        ? "bg-[#2B62D9] text-[#FFFFFF] shadow-sm shadow-[#2B62D9]/40"
                                        : "text-[#FFFFFF]/75 hover:bg-[#FFFFFF]/5 hover:text-[#FFFFFF]"
                                        }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {/* Indicador de píldora activa */}
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#52A5E8] rounded-r-md" />
                                    )}

                                    {/* Icono */}
                                    <div
                                        className={`flex h-6 w-6 items-center justify-center shrink-0 text-base transition-colors ${isActive
                                            ? "text-[#FFFFFF]"
                                            : "text-[#52A5E8] group-hover:text-[#FFFFFF]"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={item.icon} />
                                    </div>

                                    {/* Etiqueta y Badges (cuando no está colapsado) */}
                                    {!isCollapsed && (
                                        <div className="flex flex-1 items-center justify-between min-w-0">
                                            <span className="truncate">{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${item.badgeColor === "accent"
                                                        ? "bg-[#52A5E8] text-[#0E2347]"
                                                        : "bg-[#FFFFFF]/20 text-[#FFFFFF]"
                                                        }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Tooltip flotante cuando está colapsado */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-3 hidden rounded-lg bg-[#0E2347] border border-[#52A5E8]/30 px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] shadow-xl group-hover:flex z-50 whitespace-nowrap items-center gap-2">
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span
                                                    className={`px-1.5 py-0.2 rounded-full text-[9px] ${item.badgeColor === "accent"
                                                        ? "bg-[#52A5E8] text-[#0E2347]"
                                                        : "bg-[#2B62D9] text-[#FFFFFF]"
                                                        }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}

                {/* Tarjeta de Acceso Rápido a la Tienda Pública */}
                {!isCollapsed && (
                    <div className="mt-6 pt-4 border-t border-[#FFFFFF]/10">
                        <div className="bg-gradient-to-br from-[#2B62D9]/25 to-[#52A5E8]/10 rounded-2xl p-3.5 border border-[#52A5E8]/20">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#52A5E8] text-[#0E2347] shrink-0">
                                    <FontAwesomeIcon icon={faStore} className="text-sm" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#FFFFFF]">Tienda en Vivo</p>
                                    <p className="text-[10px] text-[#52A5E8]">isabelzapatos.com</p>
                                </div>
                            </div>
                            <a
                                href="/"
                                className="mt-2 block w-full text-center py-1.5 rounded-lg bg-[#52A5E8]/15 hover:bg-[#52A5E8]/30 text-[#FFFFFF] text-xs font-semibold border border-[#52A5E8]/30 transition-colors"
                            >
                                Ver Tienda
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================
          PERFIL DE USUARIO & CERRAR SESIÓN
      ========================================= */}
            <div className="p-3 border-t border-[#FFFFFF]/10 bg-[#0E2347]/90 shrink-0">
                <div
                    className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#FFFFFF]/5 transition-colors ${isCollapsed ? "justify-center" : ""
                        }`}
                >
                    {/* Avatar del Administrador */}
                    <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2B62D9] to-[#52A5E8] text-[#FFFFFF] font-bold text-sm shadow-sm">
                            AD
                        </div>
                        {/* Indicador en línea */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0E2347]" />
                    </div>

                    {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between min-w-0">
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[#FFFFFF] truncate">
                                    Admin Calzado
                                </p>
                                <p className="text-[10px] text-[#52A5E8] truncate">
                                    admin@isabel.com
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-[#FFFFFF]/70 hover:text-[#52A5E8] hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer"
                                    title="Notificaciones"
                                    aria-label="Ver notificaciones"
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    className="p-1.5 rounded-lg text-[#FFFFFF]/70 hover:text-red-400 hover:bg-[#FFFFFF]/5 transition-colors cursor-pointer"
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
