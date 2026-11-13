import { faFacebookF, faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
    return (
        <footer id="contacto" className="bg-brand-navy text-white pt-16 pb-12 border-t-4 border-brand-royal">
            <div className="section-container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
                    {/* Columna Marca & Identidad */}
                    <div data-aos="fade-up" data-aos-delay="50" className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1 rounded-lg">
                                <img
                                    src="/Logo Isabel Zapatos.svg"
                                    alt="Isabel Logo Footer"
                                    className="h-10 w-auto"
                                />
                            </div>
                            <div>
                                <span className="text-xl font-bold tracking-tight text-white block">
                                    ISABEL
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-brand-sky font-semibold">
                                    Bodega de Calzado & Distribución
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-white/75 leading-relaxed max-w-sm">
                            Bodega proveedora de calzado de alta rotación para tiendas y comercios. Precios directos y compras flexibles a pocas unidades con envíos a todo el país.
                        </p>

                        {/* Redes Sociales */}
                        <div className="flex items-center gap-3 pt-2">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-royal text-white flex items-center justify-center transition-colors"
                                aria-label="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebookF} className="text-sm" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-royal text-white flex items-center justify-center transition-colors"
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-royal text-white flex items-center justify-center transition-colors"
                                aria-label="WhatsApp"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                            </a>
                        </div>
                    </div>

                    {/* Enlaces de Exploración */}
                    <div data-aos="fade-up" data-aos-delay="150">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                            Líneas de Calzado
                        </h4>
                        <ul className="space-y-2.5 text-sm text-white/80">
                            <li>
                                <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                                    Línea Formal & Oficina
                                </a>
                            </li>
                            <li>
                                <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                                    Casual & Confort
                                </a>
                            </li>
                            <li>
                                <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                                    Sneakers & Urbanos
                                </a>
                            </li>
                            <li>
                                <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                                    Botas y Botines
                                </a>
                            </li>
                            <li>
                                <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                                    Lotes en Liquidación
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Ayuda y Soporte */}
                    <div data-aos="fade-up" data-aos-delay="250">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                            Atención a Clientes
                        </h4>
                        <ul className="space-y-2.5 text-sm text-white/80">
                            <li>
                                <a href="#" className="hover:text-brand-sky transition-colors">
                                    Guía de Tallas
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-brand-sky transition-colors">
                                    Tiempos y Fletes de Bodega
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-brand-sky transition-colors">
                                    Política de Garantías
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-brand-sky transition-colors">
                                    Preguntas Frecuentes
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-brand-sky transition-colors">
                                    Asesoría para Tiendas
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto Directo */}
                    <div data-aos="fade-up" data-aos-delay="350">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                            Despachos & Bodega
                        </h4>
                        <ul className="space-y-3 text-sm text-white/80">
                            <li className="flex items-start gap-2.5">
                                <FontAwesomeIcon icon={faLocationDot} className="text-brand-sky mt-1 text-xs shrink-0" />
                                <span>Zona Industrial del Calzado #45-12, Colombia</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faPhone} className="text-brand-sky text-xs shrink-0" />
                                <span>+57 (601) 320 8900</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faEnvelope} className="text-brand-sky text-xs shrink-0" />
                                <span>ventas@calzadoisabel.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright y Políticas */}
                <div data-aos="fade-in" data-aos-delay="200" className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
                    <p>© {new Date().getFullYear()} Isabel Zapatos • Bodega de Distribución. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">
                            Términos de Compra
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Política de Privacidad
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Envíos y Devoluciones
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}