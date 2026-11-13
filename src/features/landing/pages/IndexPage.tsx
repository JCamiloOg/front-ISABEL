import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faTruckFast,
  faHandHoldingDollar,
  faCheck,
  faStore,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import HeroSection from "../components/HeroSection";
import CardProduct from "../../../shared/components/CardProduct";
import { MOCK_PRODUCTOS_PRISMA } from "../../../data/products";
import { Link } from "@tanstack/react-router";

export default function IndexPage() {
  // Mostrar los primeros 5 productos del mock oficial
  const primerosProductos = MOCK_PRODUCTOS_PRISMA.slice(0, 5);

  return (
    <>
      {/* Hero Section Adaptado */}
      <HeroSection />

      {/* =========================================
          BENEFICIOS: MODELO BODEGA CON COMPRA FLEXIBLE
      ========================================= */}
      <section id="beneficios" className="py-12 bg-brand-navy text-white">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-sky text-brand-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faHandHoldingDollar} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Precios de Bodega</h4>
                <p className="text-xs text-brand-sky mt-0.5">Accede a costo mayorista comprando desde pocas unidades</p>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-royal text-white flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Surtido a tu Medida</h4>
                <p className="text-xs text-brand-sky mt-0.5">Elige las tallas y modelos que más rotan en tu tienda</p>
              </div>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-brand-sky/20"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-sky text-brand-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTruckFast} className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Despachos Express</h4>
                <p className="text-xs text-brand-sky mt-0.5">Envíos directos desde bodega a tu negocio en 24/48h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          CATÁLOGO BREVE DISPONIBLE EN BODEGA (PRIMEROS 5 PRODUCTOS)
      ========================================= */}
      <section id="catalogo" className="py-20 bg-app-bg transition-colors duration-200">
        <div className="section-container">
          {/* Encabezado del catálogo */}
          <div
            data-aos="fade-up"
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <span className="section-subtitle">
                Inventario Disponible en Bodega
              </span>
              <h2 className="section-title mt-1">
                Referencias Listas para Despacho
              </h2>
              <p className="text-sm text-app-muted mt-2 max-w-xl">
                Selecciona pares individuales o combina referencias para completar tu pedido con tarifa directa de bodega.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="badge-sky py-1.5 px-3">
                Compra Mínima Flexible
              </span>
            </div>
          </div>

          {/* Grid de los 5 Zapatos usando el CardProduct */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {primerosProductos.map((producto, index) => (
              <div
                key={producto.idProducto}
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 100}
              >
                <CardProduct producto={producto} />
              </div>
            ))}
          </div>

          {/* Banner de Surtido y Pedidos para Tiendas */}
          <div
            data-aos="zoom-in"
            className="mt-14 bg-linear-to-r from-brand-navy via-brand-navy to-brand-royal rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
          >

            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-sky uppercase tracking-wider">
                <FontAwesomeIcon icon={faStore} />
                <span>Atención a Tiendas & Comercios</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¿Necesitas un surtido específico de curvas o tallas?
              </h3>
              <p className="text-sm text-brand-sky max-w-xl">
                Armamos tu pedido con los números que más necesitas para no estancar capital en tallas de baja rotación.
              </p>
            </div>
            <Link
              to="/catalog"
              className="btn-accent py-3.5 px-6 shrink-0"
            >
              Armar Pedido Surtido
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          SECCIÓN: MODELO DE SUMINISTRO DIRECTO
      ========================================= */}
      <section id="bodega" className="py-20 bg-brand-sky/10 dark:bg-brand-surface-alt/50 border-y border-brand-sky/20 transition-colors duration-200">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right" className="space-y-6">
              <span className="section-subtitle">
                Ventajas de Proveedor Directo
              </span>
              <h2 className="section-title">
                Abastece tu negocio con inventario continuo y sin riesgos
              </h2>
              <p className="text-base text-app-muted leading-relaxed">
                Entendemos que muchas tiendas no pueden congelar dinero comprando cajas gigantes de una sola talla. En Calzado Isabel abrimos las puertas de nuestra bodega para que compres exactamente lo que tu clientela pide, con despacho inmediato y garantía directa.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Pocos pares por referencia:</strong> no estás obligado a comprar curvas completas si no las requieres.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Inventario real en tiempo real:</strong> disponibilidad confirmada al instante desde el catálogo.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-royal text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <p className="text-sm text-app-text">
                    <strong>Empaque individual para vitrina:</strong> calzado presentado en caja individual listo para exhibir y vender.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 font-bold text-brand-royal dark:text-brand-sky hover:underline text-sm"
                >
                  <span>Explorar todas las referencias disponibles</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>
              </div>
            </div>

            <div data-aos="fade-left" className="relative">
              <div className="aspect-video lg:aspect-4/3 rounded-3xl overflow-hidden border-2 border-brand-sky/40 shadow-xl bg-app-surface p-8 flex items-center justify-center">
                <img
                  src="/Logo Isabel Zapatos.svg"
                  alt="Bodega de Calzado Isabel"
                  className="max-h-72 w-auto object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
