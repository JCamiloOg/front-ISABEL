import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCircleXmark, faClock } from "@fortawesome/free-solid-svg-icons";
import type { EstadoDevolucion } from "../types";

const ESTILOS: Record<EstadoDevolucion, { clase: string; icono: typeof faClock }> = {
  Pendiente: {
    clase: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icono: faClock,
  },
  Aprobada: {
    clase: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icono: faCheckCircle,
  },
  Rechazada: {
    clase: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    icono: faCircleXmark,
  },
};

export function EstadoBadge({ estado }: { estado: EstadoDevolucion }) {
  const { clase, icono } = ESTILOS[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${clase}`}
    >
      <FontAwesomeIcon icon={icono} className="text-[10px]" />
      {estado}
    </span>
  );
}

export default EstadoBadge;
