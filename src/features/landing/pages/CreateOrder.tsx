import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCartShopping,
    faUserCheck,
    faBuildingColumns,
    faCircleCheck,
    faArrowRight,
    faArrowLeft,
    faTrashCan,
    faMinus,
    faPlus,
    faShieldHalved,
    faQrcode,
    faCloudArrowUp,
    faReceipt,
    faCopy,
    faCheck,
    faPhone,
    faEnvelope,
    faIdCard,
    faLocationDot,
    faCity,
    faTruckFast,
    faStore,
    faLock,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import useCart from "../../../shared/hooks/useCart";
import { useUser } from "../../../shared/hooks/useUser";
import Button from "../../../shared/components/Button";
import { MySwal, Toast } from "../../../shared/utils/alerts";

// Tipos para el wizard
type StepId = 1 | 2 | 3 | 4;

interface StepConfig {
    id: StepId;
    title: string;
    subtitle: string;
    icon: typeof faCartShopping;
}

const STEPS: StepConfig[] = [
    { id: 1, title: "Revisar Carrito", subtitle: "Confirma tus pares", icon: faCartShopping },
    { id: 2, title: "Tus Datos", subtitle: "Facturación y envío", icon: faUserCheck },
    { id: 3, title: "Pago Seguro", subtitle: "Transferencia QR", icon: faBuildingColumns },
    { id: 4, title: "Confirmado", subtitle: "Pedido registrado", icon: faCircleCheck },
];

export default function CreateOrder() {
    const {
        cartItems,
        removeFromCart,
        plusOne,
        deductOne,
        totalCartPrice,
        totalCartItems,
        clearCart,
    } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<StepId>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);

    // Archivo de comprobante de pago
    const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptError, setReceiptError] = useState<string | null>(null);
    const [orderCode, setOrderCode] = useState<string>("");

    // Datos quemados del usuario logueado con fallback enriquecido
    const clienteData = {
        nombreCompleto: user?.name || "Juan Camilo Osorio",
        email: user?.email || "osoriojuancamilo315@gmail.com",
        documento: "C.C. 1.025.894.321",
        telefono: "+57 312 458 9210",
        direccion: "Carrera 45 # 68 - 24, Barrio El Poblado",
        ciudad: "Medellín, Antioquia",
        tipoCliente: "Comprador Frecuente (Calzado Isabel)",
    };

    // Datos de la cuenta bancaria para la transferencia
    const bankDetails = {
        banco: "Bancolombia",
        tipoCuenta: "Cuenta de Ahorros",
        numeroCuenta: "934-281904-12",
        titular: "Calzado ISABEL S.A.S.",
        nit: "901.482.391-4",
    };

    const totalArticulos = totalCartItems();
    const subtotal = totalCartPrice();
    const costoEnvio = 0; // Despacho directo de bodega gratuito o incluido
    const totalFinal = subtotal + costoEnvio;

    const formatCOP = (valor: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);
    };

    const calcularPrecioConDescuento = (precio: number, descuento: number) => {
        if (!descuento) return precio;
        return precio - (precio * descuento) / 100;
    };

    // Confirmación al pasar del paso 1 al paso 2
    const handleConfirmCart = async () => {
        if (cartItems.length === 0) {
            Toast.fire({
                icon: "warning",
                title: "Tu carrito está vacío",
                text: "Agrega calzado al carrito antes de tramitar el pedido.",
            });
            return;
        }

        const result = await MySwal.fire({
            title: "¿Confirmas los artículos seleccionados?",
            html: `
                <div class="space-y-2 text-left py-1 text-xs">
                    <p>Tienes <strong class="text-[#0E2347] font-bold">${totalArticulos} pares</strong> de calzado en tu orden.</p>
                    <p class="text-slate-500">Valor total a liquidar: <strong class="text-[#2B62D9] font-bold">${formatCOP(subtotal)} COP</strong></p>
                    <p class="text-[11px] text-slate-400">Verifica colores y tallas antes de continuar a la información de despacho.</p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, continuar con mis datos",
            cancelButtonText: "Modificar carrito",
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Manejar copia del número de cuenta al portapapeles
    const handleCopyAccount = () => {
        navigator.clipboard.writeText(bankDetails.numeroCuenta);
        setCopiedAccount(true);
        Toast.fire({
            icon: "success",
            title: "Número de cuenta copiado",
        });
        setTimeout(() => setCopiedAccount(false), 2500);
    };

    // Manejo del comprobante
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setReceiptError("El archivo supera el límite de 5 MB.");
            return;
        }

        setReceiptError(null);
        setPaymentReceipt(file);

        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setReceiptPreview(null);
        }
    };

    // Finalizar pedido con llamada a API simulada
    const handleFinalizeOrder = async () => {
        if (!paymentReceipt) {
            setReceiptError("Por favor adjunta la foto o PDF del comprobante de transferencia.");
            Toast.fire({
                icon: "warning",
                title: "Falta el comprobante",
                text: "Adjunta la constancia de pago para registrar el pedido.",
            });
            return;
        }

        setIsSubmitting(true);

        // Simulación de llamada a API de backend
        setTimeout(() => {
            setIsSubmitting(false);
            const generatedCode = `PED-${Math.floor(100000 + Math.random() * 900000)}`;
            setOrderCode(generatedCode);
            clearCart();
            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });

            Toast.fire({
                icon: "success",
                title: "¡Pedido creado exitosamente!",
            });
        }, 1800);
    };

    return (
        <div className="min-h-screen bg-app-surface text-app-text pt-5 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* ─── ENCABEZADO DE LA PÁGINA ─── */}
                <div data-aos="fade-down" className="text-center mb-8 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-royal/10 text-brand-royal dark:text-brand-sky border border-brand-royal/20 mb-3">
                        <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                        Proceso de Compra Directa
                    </span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-app-text tracking-tight">
                        Finalizar Pedido de Calzado
                    </h1>
                    <p className="text-xs sm:text-sm text-app-muted mt-2 max-w-lg mx-auto">
                        Completa los sencillos pasos para asegurar tus pares directamente con la bodega central de Calzado ISABEL.
                    </p>
                </div>

                {/* ─── STEPPER / BARRA DE PROGRESO ─── */}
                <div data-aos="fade-up" data-aos-delay="100" className="mb-10">
                    <div className="relative">
                        {/* Línea conectora */}
                        <div className="absolute top-5 left-8 right-8 h-0.5 bg-app-border z-0 hidden sm:block">
                            <div
                                className="h-full bg-brand-royal dark:bg-brand-sky transition-all duration-500 ease-out"
                                style={{
                                    width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Pasos */}
                        <div className="grid grid-cols-4 gap-2 relative z-10">
                            {STEPS.map((step) => {
                                const isPassed = currentStep > step.id;
                                const isCurrent = currentStep === step.id;

                                return (
                                    <div
                                        key={step.id}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        <div
                                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm ${isPassed
                                                ? "bg-emerald-600 text-white"
                                                : isCurrent
                                                    ? "bg-brand-royal text-white ring-4 ring-brand-royal/20 scale-105"
                                                    : "bg-app-surface-alt border border-app-border text-app-muted"
                                                }`}
                                        >
                                            {isPassed ? (
                                                <FontAwesomeIcon icon={faCheck} className="text-sm" />
                                            ) : (
                                                <FontAwesomeIcon icon={step.icon} className="text-sm" />
                                            )}
                                        </div>
                                        <div className="mt-2.5">
                                            <p
                                                className={`text-[11px] sm:text-xs font-bold leading-tight ${isCurrent
                                                    ? "text-brand-royal dark:text-brand-sky"
                                                    : isPassed
                                                        ? "text-app-text"
                                                        : "text-app-muted"
                                                    }`}
                                            >
                                                {step.title}
                                            </p>
                                            <p className="text-[10px] text-app-muted hidden md:block mt-0.5">
                                                {step.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─── CONTENIDO DEL PASO ─── */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="bg-app-surface-alt border border-app-border rounded-3xl p-5 sm:p-8 shadow-xl shadow-brand-navy/5"
                >
                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PASO 1: REVISAR CARRITO */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {currentStep === 1 && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-app-border mb-6">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-app-text">
                                        1. Verifica tu selección de calzado
                                    </h2>
                                    <p className="text-xs text-app-muted mt-0.5">
                                        Revisa las tallas, colores y cantidades antes de ingresar tus datos de despacho.
                                    </p>
                                </div>
                                <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky text-xs font-extrabold border border-brand-sky/30">
                                    {totalArticulos} {totalArticulos === 1 ? "par" : "pares"} listos
                                </span>
                            </div>

                            {cartItems.length > 0 ? (
                                <div className="space-y-3.5 mb-8">
                                    {cartItems.map((item) => {
                                        const precioFinal = calcularPrecioConDescuento(
                                            item.precioVenta,
                                            item.descuento
                                        );
                                        const totalFila = precioFinal * item.cantidad;

                                        return (
                                            <div
                                                key={item.idVariante}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-app-surface border border-app-border hover:border-brand-sky/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <img
                                                        src={item.imagen || "/shoesGreenSplash.jpg"}
                                                        alt={item.nombreProducto}
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-white border border-app-border shrink-0"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).src =
                                                                "/shoesGreenSplash.jpg";
                                                        }}
                                                    />
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-app-text truncate">
                                                            {item.nombreProducto}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-app-muted">
                                                            <span className="px-2 py-0.5 rounded-md bg-app-surface-alt border border-app-border">
                                                                Color: <strong className="text-app-text">{item.color}</strong>
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-md bg-app-surface-alt border border-app-border">
                                                                Talla: <strong className="text-app-text">{item.talla}</strong>
                                                            </span>
                                                            {item.descuento > 0 && (
                                                                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                                                                    -{item.descuento}% OFF
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-app-muted mt-1">
                                                            Precio unitario: {formatCOP(precioFinal)} COP
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-app-border">
                                                    {/* Selector de cantidad */}
                                                    <div className="inline-flex items-center rounded-xl bg-app-surface-alt border border-app-border p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => deductOne(item.idVariante)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-app-muted hover:text-app-text hover:bg-brand-sky/10 transition-colors cursor-pointer"
                                                            aria-label="Restar una unidad"
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} className="text-xs" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-app-text">
                                                            {item.cantidad}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => plusOne(item.idVariante)}
                                                            disabled={Boolean(
                                                                item.stockDisponible &&
                                                                item.cantidad >= item.stockDisponible
                                                            )}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-app-muted hover:text-app-text hover:bg-brand-sky/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                            aria-label="Sumar una unidad"
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                                        </button>
                                                    </div>

                                                    {/* Total por fila */}
                                                    <div className="text-right min-w-27.5">
                                                        <p className="text-sm font-extrabold text-brand-royal dark:text-brand-sky">
                                                            {formatCOP(totalFila)}
                                                        </p>
                                                        <span className="text-[10px] text-app-muted">COP</span>
                                                    </div>

                                                    {/* Botón eliminar */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.idVariante)}
                                                        className="text-app-muted hover:text-rose-500 p-2 transition-colors cursor-pointer"
                                                        title="Eliminar producto"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Resumen del paso 1 */}
                                    <div className="p-4 rounded-2xl bg-app-surface border border-app-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                        <div className="flex items-center gap-3 text-xs text-app-muted">
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-base" />
                                            <span>Precios garantizados con stock reservado de bodega ISABEL</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-app-muted">Subtotal orden: </span>
                                            <span className="text-lg font-black text-brand-royal dark:text-brand-sky">
                                                {formatCOP(subtotal)} COP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-2xl mx-auto mb-4">
                                        <FontAwesomeIcon icon={faCartShopping} />
                                    </div>
                                    <h3 className="text-base font-bold text-app-text mb-1">
                                        No tienes productos en tu carrito
                                    </h3>
                                    <p className="text-xs text-app-muted max-w-sm mx-auto mb-6">
                                        Explora nuestro catálogo mayorista y añade calzado antes de crear un pedido.
                                    </p>
                                    <Link to="/catalog">
                                        <Button variant="primary" icon={faArrowRight}>
                                            Explorar Catálogo
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Acciones paso 1 */}
                            {cartItems.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-app-border">
                                    <Link to="/catalog">
                                        <Button variant="ghost" icon={faArrowLeft}>
                                            Seguir Comprando
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        rightIcon={faArrowRight}
                                        onClick={handleConfirmCart}
                                    >
                                        Confirmar y Continuar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PASO 2: DATOS DEL USUARIO LOGUEADO */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {currentStep === 2 && (
                        <div>
                            <div className="pb-5 border-b border-app-border mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-app-text">
                                    2. Información de Facturación y Entrega
                                </h2>
                                <p className="text-xs text-app-muted mt-0.5">
                                    Verifica que tus datos de cliente registrado sean correctos para coordinar el despacho.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Tarjeta Comprador */}
                                <div className="p-5 rounded-2xl bg-app-surface border border-app-border space-y-4">
                                    <div className="flex items-center gap-3 pb-3 border-b border-app-border">
                                        <div className="w-10 h-10 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center">
                                            <FontAwesomeIcon icon={faIdCard} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-app-text">Datos del Cliente</h3>
                                            <p className="text-[11px] text-app-muted">{clienteData.tipoCliente}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-xs">
                                        <div>
                                            <span className="text-app-muted block text-[11px]">Nombre o Razón Social:</span>
                                            <span className="font-bold text-app-text">{clienteData.nombreCompleto}</span>
                                        </div>
                                        <div>
                                            <span className="text-app-muted block text-[11px]">Documento de Identidad:</span>
                                            <span className="font-semibold text-app-text">{clienteData.documento}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-app-text pt-1">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-brand-royal dark:text-brand-sky text-xs" />
                                            <span>{clienteData.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-app-text">
                                            <FontAwesomeIcon icon={faPhone} className="text-emerald-500 text-xs" />
                                            <span>{clienteData.telefono}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tarjeta Dirección y Envíos */}
                                <div className="p-5 rounded-2xl bg-app-surface border border-app-border space-y-4">
                                    <div className="flex items-center gap-3 pb-3 border-b border-app-border">
                                        <div className="w-10 h-10 rounded-xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center">
                                            <FontAwesomeIcon icon={faTruckFast} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-app-text">Destino de Entrega</h3>
                                            <p className="text-[11px] text-app-muted">Despacho desde bodega central</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 text-xs">
                                        <div>
                                            <span className="text-app-muted block text-[11px]">Dirección de Despacho:</span>
                                            <span className="font-bold text-app-text flex items-start gap-1.5 mt-0.5">
                                                <FontAwesomeIcon icon={faLocationDot} className="text-rose-500 mt-0.5" />
                                                {clienteData.direccion}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-app-muted block text-[11px]">Ciudad y Departamento:</span>
                                            <span className="font-semibold text-app-text flex items-center gap-1.5 mt-0.5">
                                                <FontAwesomeIcon icon={faCity} className="text-brand-royal dark:text-brand-sky text-xs" />
                                                {clienteData.ciudad}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-brand-royal/5 dark:bg-brand-sky/10 border border-brand-royal/10 text-[11px] text-brand-royal dark:text-brand-sky flex items-center gap-2">
                                            <FontAwesomeIcon icon={faCircleInfo} />
                                            <span>El despacho se programa una vez validada la consignación.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen flotante */}
                            <div className="p-4 rounded-2xl bg-brand-sky/10 border border-brand-sky/20 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                                <div className="text-xs">
                                    <span className="font-bold text-app-text">Total orden actual:</span>{" "}
                                    <span className="text-app-muted">({totalArticulos} pares seleccionados)</span>
                                </div>
                                <span className="text-base font-extrabold text-brand-royal dark:text-brand-sky">
                                    {formatCOP(totalFinal)} COP
                                </span>
                            </div>

                            {/* Acciones paso 2 */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-app-border">
                                <Button
                                    variant="outline"
                                    icon={faArrowLeft}
                                    onClick={() => {
                                        setCurrentStep(1);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                >
                                    Volver al Carrito
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    rightIcon={faArrowRight}
                                    onClick={() => {
                                        setCurrentStep(3);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                >
                                    Continuar al Pago
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PASO 3: MÉTODO DE PAGO (TRANSFERENCIA BANCARIA QR) */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {currentStep === 3 && (
                        <div>
                            <div className="pb-5 border-b border-app-border mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-app-text">
                                    3. Realizar Pago por Transferencia
                                </h2>
                                <p className="text-xs text-app-muted mt-0.5">
                                    Escanea el código QR o copia los datos de cuenta y adjunta la foto del comprobante.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                                {/* Columna Izquierda: QR y Datos bancarios */}
                                <div className="lg:col-span-7 space-y-4">
                                    <div className="p-5 rounded-2xl bg-app-surface border border-app-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                                                    <FontAwesomeIcon icon={faBuildingColumns} />
                                                </div>
                                                <span className="text-sm font-bold text-app-text">
                                                    Transferencia {bankDetails.banco}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                Cero comisión
                                            </span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-app-surface-alt border border-app-border">
                                            {/* QR visual */}
                                            <div className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-md shrink-0 flex flex-col items-center">
                                                {/* Código QR estilizado con logo central */}
                                                <img
                                                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=Bancolombia-Ahorros-93428190412-CalzadoIsabel"
                                                    alt="Código QR Bancolombia Calzado Isabel"
                                                    className="w-36 h-36 object-contain"
                                                />
                                                <span className="text-[10px] font-extrabold text-slate-700 mt-1.5 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faQrcode} className="text-brand-royal" />
                                                    QR Bancolombia
                                                </span>
                                            </div>

                                            {/* Datos de cuenta */}
                                            <div className="flex-1 w-full space-y-2.5 text-xs">
                                                <div>
                                                    <span className="text-app-muted block text-[11px]">Titular:</span>
                                                    <span className="font-bold text-app-text">{bankDetails.titular}</span>
                                                </div>
                                                <div>
                                                    <span className="text-app-muted block text-[11px]">NIT:</span>
                                                    <span className="font-semibold text-app-text">{bankDetails.nit}</span>
                                                </div>
                                                <div>
                                                    <span className="text-app-muted block text-[11px]">Tipo de cuenta:</span>
                                                    <span className="font-semibold text-app-text">{bankDetails.tipoCuenta}</span>
                                                </div>
                                                <div className="pt-1">
                                                    <span className="text-app-muted block text-[11px]">Número de cuenta:</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <code className="text-sm font-black text-brand-royal dark:text-brand-sky bg-brand-royal/10 dark:bg-brand-sky/15 px-2.5 py-1 rounded-lg">
                                                            {bankDetails.numeroCuenta}
                                                        </code>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyAccount}
                                                            className="p-1.5 rounded-lg border border-app-border hover:bg-brand-sky/15 text-app-muted hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer text-xs"
                                                            title="Copiar número"
                                                        >
                                                            <FontAwesomeIcon icon={copiedAccount ? faCheck : faCopy} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                                            <strong>Importante:</strong> Al transferir, escribe tu nombre o número de cédula en el mensaje de la transacción para acelerar la validación.
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Adjuntar comprobante y valor */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Tarjeta Valor a Transferir */}
                                    <div className="p-4 rounded-2xl bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 text-center">
                                        <span className="text-xs text-app-muted font-medium">Total exacto a pagar:</span>
                                        <div className="text-2xl sm:text-3xl font-black text-brand-royal dark:text-brand-sky mt-0.5">
                                            {formatCOP(totalFinal)} COP
                                        </div>
                                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                                            Despacho de bodega incluido
                                        </span>
                                    </div>

                                    {/* Subir comprobante */}
                                    <div className="p-5 rounded-2xl bg-app-surface border border-app-border">
                                        <label className="block text-xs font-bold text-app-text mb-2">
                                            Adjuntar Comprobante de Pago *
                                        </label>

                                        <div className="relative border-2 border-dashed border-app-border hover:border-brand-royal dark:hover:border-brand-sky rounded-2xl p-4 text-center transition-colors bg-app-surface-alt">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />

                                            {receiptPreview ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={receiptPreview}
                                                        alt="Vista previa del comprobante"
                                                        className="max-h-36 mx-auto rounded-lg object-contain border border-app-border shadow-xs"
                                                    />
                                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                                                        <FontAwesomeIcon icon={faCheck} />
                                                        Comprobante cargado ({paymentReceipt?.name})
                                                    </p>
                                                    <span className="text-[10px] text-app-muted block">
                                                        Haz clic para cambiar el archivo
                                                    </span>
                                                </div>
                                            ) : paymentReceipt ? (
                                                <div className="py-4 space-y-1">
                                                    <FontAwesomeIcon icon={faReceipt} className="text-2xl text-brand-royal dark:text-brand-sky" />
                                                    <p className="text-xs font-bold text-app-text">{paymentReceipt.name}</p>
                                                    <span className="text-[10px] text-emerald-600 font-bold">
                                                        Documento PDF adjunto
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="py-4 space-y-2">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center mx-auto text-base">
                                                        <FontAwesomeIcon icon={faCloudArrowUp} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-brand-royal dark:text-brand-sky">
                                                            Sube tu comprobante
                                                        </span>
                                                        <p className="text-[11px] text-app-muted mt-0.5">
                                                            Captura de pantalla JPG, PNG o PDF (Máx. 5 MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {receiptError && (
                                            <p className="text-xs text-rose-500 font-medium mt-2">
                                                {receiptError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Acciones paso 3 */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-app-border">
                                <Button
                                    variant="outline"
                                    icon={faArrowLeft}
                                    onClick={() => {
                                        setCurrentStep(2);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Regresar a Mis Datos
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    rightIcon={faCheck}
                                    onClick={handleFinalizeOrder}
                                    isLoading={isSubmitting}
                                    loadingText="Procesando pedido y comprobante..."
                                >
                                    Finalizar y Registrar Pedido
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* PASO 4: CONFIRMACIÓN EXITOSA */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {currentStep === 4 && (
                        <div className="py-6 sm:py-10 text-center max-w-xl mx-auto">
                            {/* Icono de éxito */}
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner ring-8 ring-emerald-500/10">
                                <FontAwesomeIcon icon={faCircleCheck} />
                            </div>

                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
                                ¡Pedido Confirmado con Éxito!
                            </span>

                            <h2 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight mb-3">
                                Gracias por tu compra
                            </h2>

                            <p className="text-sm text-app-muted leading-relaxed mb-6">
                                Hemos recibido tu orden y tu comprobante de pago. Actualmente se encuentra en estado{" "}
                                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                                    En Revisión de Pago
                                </strong>
                                . Te notificaremos a tu correo electrónico una vez validada la transacción para programar el despacho de tu calzado.
                            </p>

                            {/* Tarjeta con código de seguimiento */}
                            <div className="p-5 rounded-2xl bg-app-surface border border-app-border mb-8 text-left space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b border-app-border">
                                    <span className="text-xs text-app-muted">Número de Pedido:</span>
                                    <span className="text-sm font-black text-brand-royal dark:text-brand-sky">
                                        {orderCode || "PED-849201"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pb-3 border-b border-app-border">
                                    <span className="text-xs text-app-muted">Correo de notificación:</span>
                                    <span className="text-xs font-semibold text-app-text">{clienteData.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-app-muted">Método:</span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        Transferencia Bancolombia QR (Comprobante adjunto)
                                    </span>
                                </div>
                            </div>

                            {/* Botones de acción final */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link to="/catalog">
                                    <Button variant="primary" size="lg" icon={faStore}>
                                        Volver al Catálogo
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate({ to: "/" })}
                                >
                                    Ir al Inicio
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
