import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faBan,
  faSliders,
  faFloppyDisk,
  faXmark,
  faClock,
  faTruck,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../../shared/components/Modal";
import { Button } from "../../../../../shared/components/Button";
import type { OrdersPayload } from "../services/ordersServices";

export type OrderStatus = "Pendiente" | "En Preparación" | "Enviado" | "Entregado" | "Cancelado";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrdersPayload | null;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void> | void;
  isLoading?: boolean;
}

export function OrderStatusModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  isLoading = false,
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Pendiente");

  useEffect(() => {
    if (order?.status) {
      const s = order.status.trim().toLowerCase();
      if (s.includes("entregad") || s.includes("completad")) {
        // eslint-disable-next-line
        setSelectedStatus("Entregado");
      } else if (s.includes("enviad")) {
        setSelectedStatus("Enviado");
      } else if (s.includes("preparaci")) {
        setSelectedStatus("En Preparación");
      } else if (s.includes("cancelad") || s.includes("anulad")) {
        setSelectedStatus("Cancelado");
      } else {
        setSelectedStatus("Pendiente");
      }
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onUpdateStatus(order.id, selectedStatus);
  };

  const statusOptions: {
    value: OrderStatus;
    label: string;
    description: string;
    icon: typeof faCircleCheck;
    colorCls: string;
    borderCls: string;
  }[] = [
      {
        value: "Pendiente",
        label: "Pendiente",
        description: "El pedido fue registrado por el cliente y está por procesar.",
        icon: faClock,
        colorCls: "text-amber-500",
        borderCls: "border-amber-500 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/30",
      },
      {
        value: "En Preparación",
        label: "En Preparación",
        description: "El calzado está siendo alistado y empacado en bodega.",
        icon: faBoxOpen,
        colorCls: "text-sky-500",
        borderCls: "border-sky-500 bg-sky-500/10 shadow-2xs ring-1 ring-sky-500/30",
      },
      {
        value: "Enviado",
        label: "Enviado",
        description: "El paquete fue entregado al transporte y va en camino.",
        icon: faTruck,
        colorCls: "text-indigo-500",
        borderCls: "border-indigo-500 bg-indigo-500/10 shadow-2xs ring-1 ring-indigo-500/30",
      },
      {
        value: "Entregado",
        label: "Entregado",
        description: "Entrega completada satisfactoriamente al cliente.",
        icon: faCircleCheck,
        colorCls: "text-emerald-500",
        borderCls: "border-emerald-500 bg-emerald-500/10 shadow-2xs ring-1 ring-emerald-500/30",
      },
      {
        value: "Cancelado",
        label: "Cancelado",
        description: "Pedido anulado o desestimado.",
        icon: faBan,
        colorCls: "text-rose-500",
        borderCls: "border-rose-500 bg-rose-500/10 shadow-2xs ring-1 ring-rose-500/30",
      },
    ];

  const customerName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
    : "Cliente General";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Estado de Pedido"
      description={`Actualiza la etapa logística del pedido #${order.id.slice(0, 8)}`}
      icon={faSliders}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between sm:justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} type="button">
            <FontAwesomeIcon icon={faXmark} className="text-xs mr-1.5" />
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Guardando..."
            disabled={isLoading || selectedStatus === order.status}
            type="button"
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="text-xs mr-1.5" />
            Guardar Estado
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Resumen del pedido */}
        <div className="p-3.5 rounded-2xl bg-app-surface-alt/70 border border-app-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Cliente:</span>
            <strong className="text-app-text font-bold truncate max-w-50" title={customerName}>
              {customerName}
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">Documento:</span>
            <span className="font-mono text-app-text">
              {order.customer?.identityDocument || "No registrado"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-app-border/60">
            <span className="text-app-muted">Estado Actual:</span>
            <span className="font-semibold text-app-text capitalize">{order.status}</span>
          </div>
        </div>

        {/* Tarjetas de Selección Tipo Radio */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider block">
            Selecciona el nuevo estado *
          </label>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                    ? opt.borderCls
                    : "border-app-border bg-app-surface hover:border-brand-royal/40 hover:bg-app-surface-alt/60"
                    }`}
                >
                  <input
                    type="radio"
                    name="orderResolutionStatus"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => setSelectedStatus(opt.value)}
                    className="mt-0.5 size-4 text-brand-royal focus:ring-brand-royal"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-app-text">
                      <FontAwesomeIcon icon={opt.icon} className={`${opt.colorCls} text-xs`} />
                      <span>{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-app-muted leading-tight">
                      {opt.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default OrderStatusModal;
