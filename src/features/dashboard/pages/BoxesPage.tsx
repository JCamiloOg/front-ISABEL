import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faBuildingColumns,
  faMoneyBillWave,
  faPlus,
  faToggleOn,
  faToggleOff,
  faWallet,
  faVault,
  faMagnifyingGlass,
  faCheckCircle,
  faPiggyBank,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

import type { Caja, TipoCaja } from "../../../@types/Boxes";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Select } from "../../../shared/components/Inputs/Select";
import Modal from "../../../shared/components/Modal";
import { Toast, MySwal } from "../../../shared/utils/alerts";

// Formateador COP
const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);

// Cajas iniciales quemadas: 2 cuentas bancarias y 1 de efectivo con detalles como string simple
const INITIAL_BOXES: Caja[] = [
  {
    id_caja: 1,
    nombre: "Caja Menor Principal (Bodega)",
    tipo_caja: "Efectivo",
    saldo_actual: 1850000,
    estado: true,
    detalles: "Fondo para gastos diarios de bodega y mensajería local",
  },
  {
    id_caja: 2,
    nombre: "Bancolombia Ahorros Empresarial",
    tipo_caja: "Cuenta Bancaria",
    saldo_actual: 14750000,
    estado: true,
    detalles: "Bancolombia • Cta. Ahorros: 934-281904-12",
  },
  {
    id_caja: 3,
    nombre: "Davivienda Corriente Recaudos",
    tipo_caja: "Cuenta Bancaria",
    saldo_actual: 8920000,
    estado: true,
    detalles: "Davivienda • Cta. Corriente: 048-119284-05",
  },
];

export default function BoxesPage() {
  const [cajas, setCajas] = useState<Caja[]>(INITIAL_BOXES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  // Modal Crear Caja
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tipoCaja, setTipoCaja] = useState<TipoCaja>("Efectivo");
  const [saldoInicial, setSaldoInicial] = useState<string>("0");
  const [detalles, setDetalles] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Métricas de Liquidez
  const metrics = useMemo(() => {
    const totalSaldo = cajas
      .filter((c) => c.estado)
      .reduce((sum, c) => sum + Number(c.saldo_actual), 0);

    const saldoEfectivo = cajas
      .filter((c) => c.estado && c.tipo_caja === "Efectivo")
      .reduce((sum, c) => sum + Number(c.saldo_actual), 0);

    const saldoBancos = cajas
      .filter((c) => c.estado && c.tipo_caja === "Cuenta Bancaria")
      .reduce((sum, c) => sum + Number(c.saldo_actual), 0);

    const activas = cajas.filter((c) => c.estado).length;

    return { totalSaldo, saldoEfectivo, saldoBancos, activas };
  }, [cajas]);

  // Filtrado de cajas
  const filteredCajas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return cajas.filter((c) => {
      const matchesQuery =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        (c.detalles && c.detalles.toLowerCase().includes(q));

      const matchesTipo = filterTipo === "all" || c.tipo_caja === filterTipo;
      const matchesEstado =
        filterEstado === "all" ||
        (filterEstado === "active" && c.estado) ||
        (filterEstado === "inactive" && !c.estado);

      return matchesQuery && matchesTipo && matchesEstado;
    });
  }, [cajas, searchQuery, filterTipo, filterEstado]);

  // Alternar estado activo / inactivo
  const handleToggleEstado = async (caja: Caja) => {
    const nuevoEstado = !caja.estado;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿Deseas ${accion} esta caja?`,
      html: `
        <div class="space-y-1 text-left text-xs">
          <p>Caja: <strong class="text-[#0E2347] font-bold">${caja.nombre}</strong></p>
          <p class="text-slate-500">Saldo registrado: <strong class="text-[#2B62D9] font-bold">${formatCOP(
        caja.saldo_actual
      )}</strong></p>
          <p class="text-slate-400 text-[11px] pt-1">
            ${nuevoEstado
          ? "La caja volverá a estar disponible para recibir cobros y egresos."
          : "La caja quedará pausada temporalmente para movimientos."
        }
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setCajas((prev) =>
        prev.map((item) =>
          item.id_caja === caja.id_caja ? { ...item, estado: nuevoEstado } : item
        )
      );

      Toast.fire({
        icon: "success",
        title: `Caja ${nuevoEstado ? "activada" : "desactivada"} exitosamente`,
      });
    }
  };

  // Crear nueva caja
  const handleCreateCaja = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre de la caja es obligatorio.";
    }

    const saldoNum = Number(saldoInicial);
    if (isNaN(saldoNum) || saldoNum < 0) {
      newErrors.saldo = "El saldo inicial debe ser un número mayor o igual a 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const nuevaCaja: Caja = {
      id_caja: Date.now(),
      nombre: nombre.trim(),
      tipo_caja: tipoCaja,
      saldo_actual: saldoNum,
      estado: true,
      detalles: detalles.trim() || undefined,
    };

    setCajas((prev) => [nuevaCaja, ...prev]);
    setIsCreateOpen(false);

    // Limpiar formulario
    setNombre("");
    setTipoCaja("Efectivo");
    setSaldoInicial("0");
    setDetalles("");
    setErrors({});

    Toast.fire({
      icon: "success",
      title: "Nueva caja registrada con éxito",
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sky/15 text-brand-royal dark:text-brand-sky border border-brand-sky/30 text-xs font-bold tracking-wider uppercase mb-2">
            <FontAwesomeIcon icon={faVault} className="text-xs" />
            <span>Tesorería y Liquidez</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-app-text tracking-tight">
            Gestión de Cajas Menores y Cuentas
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Supervisa los fondos disponibles en efectivo y cuentas bancarias, controla saldos y activa o pausa cajas operativas.
          </p>
        </div>

        <Button
          variant="primary"
          icon={faPlus}
          onClick={() => setIsCreateOpen(true)}
          className="shadow-md shadow-brand-royal/20"
        >
          Añadir Nueva Caja
        </Button>
      </div>

      {/* ─── Métricas de Fondos ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidez */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Liquidez Total Activa
            </span>
            <p className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1">
              {formatCOP(metrics.totalSaldo)}
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              En {metrics.activas} {metrics.activas === 1 ? "caja activa" : "cajas activas"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faPiggyBank} />
          </div>
        </div>

        {/* Cuentas Bancarias */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Fondos en Bancos
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              {formatCOP(metrics.saldoBancos)}
            </p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Cuentas registradas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faBuildingColumns} />
          </div>
        </div>

        {/* Efectivo en Bodega */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Efectivo Disponible
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCOP(metrics.saldoEfectivo)}
            </p>
            <span className="text-[11px] text-app-muted font-medium">
              Cajas físicas menores
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
        </div>

        {/* Estado Operativo */}
        <div className="isabel-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Total Cajas
            </span>
            <p className="text-2xl font-black text-app-text mt-1">
              {cajas.length}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
              {metrics.activas} operativas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faCashRegister} />
          </div>
        </div>
      </div>

      {/* ─── Filtros de Búsqueda ─── */}
      <div className="isabel-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          <div className="sm:col-span-12 lg:col-span-6">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o detalles de la caja..."
              iconLeft={faMagnifyingGlass}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              options={[
                { value: "all", label: "Todos los Tipos" },
                { value: "Efectivo", label: "Efectivo" },
                { value: "Cuenta Bancaria", label: "Cuenta Bancaria" },
              ]}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              options={[
                { value: "all", label: "Todos los Estados" },
                { value: "active", label: "Cajas Activas" },
                { value: "inactive", label: "Cajas Pausadas / Inactivas" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── Grid de Tarjetas de Cajas ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCajas.length > 0 ? (
          filteredCajas.map((caja) => {
            const isBank = caja.tipo_caja === "Cuenta Bancaria";

            return (
              <div
                key={caja.id_caja}
                className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-300 p-6 shadow-sm hover:shadow-xl ${caja.estado
                    ? "bg-app-surface border-app-border hover:border-brand-royal/40 dark:hover:border-brand-sky/40"
                    : "bg-app-surface/60 border-app-border/70 opacity-70"
                  }`}
              >
                {/* Cabecera de la Tarjeta */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isBank
                            ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                      >
                        <FontAwesomeIcon
                          icon={isBank ? faBuildingColumns : faMoneyBillWave}
                        />
                      </div>

                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isBank
                              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {caja.tipo_caja}
                        </span>
                        <h3 className="text-base font-bold text-app-text leading-tight mt-1 line-clamp-1" title={caja.nombre}>
                          {caja.nombre}
                        </h3>
                      </div>
                    </div>

                    {/* Botón Switch de Estado */}
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(caja)}
                      className={`text-2xl transition-colors cursor-pointer p-1 -mr-1 -mt-1 ${caja.estado
                          ? "text-emerald-500 hover:text-emerald-600"
                          : "text-slate-300 dark:text-slate-600 hover:text-slate-400"
                        }`}
                      title={caja.estado ? "Desactivar caja" : "Activar caja"}
                      aria-label="Alternar estado de caja"
                    >
                      <FontAwesomeIcon icon={caja.estado ? faToggleOn : faToggleOff} />
                    </button>
                  </div>

                  {/* Saldo Actual destacado */}
                  <div className="p-4 rounded-2xl bg-app-surface-alt border border-app-border my-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-app-muted block">
                      Saldo Actual
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-2xl font-black text-brand-royal dark:text-brand-sky">
                        {formatCOP(caja.saldo_actual)}
                      </span>
                      <span className="text-xs font-bold text-app-muted">COP</span>
                    </div>
                  </div>

                  {/* Detalles (String directo) */}
                  {caja.detalles ? (
                    <div className="p-3 rounded-xl bg-app-surface-alt/70 border border-app-border/80 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-app-muted block mb-1">
                        Detalles / Referencia
                      </span>
                      <p className="text-app-text font-medium leading-relaxed">
                        {caja.detalles}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-app-muted italic py-1">
                      Sin observaciones o detalles adicionales.
                    </p>
                  )}
                </div>

                {/* Footer de la Tarjeta */}
                <div className="pt-4 mt-3 border-t border-app-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${caja.estado ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                    />
                    <span
                      className={`font-semibold ${caja.estado
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-app-muted"
                        }`}
                    >
                      {caja.estado ? "Activa y Operativa" : "Inactiva / En Pausa"}
                    </span>
                  </div>

                  <span className="text-[11px] text-app-muted">ID #{caja.id_caja}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full isabel-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-2xl mx-auto mb-4">
              <FontAwesomeIcon icon={faVault} />
            </div>
            <h3 className="text-base font-bold text-app-text mb-1">
              No se encontraron cajas con los filtros actuales
            </h3>
            <p className="text-xs text-app-muted max-w-sm mx-auto mb-4">
              Prueba cambiando la búsqueda o restableciendo los selectores de tipo y estado.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterTipo("all");
                setFilterEstado("all");
              }}
            >
              Restablecer Filtros
            </Button>
          </div>
        )}
      </div>

      {/* ─── Modal Añadir Nueva Caja ─── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Añadir Nueva Caja o Cuenta"
        description="Registra una nueva fuente de dinero para tesorería, ventas o pagos de Calzado ISABEL."
        icon={faWallet}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateCaja}>
              Guardar Caja
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCaja} className="space-y-4 text-sm">
          {/* Tipo de Caja */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1.5">
              Tipo de Caja / Origen *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoCaja("Efectivo")}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${tipoCaja === "Efectivo"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                    : "bg-app-surface border-app-border hover:bg-brand-sky/5"
                  }`}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />
                <span className="font-bold text-xs">Efectivo Físico</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoCaja("Cuenta Bancaria")}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${tipoCaja === "Cuenta Bancaria"
                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/20"
                    : "bg-app-surface border-app-border hover:bg-brand-sky/5"
                  }`}
              >
                <FontAwesomeIcon icon={faBuildingColumns} className="text-lg" />
                <span className="font-bold text-xs">Cuenta Bancaria</span>
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">
              Nombre descriptivo de la Caja *
            </label>
            <Input
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: "" }));
              }}
              placeholder={
                tipoCaja === "Efectivo"
                  ? "Ej. Caja Menor Punto de Venta"
                  : "Ej. Bancolombia Ahorros Principal"
              }
            />
            {errors.nombre && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Saldo Inicial */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">
              Saldo Inicial (COP) *
            </label>
            <Input
              type="number"
              min="0"
              step="1000"
              value={saldoInicial}
              onChange={(e) => {
                setSaldoInicial(e.target.value);
                if (errors.saldo) setErrors((prev) => ({ ...prev, saldo: "" }));
              }}
              placeholder="0"
            />
            {errors.saldo && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.saldo}</p>
            )}
          </div>

          {/* Detalles (string completo) */}
          <div>
            <label className="block text-xs font-bold text-app-text mb-1">
              Detalles / Observaciones
            </label>
            <Input
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              placeholder={
                tipoCaja === "Cuenta Bancaria"
                  ? "Ej. Bancolombia • Cta. Ahorros: 934-281904-12"
                  : "Ej. Fondo asignado para gastos menores de bodega"
              }
            />
            <span className="text-[11px] text-app-muted mt-1 block">
              Texto complementario almacenado directamente como referencia.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-brand-sky/10 border border-brand-sky/20 text-xs text-brand-royal dark:text-brand-sky flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>La caja se creará activa por defecto y estará lista para registrar movimientos.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
}
