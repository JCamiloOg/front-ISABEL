import Swal from "sweetalert2";

/**
 * Alerta modal general estilizada con la identidad oficial de Calzado ISABEL:
 * - Fondo de backdrop en Azul Marino (#0E2347) con desenfoque de cristal.
 * - Tarjeta en blanco esmerilado / navy dinámico con bordes en Azul Celeste (#52A5E8/30) y sombras profundas.
 * - Botón de confirmación en Azul Real (#2B62D9) con hover a Marino (#0E2347).
 * - Botón de cancelación limpio con borde sutil.
 * - Tipografía institucional Nunito / font-sans.
 */
export const MySwal = Swal.mixin({
    background: "rgba(255, 255, 255, 0.98)",
    color: "#0E2347",
    customClass: {
        container: "!bg-[#0E2347]/45 !backdrop-blur-sm",
        popup: "!rounded-3xl !border-2 !border-[#52A5E8]/30 !bg-white/95 dark:!bg-[#0E2347]/95 !shadow-[0_20px_50px_-10px_rgba(14,35,71,0.35)] !backdrop-blur-xl !px-8 !py-7 !font-sans",
        title: "!text-[#0E2347] dark:!text-white !font-sans !font-extrabold !text-2xl !tracking-tight !mb-2.5",
        htmlContainer: "!text-[#64748B] dark:!text-[#94A3B8] !font-sans !text-sm !leading-relaxed !mb-6",
        confirmButton: "!rounded-xl !px-6 !py-2.5 !bg-[#2B62D9] hover:!bg-[#0E2347] active:!scale-95 !text-white !font-bold !text-sm !transition-all hover:!shadow-md !cursor-pointer !border !border-[#2B62D9]",
        cancelButton: "!rounded-xl !px-6 !py-2.5 !bg-transparent hover:!bg-[#52A5E8]/15 active:!scale-95 !text-[#0E2347] dark:!text-white !font-semibold !text-sm !transition-all !cursor-pointer !border-2 !border-[#0E2347]/15 dark:!border-white/20",
        denyButton: "!rounded-xl !px-6 !py-2.5 !bg-rose-50 hover:!bg-rose-100 dark:!bg-rose-950/40 dark:hover:!bg-rose-950/60 active:!scale-95 !text-rose-600 dark:!text-rose-300 !font-bold !text-sm !transition-all !cursor-pointer !border !border-rose-300 dark:!border-rose-800",
        actions: "!gap-3 !pt-2",
        icon: "!border-[#52A5E8] !text-[#2B62D9] dark:!border-[#52A5E8] dark:!text-[#52A5E8]",
    },
    buttonsStyling: false,
    showClass: {
        popup: "swal2-show",
    },
    hideClass: {
        popup: "swal2-hide",
    },
});

/**
 * Toast flotante para notificaciones rápidas (e.g. zapato añadido al pedido, cambios guardados, sesión iniciada):
 * - Ubicación en esquina superior derecha.
 * - Borde y halo en Azul Celeste (#52A5E8).
 * - Barra de progreso en Azul Real (#2B62D9).
 */
export const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "rgba(255, 255, 255, 0.98)",
    color: "#0E2347",
    customClass: {
        popup: "!rounded-2xl !border !border-[#52A5E8]/35 !bg-white/95 dark:!bg-[#0E2347]/95 !shadow-[0_12px_32px_-6px_rgba(14,35,71,0.22)] !backdrop-blur-md !px-4 !py-3 !font-sans",
        title: "!text-[#0E2347] dark:!text-white !font-sans !font-bold !text-sm",
        htmlContainer: "!text-[#64748B] dark:!text-[#94A3B8] !font-sans !text-xs",
        timerProgressBar: "!bg-[#2B62D9] dark:!bg-[#52A5E8]",
        icon: "!border-none !scale-90 !m-0 !mr-2",
    },
    showClass: {
        popup: "swal2-show",
    },
    hideClass: {
        popup: "swal2-hide",
    },
});

export default MySwal;

