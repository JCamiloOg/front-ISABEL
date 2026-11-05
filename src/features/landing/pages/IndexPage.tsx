import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faUser,
  faArrowRight,
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#0E2347] font-sans selection:bg-[#52A5E8]/30 selection:text-[#0E2347]">
      {/* =========================================
          BARRA DE AVISO SUPERIOR
      ========================================= */}
      <div className="bg-[#0E2347] text-xs text-[#FFFFFF]/85 py-2 px-4 text-center border-b border-[#2B62D9]/20 tracking-wide">
        <span>Envíos gratuitos a todo el país en pedidos superiores a $200.000 • Calidad hecha con dedicación</span>
      </div>

      {/* =========================================
          NAVBAR
      ========================================= */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#0E2347]/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group">
              <img
                src="/Logo Isabel Zapatos.svg"
                alt="Logo Isabel Zapatos"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#0E2347] leading-none">
                  ISABEL
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#2B62D9] font-semibold mt-0.5">
                  Calzado Artesanal
                </span>
              </div>
            </a>
          </div>

          {/* Enlaces de Navegación */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0E2347]">
            <a href="#catalogo" className="hover:text-[#2B62D9] transition-colors">
              Catálogo
            </a>
            <a href="#artesania" className="hover:text-[#2B62D9] transition-colors">
              Nuestra Esencia
            </a>
            <a href="#beneficios" className="hover:text-[#2B62D9] transition-colors">
              Beneficios
            </a>
            <a href="#contacto" className="hover:text-[#2B62D9] transition-colors">
              Contacto
            </a>
          </nav>

          {/* Botones de Acción: Carrito e Inicio de Sesión */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón de Carrito */}
            <button
              type="button"
              className="relative p-2.5 rounded-full text-[#0E2347] hover:bg-[#52A5E8]/15 hover:text-[#2B62D9] transition-colors duration-200"
              aria-label="Ver carrito de compras"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-[#2B62D9] text-[#FFFFFF] text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                2
              </span>
            </button>

            {/* Botón de Inicio de Sesión */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-[#0E2347] bg-[#52A5E8]/15 hover:bg-[#52A5E8]/25 border border-[#52A5E8]/40 hover:border-[#2B62D9] transition-all duration-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faUser} className="text-[#2B62D9]" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </button>

            {/* CTA Primario rápido */}
            <a
              href="#catalogo"
              className="hidden lg:inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm text-[#FFFFFF] bg-[#2B62D9] hover:bg-[#0E2347] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Explorar Colección
            </a>
          </div>
        </div>
      </header>

      {/* =========================================
          HERO SECTION
      ========================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Fondos geométricos sutiles con paleta corporativa */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-[#52A5E8]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-[#2B62D9]/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#52A5E8]/15 border border-[#52A5E8]/30 text-xs font-semibold text-[#0E2347]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#2B62D9]"></span>
                Nueva Colección Isabel 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0E2347] tracking-tight leading-[1.12]">
                La elegancia que camina con{" "}
                <span className="text-[#2B62D9] underline decoration-[#52A5E8] decoration-4 underline-offset-4">
                  tu autenticidad
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#0E2347]/80 max-w-xl leading-relaxed">
                Descubre calzado diseñado con precisión artesanal, materiales de primera calidad
                y la comodidad justa para acompañar cada uno de tus pasos importantes.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-[#FFFFFF] bg-[#2B62D9] hover:bg-[#0E2347] shadow-lg shadow-[#2B62D9]/25 hover:shadow-[#0E2347]/25 transition-all duration-300"
                >
                  Ver Catálogo Destacado
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </a>

                <a
                  href="#artesania"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[#0E2347] bg-[#FFFFFF] hover:bg-[#52A5E8]/10 border-2 border-[#0E2347]/15 hover:border-[#2B62D9] transition-all duration-200"
                >
                  Conocer Fabricación
                </a>
              </div>

              {/* Métricas / Social Proof */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#0E2347]/10 max-w-lg">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0E2347]">+15k</p>
                  <p className="text-xs text-[#0E2347]/70 font-medium">Clientes satisfechos</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#2B62D9]">100%</p>
                  <p className="text-xs text-[#0E2347]/70 font-medium">Cuero genuino</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0E2347]">4.9/5</p>
                  <p className="text-xs text-[#0E2347]/70 font-medium">Valoración media</p>
                </div>
              </div>
            </div>

            {/* Imagen / Composición Visual Hero */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Marco de fondo */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2B62D9] to-[#52A5E8] rounded-3xl transform rotate-3 scale-95 opacity-25 filter blur-lg" />
                
                <div className="relative bg-[#FFFFFF] border-2 border-[#52A5E8]/30 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#52A5E8]/10 to-transparent p-6 text-center">
                    <img
                      src="/Logo Isabel Zapatos.svg"
                      alt="Caja y Calzado Isabel"
                      className="w-full max-w-[320px] mx-auto h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between bg-[#52A5E8]/10 rounded-2xl p-4 border border-[#52A5E8]/20">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#2B62D9]">
                        Edición Especial
                      </p>
                      <h4 className="text-base font-bold text-[#0E2347]">
                        Empaque Artesanal Isabel
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-[#2B62D9] text-[#FFFFFF] text-xs font-bold rounded-lg shadow-sm">
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          BENEFICIOS / PROPUESTA DE VALOR
      ========================================= */}
      <section id="beneficios" className="py-12 bg-[#0E2347] text-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 bg-[#FFFFFF]/5 p-6 rounded-2xl border border-[#52A5E8]/20">
              <div className="w-12 h-12 rounded-xl bg-[#52A5E8] text-[#0E2347] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTruckFast} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#FFFFFF]">Envíos Seguros</h4>
                <p className="text-xs text-[#52A5E8] mt-0.5">Cobertura nacional garantizada</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#FFFFFF]/5 p-6 rounded-2xl border border-[#52A5E8]/20">
              <div className="w-12 h-12 rounded-xl bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#FFFFFF]">Garantía Total</h4>
                <p className="text-xs text-[#52A5E8] mt-0.5">Calidad y autenticidad comprobada</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#FFFFFF]/5 p-6 rounded-2xl border border-[#52A5E8]/20">
              <div className="w-12 h-12 rounded-xl bg-[#52A5E8] text-[#0E2347] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faRotateLeft} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#FFFFFF]">Cambios Fáciles</h4>
                <p className="text-xs text-[#52A5E8] mt-0.5">30 días sin complicaciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CATÁLOGO BREVE (MÁXIMO 5 ZAPATOS)
      ========================================= */}
      <section id="catalogo" className="py-20 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado del catálogo */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B62D9]">
                Selección Exclusiva
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E2347] mt-1 tracking-tight">
                Catálogo Destacado
              </h2>
              <p className="text-sm text-[#0E2347]/70 mt-2 max-w-xl">
                Nuestros 5 modelos más apreciados por estilo, durabilidad y confort anatómico.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#52A5E8]/15 text-[#0E2347] border border-[#52A5E8]/30">
                5 Modelos Disponibles
              </span>
            </div>
          </div>

          {/* Grid de 5 Zapatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FEATURED_SHOES.map((shoe) => (
              <div
                key={shoe.id}
                className="group flex flex-col bg-[#FFFFFF] rounded-2xl border border-[#0E2347]/10 hover:border-[#2B62D9]/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Contenedor de la Imagen */}
                <div className="relative aspect-square overflow-hidden bg-[#52A5E8]/5">
                  <img
                    src={shoe.image}
                    alt={shoe.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-[#0E2347] text-[#FFFFFF] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    {shoe.badge}
                  </span>
                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-[#FFFFFF]/90 backdrop-blur-sm text-[#0E2347] text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <FontAwesomeIcon icon={faStar} className="text-[#2B62D9] text-[10px]" />
                    {shoe.rating}
                  </div>
                </div>

                {/* Detalles del Zapato */}
                <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#2B62D9]">
                      {shoe.category}
                    </p>
                    <h3 className="font-bold text-base text-[#0E2347] line-clamp-1 group-hover:text-[#2B62D9] transition-colors">
                      {shoe.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-[#0E2347]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#0E2347]/60 block uppercase font-medium">Precio</span>
                      <span className="text-lg font-extrabold text-[#0E2347]">
                        {shoe.price}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-[#2B62D9] hover:bg-[#0E2347] text-[#FFFFFF] transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
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
          <div className="mt-14 bg-gradient-to-r from-[#0E2347] via-[#0E2347] to-[#2B62D9] rounded-3xl p-8 sm:p-12 text-[#FFFFFF] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
                ¿Buscas una talla o personalización especial?
              </h3>
              <p className="text-sm text-[#52A5E8] max-w-xl">
                Fabricamos pedidos por encargo con acabados únicos y asesoría de horma personalizada.
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#52A5E8] hover:bg-[#FFFFFF] text-[#0E2347] transition-all duration-200 shrink-0 cursor-pointer shadow-md"
            >
              Consultar con un Asesor
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          SECCIÓN ARTESANÍA / ESENCIA
      ========================================= */}
      <section id="artesania" className="py-20 bg-[#52A5E8]/10 border-y border-[#52A5E8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B62D9]">
                Tradición y Pasión
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E2347] tracking-tight">
                Cada detalle cuenta una historia de excelencia
              </h2>
              <p className="text-base text-[#0E2347]/80 leading-relaxed">
                En Calzado Isabel unimos las técnicas tradicionales de zapatería con la ergonomía
                moderna. Seleccionamos cuidadosamente pieles, costuras y plantillas de alta densidad
                para ofrecer una experiencia de confort inigualable durante todo el día.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-[#0E2347]">
                    <strong>Hormas ergonómicas:</strong> adaptadas a la estructura anatómica real.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-[#0E2347]">
                    <strong>Costuras reforzadas:</strong> resistencia prolongada al uso constante.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center text-xs mt-0.5 shrink-0">
                    ✓
                  </div>
                  <p className="text-sm text-[#0E2347]">
                    <strong>Empaque distintivo:</strong> presentación cuidada desde el unboxing.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video lg:aspect-4/3 rounded-3xl overflow-hidden border-2 border-[#52A5E8]/40 shadow-xl bg-[#FFFFFF] p-8 flex items-center justify-center">
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
      <footer id="contacto" className="bg-[#0E2347] text-[#FFFFFF] pt-16 pb-12 border-t-4 border-[#2B62D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#FFFFFF]/10">
            {/* Columna Marca & Identidad */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/Logo Isabel Zapatos.svg"
                  alt="Isabel Logo Footer"
                  className="h-10 w-auto bg-[#FFFFFF] p-1 rounded-lg"
                />
                <div>
                  <span className="text-xl font-bold tracking-tight text-[#FFFFFF] block">
                    ISABEL
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#52A5E8] font-semibold">
                    Zapatos & Estilo
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#FFFFFF]/75 leading-relaxed max-w-sm">
                Comprometidos con el calzado auténtico, combinando innovación y herencia
                artesanal para que cada paso refleje tu seguridad.
              </p>

              {/* Redes Sociales */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF]/10 hover:bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FontAwesomeIcon icon={faFacebookF} className="text-sm" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF]/10 hover:bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-full bg-[#FFFFFF]/10 hover:bg-[#2B62D9] text-[#FFFFFF] flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                </a>
              </div>
            </div>

            {/* Enlaces de Exploración */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#52A5E8] mb-4">
                Colección
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FFFFFF]/80">
                <li>
                  <a href="#catalogo" className="hover:text-[#52A5E8] transition-colors">
                    Zapatos Formales
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-[#52A5E8] transition-colors">
                    Línea Casual
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-[#52A5E8] transition-colors">
                    Sneakers Urbanos
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-[#52A5E8] transition-colors">
                    Botas & Botines
                  </a>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-[#52A5E8] transition-colors">
                    Ediciones Limitadas
                  </a>
                </li>
              </ul>
            </div>

            {/* Ayuda y Soporte */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#52A5E8] mb-4">
                Atención al Cliente
              </h4>
              <ul className="space-y-2.5 text-sm text-[#FFFFFF]/80">
                <li>
                  <a href="#" className="hover:text-[#52A5E8] transition-colors">
                    Guía de Tallas
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#52A5E8] transition-colors">
                    Política de Envíos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#52A5E8] transition-colors">
                    Garantías y Cambios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#52A5E8] transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#52A5E8] transition-colors">
                    Cuidado del Calzado
                  </a>
                </li>
              </ul>
            </div>

            {/* Contacto Directo */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#52A5E8] mb-4">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-[#FFFFFF]/80">
                <li className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#52A5E8] mt-1 text-xs shrink-0" />
                  <span>Av. Principal del Calzado #45-12, Colombia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faPhone} className="text-[#52A5E8] text-xs shrink-0" />
                  <span>+57 (601) 320 8900</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-[#52A5E8] text-xs shrink-0" />
                  <span>contacto@calzadoisabel.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright y Políticas */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFFFFF]/60 gap-4">
            <p>© {new Date().getFullYear()} Isabel Zapatos. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#FFFFFF] transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="hover:text-[#FFFFFF] transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-[#FFFFFF] transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
