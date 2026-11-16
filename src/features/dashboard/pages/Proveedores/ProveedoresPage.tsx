import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faIndustry,
  faBuilding,
  faUserTie,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Toast } from "../../../../shared/utils/alerts";
import type { FormProveedor, Proveedor } from "./types";
import { MOCK_CATEGORIAS_PROVEEDOR, MOCK_PROVEEDORES } from "./constants";
import { generarId } from "./utils";

import { ModalFormProveedor } from "./components/ModalFormProveedor";
import { ModalDetalleProveedor } from "./components/ModalDetalleProveedor";
import { TablaProveedores } from "./components/TablaProveedores";

export function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(MOCK_PROVEEDORES);
  const [categorias] = useState(MOCK_CATEGORIAS_PROVEEDOR);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null);

  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [proveedorParaDetalle, setProveedorParaDetalle] = useState<Proveedor | null>(null);

  // Métricas ejecutivas
  const metricas = useMemo(() => {
    const total = proveedores.length;
    const juridicos = proveedores.filter((p) => p.tipoProveedor === "Jurídico").length;
    const naturales = proveedores.filter((p) => p.tipoProveedor === "Natural").length;
    const importados = proveedores.filter((p) => p.esImportado).length;
    const activos = proveedores.filter((p) => p.estado === "Activo").length;

    return { total, juridicos, naturales, importados, activos };
  }, [proveedores]);

  // Guardar o Actualizar Proveedor
  const handleGuardarProveedor = (datos: FormProveedor, idProveedor?: string) => {
    const proveedorPrevio = proveedores.find((p) => p.idProveedor === idProveedor);
    const categoriasCompletas = datos.categoriaIds
      ? categorias.filter((c) => datos.categoriaIds?.includes(c.idCategoria))
      : (proveedorPrevio?.categorias || []);

    if (idProveedor) {
      // Modo edición
      setProveedores((prev) =>
        prev.map((p) =>
          p.idProveedor === idProveedor
            ? {
              ...p,
              tipoDocumento: datos.tipoDocumento,
              numeroDocumento: datos.numeroDocumento,
              razonSocial: datos.razonSocial,
              tipoProveedor: datos.tipoProveedor,
              esImportado: datos.esImportado,
              categorias: categoriasCompletas,
              telefono: datos.telefono,
              email: datos.email,
              direccion: datos.direccion,
              ciudad: datos.ciudad,
              pais: datos.pais,
            }
            : p,
        ),
      );

      Toast.fire({
        icon: "success",
        title: "Proveedor actualizado",
        text: `Se guardaron los cambios para ${datos.razonSocial}.`,
      });
    } else {
      // Modo creación
      const nuevoProveedor: Proveedor = {
        idProveedor: generarId("prov"),
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
        razonSocial: datos.razonSocial,
        tipoProveedor: datos.tipoProveedor,
        esImportado: datos.esImportado,
        categorias: categoriasCompletas,
        telefono: datos.telefono,
        email: datos.email,
        direccion: datos.direccion,
        ciudad: datos.ciudad,
        pais: datos.pais,
        estado: "Activo",
        fechaRegistro: new Date().toISOString(),
      };

      setProveedores((prev) => [nuevoProveedor, ...prev]);

      Toast.fire({
        icon: "success",
        title: "Proveedor registrado con éxito",
        text: `${datos.razonSocial} ha sido añadido a la lista.`,
      });
    }

    setIsFormOpen(false);
    setProveedorAEditar(null);
  };

  // Alternar estado activo / inactivo
  const handleToggleEstado = (proveedor: Proveedor) => {
    const nuevoEstado = proveedor.estado === "Activo" ? "Inactivo" : "Activo";

    setProveedores((prev) =>
      prev.map((p) =>
        p.idProveedor === proveedor.idProveedor ? { ...p, estado: nuevoEstado } : p,
      ),
    );

    Toast.fire({
      icon: "info",
      title: `Proveedor ${nuevoEstado.toLowerCase()}`,
      text: `${proveedor.razonSocial} ahora se encuentra ${nuevoEstado.toLowerCase()}.`,
    });
  };

  const handleAbrirEditar = (proveedor: Proveedor) => {
    setProveedorAEditar(proveedor);
    setIsFormOpen(true);
  };

  const handleAbrirDetalle = (proveedor: Proveedor) => {
    setProveedorParaDetalle(proveedor);
    setIsDetalleOpen(true);
  };

  return (
    <div className="min-h-full bg-app-bg pb-6 text-app-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ── Encabezado Principal ── */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-app-border pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                <FontAwesomeIcon icon={faIndustry} className="text-lg" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                  Gestión de Proveedores
                </h1>
                <p className="text-sm text-app-muted">
                  Administra los fabricantes y distribuidores de materias primas, insumos y calzado                        </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={faPlus}
              onClick={() => {
                setProveedorAEditar(null);
                setIsFormOpen(true);
              }}
            >
              Registrar Proveedor
            </Button>
          </div>
        </header>

        {/* ── Tarjetas de Métricas Ejecutivas ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Proveedores */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Total Proveedores</p>
              <p className="mt-1 text-2xl font-extrabold text-app-text">
                {metricas.total}
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {metricas.activos} activos actualmente
              </span>
            </div>
            <div className="size-11 rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faIndustry} />
            </div>
          </div>

          {/* Proveedores Jurídicos */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Personas Jurídicas</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-royal dark:text-brand-sky">
                {metricas.juridicos}
              </p>
              <span className="text-[11px] text-app-muted">
                Empresas y sociedades
              </span>
            </div>
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-brand-sky/15 dark:text-brand-sky flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
          </div>

          {/* Proveedores Naturales */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Personas Naturales</p>
              <p className="mt-1 text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {metricas.naturales}
              </p>
              <span className="text-[11px] text-app-muted">
                Artesanos y comerciantes
              </span>
            </div>
            <div className="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
          </div>

          {/* Proveedores Importados */}
          <div className="rounded-2xl border border-brand-sky/20 bg-app-surface p-4.5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-app-muted">Proveedores Importados</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {metricas.importados}
              </p>
              <span className="text-[11px] text-indigo-500">
                Procedencia extranjera
              </span>
            </div>
            <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faGlobe} />
            </div>
          </div>
        </section>

        {/* ── Tabla Principal de Proveedores ── */}
        <TablaProveedores
          proveedores={proveedores}
          categorias={categorias}
          onVerDetalle={handleAbrirDetalle}
          onEditar={handleAbrirEditar}
          onToggleEstado={handleToggleEstado}
        />
      </div>

      {/* ── Modal Formulario (Crear / Editar) ── */}
      <ModalFormProveedor
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setProveedorAEditar(null);
        }}
        proveedorAEditar={proveedorAEditar}
        proveedoresExistentes={proveedores}
        categoriasDisponibles={categorias}
        onGuardarProveedor={handleGuardarProveedor}
      />

      {/* ── Modal Detalle del Proveedor ── */}
      <ModalDetalleProveedor
        isOpen={isDetalleOpen}
        onClose={() => {
          setIsDetalleOpen(false);
          setProveedorParaDetalle(null);
        }}
        proveedor={proveedorParaDetalle}
        onEditar={handleAbrirEditar}
        onToggleEstado={(p) => {
          handleToggleEstado(p);
          setProveedorParaDetalle((prev) =>
            prev && prev.idProveedor === p.idProveedor
              ? { ...prev, estado: prev.estado === "Activo" ? "Inactivo" : "Activo" }
              : prev,
          );
        }}
      />
    </div>
  );
}

export default ProveedoresPage;

