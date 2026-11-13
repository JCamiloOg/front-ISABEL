import { useState, useEffect, useMemo } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../../shared/components/Button";
import { Toast } from "../../../../shared/utils/alerts";
import type { Almacen, Caja, DatosGasto, Gasto, TipoCaja } from "./types";
import {
  cargarAlmacen,
  formatoCOP,
  generarId,
  guardarAlmacen,
  normalizar,
  siguienteCodigo,
} from "./utils";
import { CajaCard } from "./components/CajaCard";
import { ModalCaja } from "./components/ModalCaja";
import { ModalGasto } from "./components/ModalGasto";
import { TablaGastos } from "./components/TablaGastos";

export function GastosPage() {
  const [almacenInicial] = useState<Almacen>(cargarAlmacen);
  const [cajas, setCajas] = useState<Caja[]>(almacenInicial.cajas);
  const [gastos, setGastos] = useState<Gasto[]>(almacenInicial.gastos);
  const [conceptos, setConceptos] = useState<string[]>(almacenInicial.conceptos);

  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalCajaOpen, setModalCajaOpen] = useState(false);

  // Persistencia local automática
  useEffect(() => {
    guardarAlmacen({ cajas, gastos, conceptos });
  }, [cajas, gastos, conceptos]);

  // Saldo total acumulado de todas las cajas
  const saldoTotal = useMemo(
    () => cajas.reduce((suma, c) => suma + c.saldo, 0),
    [cajas],
  );

  // Registrar una nueva caja / cuenta
  const registrarCaja = (datos: { nombre: string; tipo: TipoCaja; saldo: number }) => {
    if (cajas.some((c) => normalizar(c.nombre) === normalizar(datos.nombre))) {
      Toast.fire({
        icon: "error",
        title: "Caja duplicada",
        text: "Ya existe una caja con ese nombre.",
      });
      return;
    }

    const nueva: Caja = {
      id: generarId("caja"),
      nombre: datos.nombre,
      tipo: datos.tipo,
      saldo: datos.saldo,
    };

    setCajas((previas) => [...previas, nueva]);
    setModalCajaOpen(false);
    Toast.fire({
      icon: "success",
      title: "Caja registrada",
      text: `${nueva.nombre} inició con ${formatoCOP(nueva.saldo)}.`,
    });
  };

  // Registrar nuevo concepto de gasto
  const agregarConcepto = (concepto: string) => {
    setConceptos((previos) => (previos.includes(concepto) ? previos : [...previos, concepto]));
  };

  // Registrar un nuevo gasto y descontarlo de la caja correspondiente
  const registrarGasto = (datos: DatosGasto) => {
    const caja = cajas.find((c) => c.id === datos.cajaId);
    if (!caja) {
      Toast.fire({
        icon: "error",
        title: "Caja no encontrada",
        text: "La caja seleccionada ya no existe.",
      });
      return;
    }

    if (datos.valor > caja.saldo) {
      Toast.fire({
        icon: "error",
        title: "Saldo insuficiente",
        text: `${caja.nombre} solo tiene ${formatoCOP(caja.saldo)} disponibles.`,
      });
      return;
    }

    const nuevo: Gasto = {
      id: generarId("gasto"),
      codigo: siguienteCodigo(gastos),
      concepto: datos.concepto,
      fecha: datos.fecha,
      cajaId: caja.id,
      cajaNombre: caja.nombre,
      valor: datos.valor,
      descripcion: datos.descripcion,
    };

    const nuevoSaldo = caja.saldo - datos.valor;

    setGastos((previos) => [nuevo, ...previos]);
    setCajas((previas) =>
      previas.map((c) => (c.id === caja.id ? { ...c, saldo: nuevoSaldo } : c)),
    );
    setModalGastoOpen(false);

    Toast.fire({
      icon: "success",
      title: "Gasto registrado",
      text: `Se descontaron ${formatoCOP(datos.valor)} de ${caja.nombre}. Nuevo saldo: ${formatoCOP(nuevoSaldo)}.`,
    });
  };

  return (
    <div className="min-h-full bg-app-bg p-6 text-app-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
              Dashboard / Gastos
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-app-text tracking-tight">
              Gestión de gastos
            </h1>
            <div className="mt-2.5 h-1 w-10 rounded-full bg-brand-sky" />
            <p className="mt-3 max-w-2xl text-sm text-app-muted leading-relaxed">
              Registra los egresos operativos del negocio y supervisa en tiempo real el saldo de tus
              cuentas bancarias y cajas de efectivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={faPlus}
              onClick={() => setModalCajaOpen(true)}
            >
              Registrar caja
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={faPlus}
              onClick={() => setModalGastoOpen(true)}
            >
              Registrar gasto
            </Button>
          </div>
        </header>

        {/* Sección Cajas */}
        <section aria-labelledby="titulo-cajas" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 id="titulo-cajas" className="text-xl font-bold text-app-text">
                Cajas y Cuentas
              </h2>
              <span className="rounded-md border border-brand-sky/20 bg-brand-sky/10 px-2 py-0.5 text-xs font-semibold text-app-muted">
                {cajas.length === 1 ? "1 caja" : `${cajas.length} cajas`}
              </span>
            </div>

            <p className="text-sm text-app-muted">
              Saldo total disponible:{" "}
              <strong className="font-extrabold text-brand-royal dark:text-brand-sky text-base">
                {formatoCOP(saldoTotal)}
              </strong>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cajas.map((caja) => (
              <CajaCard key={caja.id} caja={caja} />
            ))}
          </div>
        </section>

        {/* Sección Tabla de Historial */}
        <TablaGastos gastos={gastos} />
      </div>

      {/* Modales */}
      <ModalCaja
        isOpen={modalCajaOpen}
        cajas={cajas}
        onCerrar={() => setModalCajaOpen(false)}
        onGuardar={registrarCaja}
      />

      <ModalGasto
        isOpen={modalGastoOpen}
        cajas={cajas}
        conceptos={conceptos}
        onCerrar={() => setModalGastoOpen(false)}
        onGuardar={registrarGasto}
        onNuevoConcepto={agregarConcepto}
      />
    </div>
  );
}

export default GastosPage;

