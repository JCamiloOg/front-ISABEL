import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotateLeft,
    faClock,
    faStore,
    faClipboardCheck,
    faArrowsRotate,
    faCircleCheck,
    faComments,
    faBoxOpen,
    faMoneyBillWave,
    faRepeat,
} from "@fortawesome/free-solid-svg-icons";

const ACCEPTED_REASONS = [
    {
        title: "Talla equivocada",
        description: "Cuando la talla recibida no corresponde a la solicitada en tu pedido.",
    },
    {
        title: "Color equivocado",
        description: "Cuando el color del producto entregado es distinto al elegido al comprar.",
    },
    {
        title: "Producto dañado",
        description: "Si el calzado presenta daños físicos evidentes ocasionados antes o durante la entrega.",
    },
    {
        title: "Producto defectuoso",
        description: "Fallas de fabricación en costuras, suela, acabados o materiales.",
    },
    {
        title: "Producto no corresponde",
        description: "Cuando recibes una referencia diferente a la registrada en tu factura o pedido.",
    },
];

const RESOLUTION_TYPES = [
    {
        title: "Cambiar por el mismo producto",
        description:
            "Reemplazamos el artículo por la misma referencia en la talla, color o estado correcto, sujeto a disponibilidad.",
        icon: faRepeat,
    },
    {
        title: "Cambiar por otra referencia",
        description:
            "Puedes elegir otra referencia disponible en nuestro catálogo, asumiendo o ajustando la diferencia de valor si aplica.",
        icon: faArrowsRotate,
    },
    {
        title: "Devolver dinero",
        description:
            "Reembolso del valor correspondiente al producto devuelto una vez validado su estado en bodega.",
        icon: faMoneyBillWave,
    },
];

export default function WarrantyPolicy() {
    return (
        <div className="min-h-screen bg-app-bg py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Hero */}
                <div
                    data-aos="fade-up"
                    className="relative overflow-hidden rounded-3xl border border-app-border bg-app-surface p-6 sm:p-10 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                            <FontAwesomeIcon icon={faRotateLeft} className="text-2xl" />
                        </div>
                        <div className="space-y-1.5">
                            <span className="inline-block rounded-full bg-brand-royal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                                Política de Devoluciones y Garantías
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-app-text tracking-tight">
                                ¿Cómo funcionan nuestras devoluciones?
                            </h1>
                            <p className="text-sm text-app-muted max-w-2xl">
                                Queremos que tu experiencia de compra sea totalmente segura. Aquí encuentras las condiciones, plazos, motivos válidos y soluciones disponibles para gestionar cualquier devolución.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Canales y Plazo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <FontAwesomeIcon icon={faComments} className="text-lg" />
                            </div>
                            <h2 className="text-base font-bold text-app-text">Canales Únicos de Atención</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                            Las solicitudes de devolución se reciben <strong className="text-app-text">únicamente</strong> a través de nuestra línea oficial de <strong className="text-app-text">WhatsApp</strong> o acercándote directamente a nuestra <strong className="text-app-text">bodega física</strong>.
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-app-text">
                            <FontAwesomeIcon icon={faStore} className="text-brand-royal dark:text-brand-sky" />
                            <span>Atención presencial en bodega física o vía WhatsApp</span>
                        </div>
                    </div>

                    <div
                        data-aos="fade-up"
                        data-aos-delay="200"
                        className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                <FontAwesomeIcon icon={faClock} className="text-lg" />
                            </div>
                            <h2 className="text-base font-bold text-app-text">Plazo Máximo de Reclamación</h2>
                        </div>
                        <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                            Cuentas con un plazo máximo de <strong className="text-app-text">7 días calendario</strong> contados a partir de la fecha en que recibiste tu venta o pedido para reportar la novedad.
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                            <FontAwesomeIcon icon={faBoxOpen} />
                            <span>El producto debe conservarse sin uso indebido y con su empaque</span>
                        </div>
                    </div>
                </div>

                {/* Razones aceptadas */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="150"
                    className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-2xs space-y-5"
                >
                    <div className="flex items-center gap-3 border-b border-app-border/70 pb-4">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                            <FontAwesomeIcon icon={faClipboardCheck} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-app-text">Razones Aceptadas para Devolución</h2>
                            <p className="text-xs text-app-muted">
                                Solo se tramitan devoluciones que correspondan a alguno de los siguientes motivos
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ACCEPTED_REASONS.map((reason) => (
                            <div
                                key={reason.title}
                                className="rounded-xl border border-app-border/80 bg-app-surface-alt/40 p-4 space-y-1.5"
                            >
                                <div className="flex items-center gap-2 text-sm font-bold text-app-text">
                                    <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        className="text-emerald-500 text-xs shrink-0"
                                    />
                                    <span>{reason.title}</span>
                                </div>
                                <p className="text-xs text-app-muted leading-relaxed">{reason.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tipos de resolución */}
                <div
                    data-aos="fade-up"
                    data-aos-delay="200"
                    className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-2xs space-y-5"
                >
                    <div className="flex items-center gap-3 border-b border-app-border/70 pb-4">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-app-text">Tipos de Resolución Disponibles</h2>
                            <p className="text-xs text-app-muted">
                                Durante tu solicitud, puedes optar por una de estas soluciones
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {RESOLUTION_TYPES.map((res) => (
                            <div
                                key={res.title}
                                className="rounded-xl border border-app-border bg-app-surface-alt/30 p-5 space-y-2.5"
                            >
                                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                                    <FontAwesomeIcon icon={res.icon} />
                                </div>
                                <h3 className="text-sm font-bold text-app-text">{res.title}</h3>
                                <p className="text-xs text-app-muted leading-relaxed">{res.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
