import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faIdCard,
    faUser,
    faEnvelope,
    faPhone,
    faLocationDot,
    faLock,
    faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../../shared/components/Inputs/Input";
import Select from "../../../shared/components/Inputs/Select";
import Button from "../../../shared/components/Button";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        tipoDocumento: "CC",
        documentoIdentidad: "",
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
    });

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "confirmPassword" || name === "password") {
            if (name === "confirmPassword" && formData.password && value !== formData.password) {
                setPasswordError("Las contraseñas no coinciden");
            } else if (name === "password" && formData.confirmPassword && value !== formData.confirmPassword) {
                setPasswordError("Las contraseñas no coinciden");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setPasswordError("Las contraseñas no coinciden");
            return;
        }
        // Listo para conectar con el servicio de autenticación
    };

    return (
        <>
            {/* =========================================
                COLUMNA IZQUIERDA: FORMULARIO DE REGISTRO
            ========================================= */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-brand-royal/30">
                {/* Cabecera / Volver */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-row items-center gap-2">
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

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-app-muted hover:text-brand-royal dark:hover:text-brand-sky transition-colors group"
                        >
                            <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="text-xs transition-transform duration-200 group-hover:-translate-x-1"
                            />
                            <span>Iniciar Sesión</span>
                        </Link>

                    </div>

                    <span className="badge-sky text-[10px] py-1 px-2.5">
                        Registro Exclusivo
                    </span>
                </div>

                {/* Contenido Central: Formulario */}
                <div className="max-w-xl w-full mx-auto my-6">
                    {/* Logo y Encabezado */}
                    <div className="mb-6">
                        <span className="section-subtitle block mb-1">
                            Crea tu cuenta
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
                            Únete a la familia Isabel
                        </h1>
                        <p className="text-xs sm:text-sm text-app-muted mt-1.5">
                            Completa tus datos para disfrutar de seguimiento de pedidos, compras seguras y promociones exclusivas.
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Fila 1: Tipo Documento + Documento Identidad */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                            <div className="sm:col-span-6">
                                <Select
                                    id="tipoDocumento"
                                    name="tipoDocumento"
                                    label="Tipo Documento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                    iconLeft={faIdCard}
                                >
                                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                                    <option value="CE">Cédula de Extranjería (CE)</option>
                                    <option value="TI">Tarjeta de Identidad (TI)</option>
                                    <option value="PP">Pasaporte (PP)</option>
                                    <option value="NIT">NIT</option>
                                </Select>
                            </div>

                            <div className="sm:col-span-6">
                                <Input
                                    id="documentoIdentidad"
                                    name="documentoIdentidad"
                                    label="Documento de Identidad"
                                    type="text"
                                    required
                                    value={formData.documentoIdentidad}
                                    onChange={handleChange}
                                    placeholder="Número de documento"
                                    iconLeft={faIdCard}
                                />
                            </div>
                        </div>

                        {/* Fila 2: Nombre + Apellido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <Input
                                id="nombre"
                                name="nombre"
                                label="Nombre"
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                icon={faUser}
                            />
                            <Input
                                id="apellido"
                                name="apellido"
                                label="Apellido"
                                type="text"
                                required
                                value={formData.apellido}
                                onChange={handleChange}
                                placeholder="Tu apellido"
                                icon={faUser}
                            />
                        </div>

                        {/* Fila 3: Correo + Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <Input
                                id="correo"
                                name="correo"
                                label="Correo Electrónico"
                                type="email"
                                required
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                icon={faEnvelope}
                            />
                            <Input
                                id="telefono"
                                name="telefono"
                                label="Teléfono"
                                type="tel"
                                required
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="+57 300 000 0000"
                                icon={faPhone}
                            />
                        </div>

                        {/* Fila 4: Dirección */}
                        <Input
                            id="direccion"
                            name="direccion"
                            label="Dirección de Envío"
                            type="text"
                            required
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Calle, carrera, número, ciudad"
                            icon={faLocationDot}
                        />

                        {/* Fila 5: Contraseña + Confirmar Contraseña */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <Input
                                id="password"
                                name="password"
                                label="Contraseña"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                icon={faLock}
                            />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirmar Contraseña"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                icon={faLock}
                                error={passwordError}
                            />
                        </div>

                        {/* Aceptación de Términos */}
                        <div className="pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-app-border text-brand-royal focus:ring-brand-sky cursor-pointer"
                                />
                                <span className="text-xs text-app-muted leading-relaxed">
                                    Acepto los{" "}
                                    <a href="#" className="font-semibold text-brand-royal dark:text-brand-sky hover:underline">
                                        Términos de Servicio
                                    </a>{" "}
                                    y la{" "}
                                    <a href="#" className="font-semibold text-brand-royal dark:text-brand-sky hover:underline">
                                        Política de Privacidad
                                    </a>{" "}
                                    de Calzado Isabel.
                                </span>
                            </label>
                        </div>

                        {/* Botón de Registro */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                fullWidth
                                className="shadow-lg shadow-brand-royal/20"
                            >
                                Crear Cuenta
                            </Button>
                        </div>
                    </form>

                    {/* Enlace para Iniciar Sesión */}
                    <div className="mt-6 pt-5 border-t border-app-border text-center">
                        <p className="text-sm text-app-muted">
                            ¿Ya tienes una cuenta registrada?{" "}
                            <Link
                                to="/login"
                                className="font-bold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
                            >
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer pequeño */}
                <div className="text-center sm:text-left text-xs text-app-muted pt-4">
                    <span>© {new Date().getFullYear()} Isabel Zapatos. Todos los derechos reservados.</span>
                </div>
            </div>

            {/* =========================================
                COLUMNA DERECHA: FOTOGRAFÍA EDITORIAL CON OVERLAY
            ========================================= */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white border-l border-brand-royal/20 select-none">
                {/* Imagen Fotográfica de Fondo */}
                <img
                    src="/shoesBlackWhite.jpg"
                    alt="Calzado artesanal en blanco y negro Isabel"
                    className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-700 ease-out"
                />

                {/* lineare y atmósfera en colores corporativos (#0E2347 Marino + #2B62D9 Royal) */}
                <div className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/65 to-brand-royal/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-brand-navy/95" />

                {/* Cabecera Superior del Panel */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-brand-sky animate-pulse" />
                        <span>Colección Artesanal Black & White</span>
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 bg-brand-navy/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                        Isabel Signature
                    </span>
                </div>

                {/* Tarjeta Flotante Inferior con Declaración de Marca */}
                <div className="relative z-10 max-w-lg mt-auto">
                    <div className="dark:bg-brand-navy/80 bg-white backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 text-brand-sky">
                            <FontAwesomeIcon icon={faQuoteLeft} className="text-xl opacity-80" />
                            <span className="text-[11px] font-extrabold uppercase tracking-widest">
                                Tradición y Calidad
                            </span>
                        </div>

                        <p className="text-lg sm:text-xl font-bold dark:text-white text-brand-navy leading-snug">
                            "El diseño clásico nunca pasa de moda cuando está respaldado por costuras hechas a mano y materiales auténticos."
                        </p>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/75">
                            <div>
                                <span className="font-extrabold dark:text-white text-brand-navy block">Black & White Edition</span>
                                <span className="text-brand-sky text-[11px]">Acabados de cuero genuino</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-brand-royal/80 text-white font-semibold text-[10px]">
                                Nueva Colección
                            </span>
                        </div>
                    </div>

                    {/* Firma final */}
                    <div className="flex items-center justify-between text-xs text-white/70 pt-4 px-2">
                        <span></span>
                        <span>Pasión por el detalle artesanal</span>
                    </div>
                </div>
            </div>
        </>
    );
}
