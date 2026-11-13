import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandHoldingDollar,
  faEye,
  faPaperclip,
  faBuildingColumns,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

import { Table, type TableColumn } from "../../../../../shared/components/Table";
import { Button } from "../../../../../shared/components/Button";
import type { Abono, Venta } from "../types";
import { formatCOP, formatDate } from "../utils";

interface TablaAbonosProps {
  ventas: Venta[];
  onRegistrarAbono: (venta: Venta) => void;
  onVerDetalle: (venta: Venta) => void;
}

export function TablaAbonos({
  ventas,
  onRegistrarAbono,
  onVerDetalle,
}: TablaAbonosProps) {
  const [tabCartera, setTabCartera] = useState<"pendientes" | "historial">("pendientes");
  const [pagina, setPagina] = useState(1);

  // Ventas a crédito que tienen saldo pendiente
  const creditosPendientes = useMemo(() => {
    return ventas.filter((v) => v.tipoVenta === "Crédito" && v.saldoPendiente > 0);
  }, [ventas]);

  // Historial plano de todos los abonos registrados en todas las ventas
  const todosLosAbonos = useMemo(() => {
    const listado: Abono[] = [];
    ventas.forEach((v) => {
      v.abonos.forEach((a) => {
        listado.push(a);
      });
    });
    return listado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [ventas]);

  // Columnas para Créditos Pendientes
  const columnsCreditos: TableColumn<Venta>[] = [
    {
      key: "codigoVenta",
      header: "Código / Fecha",
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
            {v.codigoVenta}
          </span>
          <span className="text-[11px] text-app-muted">{formatDate(v.fecha)}</span>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente / Documento",
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-app-text">{v.cliente.nombre}</span>
          <span className="text-[11px] text-app-muted">{v.cliente.documento}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total Venta",
      align: "right",
      render: (v) => (
        <span className="text-xs font-semibold text-app-text">{formatCOP(v.total)}</span>
      ),
    },
    {
      key: "abonos",
      header: "Abonado",
      align: "right",
      render: (v) => {
        const abonado = v.total - v.saldoPendiente;
        return (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatCOP(abonado)}
          </span>
        );
      },
    },
    {
      key: "saldoPendiente",
      header: "Saldo Pendiente",
      align: "right",
      render: (v) => (
        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
          {formatCOP(v.saldoPendiente)}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acción",
      align: "center",
      render: (v) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={faHandHoldingDollar}
            onClick={() => onRegistrarAbono(v)}
          >
            Abonar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={faEye}
            onClick={() => onVerDetalle(v)}
            title="Ver Detalle"
          />
        </div>
      ),
    },
  ];

  // Columnas para Historial de Abonos
  const columnsHistorial: TableColumn<Abono>[] = [
    {
      key: "fecha",
      header: "Fecha / Venta",
      render: (a) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-app-text">{formatDate(a.fecha)}</span>
          <span className="font-mono text-[11px] text-brand-royal dark:text-brand-sky font-semibold">
            {a.codigoVenta}
          </span>
        </div>
      ),
    },
    {
      key: "cajaNombre",
      header: "Caja Destino",
      render: (a) => (
        <div className="flex items-center gap-1.5 text-xs text-app-text font-medium">
          <FontAwesomeIcon icon={faBuildingColumns} className="text-app-muted text-xs" />
          <span>{a.cajaNombre}</span>
        </div>
      ),
    },
    {
      key: "metodoPago",
      header: "Método",
      render: (a) => (
        <span className="inline-flex items-center gap-1 rounded-md border border-brand-sky/20 bg-app-bg px-2 py-0.5 text-[11px] font-bold text-app-text">
          <FontAwesomeIcon icon={a.metodoPago === "Efectivo" ? faMoneyBillWave : faBuildingColumns} />
          {a.metodoPago}
        </span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      align: "right",
      render: (a) => (
        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCOP(a.monto)}
        </span>
      ),
    },
    {
      key: "observaciones",
      header: "Observaciones",
      render: (a) => (
        <span className="text-xs text-app-muted max-w-xs truncate block" title={a.observaciones}>
          {a.observaciones || "—"}
        </span>
      ),
    },
    {
      key: "comprobante",
      header: "Comprobante",
      render: (a) =>
        a.comprobanteNombre ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-royal dark:text-brand-sky">
            <FontAwesomeIcon icon={faPaperclip} />
            {a.comprobanteNombre}
          </span>
        ) : (
          <span className="text-app-muted text-xs">—</span>
        ),
    },
  ];

  // Paginación para créditos pendientes
  const filasPorPaginaPendientes = 5;
  const totalPaginasPendientes = Math.max(
    1,
    Math.ceil(creditosPendientes.length / filasPorPaginaPendientes),
  );
  const paginaActualPendientes = Math.min(pagina, totalPaginasPendientes);
  const creditosPaginados = useMemo(() => {
    const start = (paginaActualPendientes - 1) * filasPorPaginaPendientes;
    return creditosPendientes.slice(start, start + filasPorPaginaPendientes);
  }, [creditosPendientes, paginaActualPendientes]);

  // Paginación para historial de abonos
  const filasPorPaginaHistorial = 8;
  const totalPaginasHistorial = Math.max(
    1,
    Math.ceil(todosLosAbonos.length / filasPorPaginaHistorial),
  );
  const paginaActualHistorial = Math.min(pagina, totalPaginasHistorial);
  const abonosPaginados = useMemo(() => {
    const start = (paginaActualHistorial - 1) * filasPorPaginaHistorial;
    return todosLosAbonos.slice(start, start + filasPorPaginaHistorial);
  }, [todosLosAbonos, paginaActualHistorial]);

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de sub-pestaña */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-sky/20 bg-app-surface p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTabCartera("pendientes");
              setPagina(1);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tabCartera === "pendientes"
                ? "bg-brand-royal text-white shadow-sm dark:bg-brand-sky dark:text-brand-navy"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            Ventas con Saldo Pendiente ({creditosPendientes.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTabCartera("historial");
              setPagina(1);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tabCartera === "historial"
                ? "bg-brand-royal text-white shadow-sm dark:bg-brand-sky dark:text-brand-navy"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            Historial de Todos los Abonos ({todosLosAbonos.length})
          </button>
        </div>

        <span className="text-xs text-app-muted">
          {tabCartera === "pendientes"
            ? "Ventas activas que permiten registrar nuevos abonos."
            : "Registro histórico de todos los abonos y cuotas iniciales."}
        </span>
      </div>

      {tabCartera === "pendientes" ? (
        <Table<Venta>
          columns={columnsCreditos}
          data={creditosPaginados}
          rowKey="idVenta"
          emptyTitle="Sin créditos pendientes"
          emptyDescription="Todas las ventas a crédito han sido canceladas o no existen ventas a crédito activas."
          pagination={{
            currentPage: paginaActualPendientes,
            totalPages: totalPaginasPendientes,
            totalItems: creditosPendientes.length,
            itemsPerPage: filasPorPaginaPendientes,
            onPageChange: (p) => setPagina(p),
          }}
        />
      ) : (
        <Table<Abono>
          columns={columnsHistorial}
          data={abonosPaginados}
          rowKey="idAbono"
          emptyTitle="No hay abonos registrados"
          emptyDescription="Aún no se han registrado abonos o cuotas iniciales en el sistema."
          pagination={{
            currentPage: paginaActualHistorial,
            totalPages: totalPaginasHistorial,
            totalItems: todosLosAbonos.length,
            itemsPerPage: filasPorPaginaHistorial,
            onPageChange: (p) => setPagina(p),
          }}
        />
      )}
    </div>
  );
}

export default TablaAbonos;
