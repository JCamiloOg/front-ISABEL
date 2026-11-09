import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faLock,
    faArrowLeft,
    faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../../shared/components/Inputs/Input";
import Button from "../../../shared/components/Button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Preparado para conectar con autenticación
    };

    return (
        <>
            {/* =========================================
                COLUMNA IZQUIERDA: FORMULARIO DE ACCESO
            ========================================= */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10">
                {/* Cabecera / Volver */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-app-muted hover:text-brand-royal dark:hover:text-brand-sky transition-colors group"
                    >
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="text-xs transition-transform duration-200 group-hover:-translate-x-1"
                        />
                        <span>Volver a la tienda</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="badge-sky text-[10px] py-1 px-2.5">
                            Acceso Seguro
                        </span>
                    </div>
                </div>

                {/* Contenido Central: Formulario */}
                <div className="max-w-md w-full mx-auto my-8">
                    {/* Logo y Encabezado */}
                    <div className="mb-8">
                        <div className="inline-flex p-2.5 rounded-2xl bg-white border border-brand-navy/10 shadow-sm mb-4">
                            <img
                                src="/Logo Isabel Zapatos.svg"
                                alt="Logo Calzado Isabel"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <span className="section-subtitle block mb-1">
                            Bienvenido de nuevo
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
                            Inicia sesión en Isabel
                        </h1>
                        <p className="text-sm text-app-muted mt-2">
                            Ingresa tus credenciales para administrar tus pedidos o acceder al panel.
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Campo Global: Correo Electrónico */}
                        <Input
                            id="email"
                            type="email"
                            label="Correo Electrónico"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@isabel.com"
                            icon={faEnvelope}
                        />

                        {/* Campo Global: Contraseña */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold uppercase tracking-wider text-app-text"
                                >
                                    Contraseña
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-semibold text-brand-royal dark:text-brand-sky hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                icon={faLock}
                            />
                        </div>

                        {/* Recordar sesión */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-app-border text-brand-royal focus:ring-brand-sky cursor-pointer"
                                />
                                <span className="text-xs text-app-muted">Recordar mi dispositivo</span>
                            </label>
                        </div>

                        {/* Botón de Enviar */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            fullWidth
                            className="shadow-lg shadow-brand-royal/20"
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Enlace para Registrarse */}
                    <div className="mt-8 pt-6 border-t border-app-border text-center">
                        <p className="text-sm text-app-muted">
                            ¿No tienes una cuenta aún?{" "}
                            <Link
                                to="/register"
                                className="font-bold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
                            >
                                ¿Quieres registrarte?
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer pequeño */}
                <div className="text-center sm:text-left text-xs text-app-muted">
                    <span>© {new Date().getFullYear()} Isabel Zapatos. Todos los derechos reservados.</span>
                </div>
            </div>

            {/* =========================================
                COLUMNA DERECHA: FOTOGRAFÍA EDITORIAL CON OVERLAY
            ========================================= */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10 xl:p-14text-white border-l border-brand-royal/20 select-none">
                {/* Imagen Fotográfica de Fondo */}
                <img
                    src="/login-shoes.jpg"
                    alt="Calzado blanco Isabel con cielo azul"
                    className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700 ease-out"
                />

                {/* lineare y atmósfera en colores corporativos (Azul Marino + Azul Real + Celeste) */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/60 to-brand-royal/35 mix-blend-multiply" />
                <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-brand-navy/90" />

                {/* Cabecera Superior del Panel */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-brand-sky animate-pulse" />
                        <span>Colección Urbano & Confort</span>
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 bg-brand-navy/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        Isabel 2026
                    </span>
                </div>

                {/* Tarjeta Flotante Inferior con Declaración de Marca */}
                <div className="relative z-10 max-w-lg mt-auto">
                    <div className="dark:bg-brand-navy/75 bg-white backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 text-brand-royal dark:text-brand-sky">
                            <FontAwesomeIcon icon={faQuoteLeft} className="text-xl opacity-80" />
                            <span className="text-[11px] font-extrabold uppercase tracking-widest">
                                Estilo en Cada Paso
                            </span>
                        </div>

                        <p className="text-lg sm:text-xl font-bold dark:text-white leading-snug">
                            "La verdadera comodidad es sentir que caminas sobre las nubes, sin perder nunca tu toque auténtico."
                        </p>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/75">
                            <div>
                                <span className="font-extrabold dark:text-white text-brand-navy block">Sneaker Cloud White</span>
                                <span className="text-brand-sky text-[11px]">Diseño ergonómico y ligero</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-brand-royal/80 text-white font-semibold text-[10px]">
                                Edición Limitada
                            </span>
                        </div>
                    </div>

                    {/* Enlace o firma final */}
                    <div className="flex items-center justify-between text-xs text-white/70 pt-4 px-2">
                        <span>{ }</span>
                        <span>Calidad & Dedicación Artesanal</span>
                    </div>
                </div>
            </div>
        </>
    );
}
