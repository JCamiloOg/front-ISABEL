import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faStar,
  faShieldHalved,
  faTruckFast,
  faRotateLeft,
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import HeroSection from "../components/HeroSection";

// Catálogo de 5 zapatos representativos de calzado Isabel
const FEATURED_SHOES = [
  {
    id: 1,
    name: "Classic Oxford Navy",
    category: "Formal & Urbano",
    price: "$219.000",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=700&q=80",
    badge: "Exclusivo",
  },
  {
    id: 2,
    name: "Sneaker Urbano Celeste",
    category: "Casual Sport",
    price: "$185.000",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    badge: "Más Vendido",
  },
  {
    id: 3,
    name: "Mocasín Artesanal Blue",
    category: "Cuero Genuino",
    price: "$240.000",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=700&q=80",
    badge: "Artesanal",
  },
  {
    id: 4,
    name: "Bota Chelsea Deep Blue",
    category: "Elegancia Casual",
    price: "$265.000",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=700&q=80",
    badge: "Temporada",
  },
  {
    id: 5,
    name: "Runner Flow Light",
    category: "Confort Diario",
    price: "$175.000",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=700&q=80",
    badge: "Ligero",
  },
];

export default function IndexPage() {
  return (
    <>

      <HeroSection />



      {/* =========================================
          BENEFICIOS / PROPUESTA DE VALOR
      ========================================= */}
      <section id="beneficios" className="py-12 bg-brand-navy text-white">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20">
              <div className="w-12 h-12 rounded-xl bg-brand-sky text-brand-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTruckFast} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Envíos Seguros</h4>
                <p className="text-xs text-brand-sky mt-0.5">Cobertura nacional garantizada</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20">
              <div className="w-12 h-12 rounded-xl bg-brand-royal text-white flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Garantía Total</h4>
                <p className="text-xs text-brand-sky mt-0.5">Calidad y autenticidad comprobada</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20">
              <div className="w-12 h-12 rounded-xl bg-brand-sky text-brand-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faRotateLeft} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Cambios Fáciles</h4>
                <p className="text-xs text-brand-sky mt-0.5">30 días sin complicaciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CATÁLOGO BREVE (MÁXIMO 5 ZAPATOS)
      ========================================= */}
      <section id="catalogo" className="py-20 bg-app-bg transition-colors duration-200">
        <div className="section-container">
          {/* Encabezado del catálogo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="section-subtitle">
                Selección Exclusiva
              </span>
              <h2 className="section-title mt-1">
                Catálogo Destacado
              </h2>
              <p className="text-sm text-app-muted mt-2 max-w-xl">
                Nuestros 5 modelos más apreciados por estilo, durabilidad y confort anatómico.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="badge-sky py-1.5 px-3">
                5 Modelos Disponibles
              </span>
            </div>
          </div>

          {/* Grid de 5 Zapatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FEATURED_SHOES.map((shoe) => (
              <div
                key={shoe.id}
                className="group flex flex-col isabel-card"
              >
                {/* Contenedor de la Imagen */}
                <div className="relative aspect-square overflow-hidden bg-brand-sky/10 dark:bg-brand-surface-alt">
                  <img
                    src={shoe.image}
                    alt={shoe.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badge */}
                  <span className="badge-navy absolute top-3 left-3 shadow-sm">
                    {shoe.badge}
                  </span>
                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-app-surface/90 backdrop-blur-sm text-app-text text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-app-border">
                    <FontAwesomeIcon icon={faStar} className="text-brand-royal dark:text-brand-sky text-[10px]" />
                    {shoe.rating}
                  </div>
                </div>

                {/* Detalles del Zapato */}
                <div className="p-4 flex flex-col grow justify-between space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-brand-royal dark:text-brand-sky">
                      {shoe.category}
                    </p>
                    <h3 className="font-bold text-base text-app-text line-clamp-1 group-hover:text-brand-royal dark:group-hover:text-brand-sky transition-colors">
                      {shoe.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-app-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-app-muted block uppercase font-medium">Precio</span>
                      <span className="text-lg font-extrabold text-app-text">
                        {shoe.price}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-brand-royal hover:bg-brand-navy dark:hover:bg-brand-sky dark:hover:text-brand-navy text-white transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
                      title="Añadir al carrito"
                      aria-label={`Añadir ${shoe.name} al carrito`}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner complementario dentro del catálogo */}
          <div className="mt-14 bg-linear-to-r from-brand-navy via-brand-navy to-brand-royal rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿Buscas una talla o personalización especial?
              </h3>
              <p className="text-sm text-brand-sky max-w-xl">
                Fabricamos pedidos por encargo con acabados únicos y asesoría de horma personalizada.
              </p>
            </div>
            <button
              type="button"
              className="btn-accent py-3.5 px-6 shrink-0"
            >
              Consultar con un Asesor
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          SECCIÓN ARTESANÍA / ESENCIA
      ========================================= */}
      <section id="artesania" className="py-20 bg-brand-sky/10 dark:bg-brand-surface-alt/50 border-y border-brand-sky/20 transition-colors duration-200">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="section-subtitle">
                Tradición y Pasión
              </span>
              <h2 className="section-title">
                Cada detalle cuenta una historia de excelencia
              </h2>
              <p className="text-base text-app-muted leading-relaxed">
                En Calzado Isabel unimos las técnicas tradicionales de zapatería con la ergonomía
                moderna. Seleccionamos cuidadosamente pieles, costuras y plantillas de alta densidad
                para ofrecer una experiencia de confort inigualable durante todo el día.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Hormas ergonómicas:</strong> adaptadas a la estructura anatómica real.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Costuras reforzadas:</strong> resistencia prolongada al uso constante.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Empaque distintivo:</strong> presentación cuidada desde el unboxing.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video lg:aspect-4/3 rounded-3xl overflow-hidden border-2 border-brand-sky/40 shadow-xl bg-app-surface p-8 flex items-center justify-center">
                <img
                  src="/Logo Isabel Zapatos.svg"
                  alt="Esencia Calzado Isabel"
                  className="max-h-72 w-auto object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer id="contacto" className="bg-brand-navy text-white pt-16 pb-12 border-t-4 border-brand-royal">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Columna Marca & Identidad */}
            <div className="lg:col-span-2 space-y-4">
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
                    Zapatos & Estilo
                  </span>
                </div>
              </div>

              <p className="text-sm text-white/75 leading-relaxed max-w-sm">
                Comprometidos con el calzado auténtico, combinando innovación y herencia
                artesanal para que cada paso refleje tu seguridad.
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
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                Colección
              </h4>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                    Zapatos Formales
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                    Línea Casual
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                    Sneakers Urbanos
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                    Botas & Botines
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-brand-sky transition-colors">
                    Ediciones Limitadas
                  </a>
                </li>
              </ul>
            </div>

            {/* Ayuda y Soporte */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                Atención al Cliente
              </h4>
              <ul className="space-y-2.5 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-brand-sky transition-colors">
                    Guía de Tallas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-sky transition-colors">
                    Política de Envíos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-sky transition-colors">
                    Garantías y Cambios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-sky transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-sky transition-colors">
                    Cuidado del Calzado
                  </a>
                </li>
              </ul>
            </div>

            {/* Contacto Directo */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sky mb-4">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-brand-sky mt-1 text-xs shrink-0" />
                  <span>Av. Principal del Calzado #45-12, Colombia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faPhone} className="text-brand-sky text-xs shrink-0" />
                  <span>+57 (601) 320 8900</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-brand-sky text-xs shrink-0" />
                  <span>contacto@calzadoisabel.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright y Políticas */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
            <p>© {new Date().getFullYear()} Isabel Zapatos. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
