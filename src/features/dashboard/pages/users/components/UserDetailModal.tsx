import React from "react";
import type { Usuario } from "../../../../../@types/Users";
import Modal from "../../../../../shared/components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faPhone,
  faEnvelope,
  faLocationDot,
  faUserShield,
  faCalendarCheck,
  faCheckCircle,
  faBan,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!user) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const footerButton = (
    <div className="flex justify-end w-full">
      <button
        type="button"
        onClick={onClose}
        className="btn-primary py-2 px-5 cursor-pointer"
      >
        Cerrar
      </button>
    </div>
  );

  const isRoleAdmin = user.id_rol === 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha y Perfil de Usuario"
      description="Credenciales, rol asignado y datos de contacto en Calzado ISABEL."
      icon={faAddressCard}
      size="lg"
      footer={footerButton}
    >
      <div className="space-y-6 py-2">
        {/* Resumen Superior */}
        <div className="flex items-start justify-between bg-app-surface-alt p-4 rounded-2xl border border-app-border">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                isRoleAdmin
                  ? "bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky"
                  : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-app-text">
                {user.nombre} {user.apellido}
              </h4>
              <p className="text-xs text-app-muted font-medium mt-0.5">
                {user.tipo_documento?.codigo || "CC"}: {user.documento_identidad}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border ${
                isRoleAdmin
                  ? "bg-brand-royal/10 text-brand-royal dark:text-brand-sky border-brand-royal/20"
                  : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
              }`}
            >
              {user.rol?.nombre || (isRoleAdmin ? "Administrador" : "Bodeguero")}
            </span>

            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
                user.estado
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              <FontAwesomeIcon icon={user.estado ? faCheckCircle : faBan} className="text-[10px]" />
              {user.estado ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Detalles de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 text-app-text p-3 rounded-xl bg-app-surface border border-app-border">
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-brand-royal dark:text-brand-sky shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-app-muted block">Correo Electrónico:</span>
              <span className="font-semibold truncate block">{user.correo}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-app-text p-3 rounded-xl bg-app-surface border border-app-border">
            <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-app-muted block">Teléfono:</span>
              <span className="font-semibold">{user.telefono}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-app-text p-3 rounded-xl bg-app-surface border border-app-border md:col-span-2">
            <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-app-muted block">Dirección de Residencia:</span>
              <span className="font-semibold">{user.direccion}</span>
            </div>
          </div>
        </div>

        {/* Métricas y Permisos */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-app-muted">
            Seguridad y Perfil Operativo
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-app-surface-alt border border-app-border p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div>
                <span className="text-[11px] text-app-muted block">Fecha de Registro</span>
                <span className="text-xs font-bold text-app-text">
                  {formatDate(user.fecha_creacion)}
                </span>
              </div>
            </div>

            <div className="bg-app-surface-alt border border-app-border p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <div>
                <span className="text-[11px] text-app-muted block">Nivel de Acceso</span>
                <span className="text-xs font-bold text-app-text">
                  {isRoleAdmin ? "Total (Dashboard + Finanzas)" : "Operativo (Bodega + Pedidos)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
