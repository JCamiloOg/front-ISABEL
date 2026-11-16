import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRulerCombined,
  faPlus,
  faMagnifyingGlass,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faLock,
  faShoePrints,
  faToggleOn,
  faToggleOff,
  faShieldHalved,
  faBoxesStacked,
  faGlobe,
  faFlag,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface TallaItem {
  idTalla: number;
  numeroTalla: string; // Talla Nacional (COL / EU)
  tallaInternacional: string; // Talla Extranjera (US / INT)
  estado: Estado;
  descripcion?: string;
  equivalenciaUK?: string;
  equivalenciaCM?: string;
  fechaRegistro: string;
}

// Catálogo inicial de tallas nacionales y extranjeras del ERP
const INITIAL_TALLAS: TallaItem[] = [
  {
    idTalla: 1,
    numeroTalla: "35",
    tallaInternacional: "US 4.5",
    estado: "Activo",
    descripcion: "Talla estándar pequeña para calzado formal y deportivo",
    equivalenciaUK: "UK 3.0",
    equivalenciaCM: "22.5 cm",
    fechaRegistro: "2026-01-10",
  },
  {
    idTalla: 2,
    numeroTalla: "36",
    tallaInternacional: "US 5",
    estado: "Activo",
    descripcion: "Medida habitual para zapatillas juveniles y casuales",
    equivalenciaUK: "UK 3.5",
    equivalenciaCM: "23.0 cm",
    fechaRegistro: "2026-01-10",
  },
  {
    idTalla: 3,
    numeroTalla: "37",
    tallaInternacional: "US 6",
    estado: "Activo",
    descripcion: "Talla de alta rotación para modelos casuales y deportivos",
    equivalenciaUK: "UK 4.0",
    equivalenciaCM: "23.5 cm",
    fechaRegistro: "2026-01-12",
  },
  {
    idTalla: 4,
    numeroTalla: "38",
    tallaInternacional: "US 6.5",
    estado: "Activo",
    descripcion: "Talla versátil intermedia para líneas urbanas y skate",
    equivalenciaUK: "UK 5.5",
    equivalenciaCM: "24.5 cm",
    fechaRegistro: "2026-01-12",
  },
  {
    idTalla: 5,
    numeroTalla: "39",
    tallaInternacional: "US 7.5",
    estado: "Activo",
    descripcion: "Talla de alta rotación en zapatillas de running y casual",
    equivalenciaUK: "UK 6.0",
    equivalenciaCM: "25.0 cm",
    fechaRegistro: "2026-01-15",
  },
  {
    idTalla: 6,
    numeroTalla: "40",
    tallaInternacional: "US 8",
    estado: "Activo",
    descripcion: "Talla estándar de máxima demanda y disponibilidad",
    equivalenciaUK: "UK 7.0",
    equivalenciaCM: "25.5 cm",
    fechaRegistro: "2026-01-15",
  },
  {
    idTalla: 7,
    numeroTalla: "41",
    tallaInternacional: "US 8.5",
    estado: "Activo",
    descripcion: "Talla principal para calzado deportivo de rendimiento",
    equivalenciaUK: "UK 7.5",
    equivalenciaCM: "26.0 cm",
    fechaRegistro: "2026-01-18",
  },
  {
    idTalla: 8,
    numeroTalla: "42",
    tallaInternacional: "US 9",
    estado: "Activo",
    descripcion: "Medida estándar para botas, botines y zapatillas",
    equivalenciaUK: "UK 8.0",
    equivalenciaCM: "26.5 cm",
    fechaRegistro: "2026-01-18",
  },
  {
    idTalla: 9,
    numeroTalla: "43",
    tallaInternacional: "US 10",
    estado: "Activo",
    descripcion: "Talla grande de alta demanda en calzado importado",
    equivalenciaUK: "UK 9.0",
    equivalenciaCM: "27.5 cm",
    fechaRegistro: "2026-01-20",
  },
  {
    idTalla: 10,
    numeroTalla: "44",
    tallaInternacional: "US 10.5",
    estado: "Activo",
    descripcion: "Talla especial para calzado de baloncesto, trail y botas",
    equivalenciaUK: "UK 9.5",
    equivalenciaCM: "28.0 cm",
    fechaRegistro: "2026-02-01",
  },
  {
    idTalla: 11,
    numeroTalla: "45",
    tallaInternacional: "US 11.5",
    estado: "Inactivo",
    descripcion: "Talla extragrande actualmente bajo pedido especial",
    equivalenciaUK: "UK 10.5",
    equivalenciaCM: "29.0 cm",
    fechaRegistro: "2026-02-10",
  },
];

// Conversor auxiliar sugerido para talla extranjera (US) a partir de la nacional
const sugerirTallaExtranjera = (nacional: string): string => {
  const num = parseInt(nacional, 10);
  if (isNaN(num)) return "";
  if (num <= 28) return "US 11C";
  if (num <= 31) return "US 13C";
  if (num <= 34) return "US 2.5Y";
  const us = Math.max(4, (num - 32) * 0.8 + 4).toFixed(1).replace(".0", "");
  return `US ${us}`;
};

export default function TallaProducts() {
  const [tallas, setTallas] = useState<TallaItem[]>(INITIAL_TALLAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "numeroTalla",
    direction: "asc",
  });

  // Modal Crear / Editar Talla
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTalla, setEditingTalla] = useState<TallaItem | null>(null);
  const [formNumero, setFormNumero] = useState("");
  const [formInternacional, setFormInternacional] = useState("");
  const [formEstado, setFormEstado] = useState<Estado>("Activo");
  const [formUK, setFormUK] = useState("");
  const [formCM, setFormCM] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");

  // Modal Detalle de Talla
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTalla, setDetailTalla] = useState<TallaItem | null>(null);

  // Obtener calzados asociados con esta talla desde el mock global de productos
  const getShoesForTalla = (idTalla: number, numeroTalla: string) => {
    return MOCK_PRODUCTOS_PRISMA.filter((p) =>
      p.colores.some((c) =>
        c.variantes.some(
          (v) => v.idTalla === idTalla || v.talla.numeroTalla === numeroTalla
        )
      )
    );
  };

  // Calcular el stock total disponible en inventario para esta talla
  const getTotalStockForTalla = (idTalla: number, numeroTalla: string) => {
    let stock = 0;
    MOCK_PRODUCTOS_PRISMA.forEach((p) => {
      p.colores.forEach((c) => {
        c.variantes.forEach((v) => {
          if (v.idTalla === idTalla || v.talla.numeroTalla === numeroTalla) {
            stock += v.stockActual;
          }
        });
      });
    });
    return stock;
  };

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = tallas.length;
    const activas = tallas.filter((t) => t.estado === "Activo").length;
    const inactivas = total - activas;

    let totalParesEnStock = 0;
    tallas.forEach((t) => {
      totalParesEnStock += getTotalStockForTalla(t.idTalla, t.numeroTalla);
    });

    return { total, activas, inactivas, totalParesEnStock };
  }, [tallas]);

  // Manejo de ordenamiento por columna
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: columnKey, direction: "asc" };
    });
  };

  // Filtrado y ordenamiento de tallas
  const filteredTallas = useMemo(() => {
    return tallas
      .filter((t) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          t.numeroTalla.toLowerCase().includes(q) ||
          t.tallaInternacional.toLowerCase().includes(q) ||
          t.equivalenciaUK?.toLowerCase().includes(q) ||
          t.descripcion?.toLowerCase().includes(q);

        const matchesEstado = filterEstado === "all" || t.estado === filterEstado;

        return matchesQuery && matchesEstado;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "numeroTalla") {
          const numA = parseFloat(a.numeroTalla) || 0;
          const numB = parseFloat(b.numeroTalla) || 0;
          return (numA - numB) * factor;
        }
        if (sortConfig.key === "tallaInternacional") {
          return a.tallaInternacional.localeCompare(b.tallaInternacional) * factor;
        }
        if (sortConfig.key === "stock") {
          const stockA = getTotalStockForTalla(a.idTalla, a.numeroTalla);
          const stockB = getTotalStockForTalla(b.idTalla, b.numeroTalla);
          return (stockA - stockB) * factor;
        }
        return 0;
      });
  }, [tallas, searchQuery, filterEstado, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredTallas.length / itemsPerPage) || 1;
  const paginatedTallas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTallas.slice(start, start + itemsPerPage);
  }, [filteredTallas, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setSortConfig({ key: "numeroTalla", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado de la talla
  const handleToggleEstado = (talla: TallaItem) => {
    const nextEstado: Estado = talla.estado === "Activo" ? "Inactivo" : "Activo";
    setTallas((prev) =>
      prev.map((t) => (t.idTalla === talla.idTalla ? { ...t, estado: nextEstado } : t))
    );
    if (detailTalla && detailTalla.idTalla === talla.idTalla) {
      setDetailTalla({ ...detailTalla, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Talla ${talla.numeroTalla} (${talla.tallaInternacional}): ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingTalla(null);
    setFormNumero("");
    setFormInternacional("");
    setFormEstado("Activo");
    setFormUK("");
    setFormCM("");
    setFormDescripcion("");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (talla: TallaItem) => {
    setEditingTalla(talla);
    setFormNumero(talla.numeroTalla);
    setFormInternacional(talla.tallaInternacional);
    setFormEstado(talla.estado);
    setFormUK(talla.equivalenciaUK || "");
    setFormCM(talla.equivalenciaCM || "");
    setFormDescripcion(talla.descripcion || "");
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (talla: TallaItem) => {
    setDetailTalla(talla);
    setIsDetailOpen(true);
  };

  // Auto-sugerir talla internacional al escribir la talla nacional
  const handleNumeroChange = (val: string) => {
    setFormNumero(val);
    if (!editingTalla && val.trim()) {
      const sugerencia = sugerirTallaExtranjera(val.trim());
      if (sugerencia) {
        setFormInternacional(sugerencia);
      }
    }
  };

  // Guardar Talla (Crear o Editar)
  const handleSaveTalla = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNumero.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el número de talla nacional (COL / EU)",
      });
      return;
    }

    if (!formInternacional.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa la equivalencia de talla extranjera (US / INT)",
      });
      return;
    }

    if (editingTalla) {
      setTallas((prev) =>
        prev.map((t) =>
          t.idTalla === editingTalla.idTalla
            ? {
                ...t,
                numeroTalla: formNumero.trim(),
                tallaInternacional: formInternacional.trim(),
                estado: formEstado,
                equivalenciaUK: formUK.trim() || undefined,
                equivalenciaCM: formCM.trim() || undefined,
                descripcion: formDescripcion.trim() || t.descripcion,
              }
            : t
        )
      );
      Toast.fire({
        icon: "success",
        title: `Talla ${formNumero} (${formInternacional}) actualizada correctamente`,
      });
    } else {
      // Validar duplicado por misma talla nacional
      const exists = tallas.some(
        (t) => t.numeroTalla.toLowerCase() === formNumero.trim().toLowerCase()
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe la talla ${formNumero} registrada en el catálogo`,
        });
        return;
      }

      const newId =
        tallas.length > 0 ? Math.max(...tallas.map((t) => t.idTalla)) + 1 : 1;

      const newTalla: TallaItem = {
        idTalla: newId,
        numeroTalla: formNumero.trim(),
        tallaInternacional: formInternacional.trim(),
        estado: formEstado,
        equivalenciaUK: formUK.trim() || undefined,
        equivalenciaCM: formCM.trim() || undefined,
        descripcion:
          formDescripcion.trim() ||
          `Talla ${formNumero} (${formInternacional}) para calzado`,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setTallas((prev) => [newTalla, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Talla ${formNumero} (${formInternacional}) registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table (SIN botones de eliminación)
  const tableColumns: TableColumn<TallaItem>[] = [
    {
      key: "numeroTalla",
      header: "Talla Nacional (COL / EU)",
      sortable: true,
      render: (talla) => (
        <div className="flex items-center gap-3 py-1">
          <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-black text-sm border border-brand-royal/20 dark:border-brand-sky/20">
            {talla.numeroTalla}
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(talla)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver calzados en talla ${talla.numeroTalla}`}
            >
              Talla {talla.numeroTalla}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-app-muted">
              <FontAwesomeIcon icon={faFlag} className="text-[10px]" />
              <span>Nacional / Colombia / EUR</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "tallaInternacional",
      header: "Talla Extranjera (US / INT)",
      sortable: true,
      render: (talla) => (
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-mono font-bold text-app-text border border-app-border w-fit">
            <FontAwesomeIcon icon={faGlobe} className="text-brand-royal dark:text-brand-sky text-[11px]" />
            <span>{talla.tallaInternacional}</span>
          </div>
          {talla.equivalenciaUK && (
            <span className="text-[10px] text-app-muted mt-0.5">
              UK: {talla.equivalenciaUK} {talla.equivalenciaCM && `· ${talla.equivalenciaCM}`}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Calzados y Stock",
      sortable: true,
      align: "center",
      render: (talla) => {
        const shoes = getShoesForTalla(talla.idTalla, talla.numeroTalla);
        const totalStock = getTotalStockForTalla(talla.idTalla, talla.numeroTalla);

        return (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => openDetail(talla)}
              className="font-extrabold text-sm text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer"
              title="Clic para ver detalle de calzados"
            >
              {totalStock} pares
            </button>
            <span className="text-[11px] text-app-muted flex items-center gap-1">
              <FontAwesomeIcon icon={faShoePrints} className="text-[10px]" />
              {shoes.length} {shoes.length === 1 ? "modelo" : "modelos"}
            </span>
          </div>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (talla) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(talla)}
          title={`Hacer clic para cambiar a ${talla.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            talla.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              talla.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {talla.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (talla) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(talla)}
            title="Ver detalles de la talla y calzados disponibles"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(talla)}
            title="Editar talla nacional y extranjera"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Acción de eliminación bloqueada intencionalmente por calzado asociado */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: la talla tiene modelos de zapatos y pedidos asociados"
          >
            <FontAwesomeIcon icon={faLock} className="text-xs" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Encabezado Principal y Acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRulerCombined} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Tallas de Calzado
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo de medidas nacionales y equivalencias extranjeras (US, UK, CM)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={handleResetFilters}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Restablecer
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            onClick={handleOpenCreateModal}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nueva Talla
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tallas Registradas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faRulerCombined} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">tallas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} disponibles para calzado
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Tallas Activas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.activas}
            </span>
            <span className="text-xs text-app-muted">activas</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Listas para producción y venta
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Pares en Stock Total</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalParesEnStock}
            </span>
            <span className="text-xs text-app-muted">pares físicos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">En almacén de calzado</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Integridad de Tallas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              100%
            </span>
            <span className="text-xs text-app-muted">protegido</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Sin eliminación accidental
          </p>
        </div>
      </div>

      {/* Banner de aviso de no eliminación */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <p>
          <strong>Protección de existencias:</strong> Las tallas no se pueden eliminar debido a que contienen calzado registrado y existencias en bodega. Si deseas pausar una medida, cámbiala a estado <strong>Inactivo</strong> para que no aparezca en nuevas creaciones.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-tallas"
              type="search"
              placeholder="Buscar por talla nacional (ej. 40) o extranjera (ej. US 8)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              id="filter-talla-estado"
              value={filterEstado}
              onChange={(e) => {
                setFilterEstado(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredTallas.length}</strong> de{" "}
            <strong>{tallas.length}</strong> tallas registradas
          </span>
          {(searchQuery || filterEstado !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Tallas */}
      <Table<TallaItem>
        columns={tableColumns}
        data={paginatedTallas}
        rowKey="idTalla"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredTallas.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron tallas"
        emptyDescription="Prueba modificando la búsqueda o el filtro de estado."
      />

      {/* MODAL CREAR / EDITAR TALLA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTalla ? "Editar Talla de Calzado" : "Registrar Nueva Talla"}
        description="Configura la medida nacional y sus equivalencias extranjeras (US, UK, CM)"
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTalla}>
              {editingTalla ? "Guardar Cambios" : "Crear Talla"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTalla} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-talla-nacional"
              label="Talla Nacional (COL / EUR)"
              placeholder="Ej. 39, 40, 41"
              value={formNumero}
              onChange={(e) => handleNumeroChange(e.target.value)}
              required
              helper="Medida local en Colombia y Europa"
            />

            <Input
              id="form-talla-extranjera"
              label="Talla Extranjera (US / INT)"
              placeholder="Ej. US 8, US 8.5"
              value={formInternacional}
              onChange={(e) => setFormInternacional(e.target.value)}
              required
              helper="Equivalencia para calzado americano"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="form-talla-estado"
              label="Estado Inicial"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible para zapatos)" },
                { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
              ]}
            />

            <Input
              id="form-talla-uk"
              label="Equivalencia UK (Opcional)"
              placeholder="Ej. UK 7.5"
              value={formUK}
              onChange={(e) => setFormUK(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-talla-cm"
              label="Medida en CM / MX (Opcional)"
              placeholder="Ej. 26.0 cm"
              value={formCM}
              onChange={(e) => setFormCM(e.target.value)}
            />

            <Input
              id="form-talla-desc"
              label="Descripción / Observaciones (Opcional)"
              placeholder="Ej. Horma ancha estándar para calzado casual"
              value={formDescripcion}
              onChange={(e) => setFormDescripcion(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-app-border bg-app-surface-alt p-3 text-xs text-app-muted flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-brand-royal dark:text-brand-sky mt-0.5" />
            <span>
              <strong>Integridad protegida:</strong> Esta talla quedará disponible para asignar a calzados y no podrá ser eliminada para garantizar la trazabilidad de pedidos y existencias.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE TALLA Y CALZADOS ASOCIADOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailTalla ? `Talla ${detailTalla.numeroTalla} (${detailTalla.tallaInternacional})` : "Detalle de Talla"}
        description={`ID #${detailTalla?.idTalla} · Medida de calzado`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailTalla?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailTalla && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailTalla);
                  }}
                >
                  Editar Talla
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailTalla && (
          <div className="space-y-6">
            {/* Tarjetas comparativas de medidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-brand-royal/30 bg-brand-royal/10 dark:bg-brand-sky/15 dark:border-brand-sky/30 p-3.5 text-center">
                <span className="text-[10px] font-bold text-brand-royal dark:text-brand-sky uppercase tracking-wider block">
                  Nacional (COL / EU)
                </span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {detailTalla.numeroTalla}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Extranjera (US)
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {detailTalla.tallaInternacional}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Reino Unido (UK)
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {detailTalla.equivalenciaUK || "—"}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface-alt p-3.5 text-center">
                <span className="text-[10px] font-semibold text-app-muted uppercase tracking-wider block">
                  Longitud (CM)
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {detailTalla.equivalenciaCM || "—"}
                </span>
              </div>
            </div>

            {/* Información adicional y estado */}
            <div className="rounded-2xl border border-app-border bg-app-surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-app-text">
                  Descripción: {detailTalla.descripcion}
                </p>
                <p className="text-xs text-app-muted mt-0.5">
                  Registrada el {detailTalla.fechaRegistro}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleEstado(detailTalla)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  detailTalla.estado === "Activo"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={detailTalla.estado === "Activo" ? faToggleOn : faToggleOff}
                  className="text-xs"
                />
                <span>Estado: {detailTalla.estado}</span>
              </button>
            </div>

            {/* Listado de Calzados disponibles en esta talla */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
                  Modelos de Calzado en esta Talla ({getShoesForTalla(detailTalla.idTalla, detailTalla.numeroTalla).length})
                </h4>
                <span className="text-xs text-app-muted font-semibold">
                  Stock Total: {getTotalStockForTalla(detailTalla.idTalla, detailTalla.numeroTalla)} pares
                </span>
              </div>

              {getShoesForTalla(detailTalla.idTalla, detailTalla.numeroTalla).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getShoesForTalla(detailTalla.idTalla, detailTalla.numeroTalla).map((prod) => {
                    const firstColor = prod.colores?.[0];
                    const prodImg =
                      firstColor?.imagenes?.[0] ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

                    // Total de pares de este producto en la talla
                    let prodPairs = 0;
                    prod.colores.forEach((c) => {
                      c.variantes.forEach((v) => {
                        if (
                          v.idTalla === detailTalla.idTalla ||
                          v.talla.numeroTalla === detailTalla.numeroTalla
                        ) {
                          prodPairs += v.stockActual;
                        }
                      });
                    });

                    return (
                      <div
                        key={prod.idProducto}
                        className="p-3 flex items-center justify-between hover:bg-app-surface-alt/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prodImg}
                            alt={prod.nombre}
                            className="h-10 w-10 rounded-lg object-cover border border-app-border"
                          />
                          <div>
                            <p className="font-bold text-xs text-app-text">{prod.nombre}</p>
                            <span className="text-[11px] text-app-muted font-mono">{prod.sku}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-app-text">
                            {prodPairs} pares disponibles
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-app-muted">
                  <FontAwesomeIcon icon={faRulerCombined} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Actualmente ningún calzado tiene asignada esta talla en stock.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
