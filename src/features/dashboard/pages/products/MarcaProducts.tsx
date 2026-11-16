import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
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
  faCircleCheck,
  faGlobe,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

import type { Estado } from "../../../../@types/Products";
import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

export interface MarcaItem {
  idMarca: number;
  nombre: string;
  paisOrigen?: string;
  descripcion: string;
  sitioWeb?: string;
  estado: Estado;
  fechaRegistro: string;
}

const CATEGORIAS_MAP: Record<number, string> = {
  1: "Deportivo",
  2: "Casual",
  3: "Urbano / Skate",
  4: "Formal",
  5: "Botas y Botines",
};

// Catálogo maestro de marcas iniciales de calzado
const INITIAL_MARCAS: MarcaItem[] = [
  {
    idMarca: 1,
    nombre: "Nike",
    paisOrigen: "Estados Unidos",
    descripcion: "Líder global en diseño y fabricación de calzado deportivo de rendimiento y zapatillas urbanas",
    sitioWeb: "nike.com",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idMarca: 2,
    nombre: "Adidas",
    paisOrigen: "Alemania",
    descripcion: "Marca icónica europea de calzado deportivo, tecnología de amortiguación Boost y moda lifestyle",
    sitioWeb: "adidas.com",
    estado: "Activo",
    fechaRegistro: "2026-01-10",
  },
  {
    idMarca: 3,
    nombre: "Vans",
    paisOrigen: "Estados Unidos",
    descripcion: "Especialistas en calzado para skateboarding, suelas waffle de caucho y cultura juvenil streetwear",
    sitioWeb: "vans.com",
    estado: "Activo",
    fechaRegistro: "2026-01-12",
  },
  {
    idMarca: 4,
    nombre: "Puma",
    paisOrigen: "Alemania",
    descripcion: "Fusión de velocidad atlética, calzado de fútbol, entrenamiento y colaboraciones de alta moda",
    sitioWeb: "puma.com",
    estado: "Activo",
    fechaRegistro: "2026-01-15",
  },
  {
    idMarca: 5,
    nombre: "Converse",
    paisOrigen: "Estados Unidos",
    descripcion: "Clásicos atemporales del calzado en lona con siluetas Chuck Taylor All Star y One Star",
    sitioWeb: "converse.com",
    estado: "Activo",
    fechaRegistro: "2026-01-18",
  },
  {
    idMarca: 6,
    nombre: "New Balance",
    paisOrigen: "Estados Unidos",
    descripcion: "Famosa por su comodidad ortopédica, zapatillas retro running y fabricación con estándares premium",
    sitioWeb: "newbalance.com",
    estado: "Activo",
    fechaRegistro: "2026-01-25",
  },
  {
    idMarca: 7,
    nombre: "Reebok",
    paisOrigen: "Reino Unido / EE. UU.",
    descripcion: "Pionera en calzado de fitness, entrenamiento cruzado y modelos clásicos de tenis como el Club C",
    sitioWeb: "reebok.com",
    estado: "Activo",
    fechaRegistro: "2026-02-01",
  },
  {
    idMarca: 8,
    nombre: "Jordan",
    paisOrigen: "Estados Unidos",
    descripcion: "Línea especializada de baloncesto de élite y zapatillas de colección para sneakerheads",
    sitioWeb: "nike.com/jordan",
    estado: "Activo",
    fechaRegistro: "2026-02-05",
  },
  {
    idMarca: 9,
    nombre: "Fila",
    paisOrigen: "Italia / Corea del Sur",
    descripcion: "Zapatillas voluminosas chunky y moda deportiva de inspiración vintage",
    sitioWeb: "fila.com",
    estado: "Inactivo",
    fechaRegistro: "2026-02-10",
  },
];

export default function MarcaProducts() {
  const [marcas, setMarcas] = useState<MarcaItem[]>(INITIAL_MARCAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterAsociados, setFilterAsociados] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<MarcaItem | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formPais, setFormPais] = useState("");
  const [formSitioWeb, setFormSitioWeb] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formEstado, setFormEstado] = useState<Estado>("Activo");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailMarca, setDetailMarca] = useState<MarcaItem | null>(null);

  // Obtener calzados asociados a la marca desde el mock global de productos
  const getShoesForMarca = (idMarca: number) => {
    return MOCK_PRODUCTOS_PRISMA.filter((p) => p.idMarca === idMarca);
  };

  // Calcular el stock total disponible en inventario para una marca
  const getTotalStockForMarca = (idMarca: number) => {
    let stock = 0;
    const shoes = getShoesForMarca(idMarca);
    shoes.forEach((p) => {
      p.colores.forEach((c) => {
        c.variantes.forEach((v) => {
          stock += v.stockActual;
        });
      });
    });
    return stock;
  };

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const total = marcas.length;
    const activas = marcas.filter((m) => m.estado === "Activo").length;
    const inactivas = total - activas;

    let totalModelosAsociados = 0;
    marcas.forEach((m) => {
      totalModelosAsociados += getShoesForMarca(m.idMarca).length;
    });

    return { total, activas, inactivas, totalModelosAsociados };
  }, [marcas]);

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

  // Filtrado y ordenamiento de marcas
  const filteredMarcas = useMemo(() => {
    return marcas
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          m.nombre.toLowerCase().includes(q) ||
          m.descripcion.toLowerCase().includes(q) ||
          m.paisOrigen?.toLowerCase().includes(q) ||
          m.idMarca.toString().includes(q);

        const matchesEstado = filterEstado === "all" || m.estado === filterEstado;

        const shoesCount = getShoesForMarca(m.idMarca).length;
        const matchesAsociados =
          filterAsociados === "all" ||
          (filterAsociados === "with_shoes" && shoesCount > 0) ||
          (filterAsociados === "without_shoes" && shoesCount === 0);

        return matchesQuery && matchesEstado && matchesAsociados;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "paisOrigen") {
          return (a.paisOrigen || "").localeCompare(b.paisOrigen || "") * factor;
        }
        if (sortConfig.key === "asociados") {
          const countA = getShoesForMarca(a.idMarca).length;
          const countB = getShoesForMarca(b.idMarca).length;
          return (countA - countB) * factor;
        }
        if (sortConfig.key === "stock") {
          const stockA = getTotalStockForMarca(a.idMarca);
          const stockB = getTotalStockForMarca(b.idMarca);
          return (stockA - stockB) * factor;
        }
        return 0;
      });
  }, [marcas, searchQuery, filterEstado, filterAsociados, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredMarcas.length / itemsPerPage) || 1;
  const paginatedMarcas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMarcas.slice(start, start + itemsPerPage);
  }, [filteredMarcas, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterEstado("all");
    setFilterAsociados("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Conmutar estado de la marca
  const handleToggleEstado = (marca: MarcaItem) => {
    const nextEstado: Estado = marca.estado === "Activo" ? "Inactivo" : "Activo";
    setMarcas((prev) =>
      prev.map((m) =>
        m.idMarca === marca.idMarca ? { ...m, estado: nextEstado } : m
      )
    );
    if (detailMarca && detailMarca.idMarca === marca.idMarca) {
      setDetailMarca({ ...detailMarca, estado: nextEstado });
    }
    Toast.fire({
      icon: "info",
      title: `Marca "${marca.nombre}": ahora está ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingMarca(null);
    setFormNombre("");
    setFormPais("Estados Unidos");
    setFormSitioWeb("");
    setFormDescripcion("");
    setFormEstado("Activo");
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (marca: MarcaItem) => {
    setEditingMarca(marca);
    setFormNombre(marca.nombre);
    setFormPais(marca.paisOrigen || "");
    setFormSitioWeb(marca.sitioWeb || "");
    setFormDescripcion(marca.descripcion);
    setFormEstado(marca.estado);
    setIsFormOpen(true);
  };

  // Abrir Detalle
  const openDetail = (marca: MarcaItem) => {
    setDetailMarca(marca);
    setIsDetailOpen(true);
  };

  // Guardar Marca (Crear o Editar)
  const handleSaveMarca = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre de la marca",
      });
      return;
    }

    if (editingMarca) {
      setMarcas((prev) =>
        prev.map((m) =>
          m.idMarca === editingMarca.idMarca
            ? {
                ...m,
                nombre: formNombre.trim(),
                paisOrigen: formPais.trim() || undefined,
                sitioWeb: formSitioWeb.trim() || undefined,
                descripcion: formDescripcion.trim() || m.descripcion,
                estado: formEstado,
              }
            : m
        )
      );
      Toast.fire({
        icon: "success",
        title: `Marca "${formNombre}" actualizada correctamente`,
      });
    } else {
      // Validar duplicado por nombre de marca
      const exists = marcas.some(
        (m) => m.nombre.toLowerCase() === formNombre.trim().toLowerCase()
      );
      if (exists) {
        Toast.fire({
          icon: "warning",
          title: `Ya existe la marca "${formNombre}" en el catálogo`,
        });
        return;
      }

      const newId =
        marcas.length > 0 ? Math.max(...marcas.map((m) => m.idMarca)) + 1 : 1;

      const newMarca: MarcaItem = {
        idMarca: newId,
        nombre: formNombre.trim(),
        paisOrigen: formPais.trim() || "Internacional",
        sitioWeb: formSitioWeb.trim() || undefined,
        descripcion:
          formDescripcion.trim() ||
          `Fabricante oficial de calzado ${formNombre.trim()}`,
        estado: formEstado,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };

      setMarcas((prev) => [newMarca, ...prev]);
      Toast.fire({
        icon: "success",
        title: `Marca "${formNombre}" registrada con éxito`,
      });
    }

    setIsFormOpen(false);
  };

  // Columnas para la tabla global Table (SIN botones de eliminación)
  const tableColumns: TableColumn<MarcaItem>[] = [
    {
      key: "nombre",
      header: "Marca / Fabricante",
      sortable: true,
      render: (marca) => (
        <div className="flex items-center gap-3.5 py-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky border border-brand-royal/20 dark:border-brand-sky/20">
            <FontAwesomeIcon icon={faAward} className="text-sm" />
          </span>
          <div className="min-w-0">
            <p
              onClick={() => openDetail(marca)}
              className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
              title={`Ver calzados de la marca ${marca.nombre}`}
            >
              {marca.nombre}
            </p>
            <p className="text-xs text-app-muted truncate max-w-sm">
              {marca.descripcion}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "paisOrigen",
      header: "País de Origen",
      sortable: true,
      render: (marca) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-semibold text-app-text border border-app-border">
          <FontAwesomeIcon icon={faGlobe} className="text-[11px] text-brand-royal dark:text-brand-sky" />
          {marca.paisOrigen || "Internacional"}
        </span>
      ),
    },
    {
      key: "asociados",
      header: "Modelos Asociados",
      sortable: true,
      align: "center",
      render: (marca) => {
        const shoes = getShoesForMarca(marca.idMarca);
        return (
          <button
            type="button"
            onClick={() => openDetail(marca)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
              shoes.length > 0
                ? "bg-brand-royal/10 text-brand-royal border-brand-royal/20 dark:bg-brand-sky/15 dark:text-brand-sky dark:border-brand-sky/20 hover:bg-brand-royal/20"
                : "bg-app-surface-alt text-app-muted border-app-border"
            }`}
            title="Ver calzados pertenecientes a esta marca"
          >
            <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            <span>
              {shoes.length} {shoes.length === 1 ? "modelo" : "modelos"}
            </span>
          </button>
        );
      },
    },
    {
      key: "stock",
      header: "Pares en Stock",
      sortable: true,
      align: "center",
      render: (marca) => {
        const stock = getTotalStockForMarca(marca.idMarca);
        return (
          <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-app-text">
            <FontAwesomeIcon icon={faBoxesStacked} className="text-app-muted text-xs" />
            <span>{stock} pares</span>
          </div>
        );
      },
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (marca) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(marca)}
          title={`Hacer clic para cambiar a ${marca.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            marca.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              marca.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {marca.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (marca) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(marca)}
            title="Ver detalles de la marca y modelos vinculados"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(marca)}
            title="Editar datos de la marca"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Acción de eliminación bloqueada intencionalmente */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border/40 text-app-muted/40 bg-app-surface-alt cursor-not-allowed"
            title="No se puede eliminar: la marca tiene modelos de calzado y existencias asociadas"
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
              <FontAwesomeIcon icon={faAward} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Marcas
              </h1>
              <p className="text-sm text-app-muted">
                Catálogo maestro de marcas de calzado (Nike, Adidas, Vans, Puma, Converse, etc.)
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
            Nueva Marca
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Marcas en Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faAward} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.total}
            </span>
            <span className="text-xs text-app-muted">marcas</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activas} activas para calzados
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Marcas Activas</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.activas}
            </span>
            <span className="text-xs text-app-muted">disponibles</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Listas para asignar productos
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Modelos Registrados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalModelosAsociados}
            </span>
            <span className="text-xs text-app-muted">zapatos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Modelos clasificados por marca</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Protección de Marcas</p>
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
            Marcas no eliminables
          </p>
        </div>
      </div>

      {/* Banner de protección contra eliminación */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-200/80 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200">
          <FontAwesomeIcon icon={faLock} />
        </span>
        <p>
          <strong>Integridad comercial:</strong> Las marcas no pueden eliminarse del sistema porque tienen modelos de calzado, existencias en almacén y compras históricas vinculadas. Si no deseas utilizar una marca, márcala en estado <strong>Inactivo</strong>.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              id="search-marcas"
              type="search"
              placeholder="Buscar marca por nombre, país o descripción (ej. Nike, Adidas)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Select
              id="filter-marca-estado"
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

            <Select
              id="filter-marca-asociados"
              value={filterAsociados}
              onChange={(e) => {
                setFilterAsociados(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Calzados: Todos" },
                { value: "with_shoes", label: "Con calzado asociado" },
                { value: "without_shoes", label: "Sin calzado asociado" },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="flex flex-wrap items-center justify-between text-xs text-app-muted pt-2 border-t border-app-border/60">
          <span>
            Mostrando <strong>{filteredMarcas.length}</strong> de{" "}
            <strong>{marcas.length}</strong> marcas registradas
          </span>
          {(searchQuery || filterEstado !== "all" || filterAsociados !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* Tabla Global de Marcas */}
      <Table<MarcaItem>
        columns={tableColumns}
        data={paginatedMarcas}
        rowKey="idMarca"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredMarcas.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron marcas"
        emptyDescription="Prueba modificando la búsqueda o los filtros de estado."
      />

      {/* MODAL CREAR / EDITAR MARCA */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMarca ? "Editar Marca de Calzado" : "Registrar Nueva Marca"}
        description="Ingresa los datos del fabricante o marca para clasificar los modelos de calzado"
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveMarca}>
              {editingMarca ? "Guardar Cambios" : "Crear Marca"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveMarca} className="space-y-4">
          <Input
            id="form-marca-nombre"
            label="Nombre de la Marca"
            placeholder="Ej. Nike, Adidas, Puma, Vans, New Balance"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
            helper="Nombre oficial que identificará los modelos de calzado"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-marca-pais"
              label="País de Origen / Sede"
              placeholder="Ej. Estados Unidos, Alemania, Japón"
              value={formPais}
              onChange={(e) => setFormPais(e.target.value)}
              helper="País matriz del fabricante"
            />

            <Select
              id="form-marca-estado"
              label="Estado Inicial"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible para zapatos)" },
                { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
              ]}
            />
          </div>

          <Input
            id="form-marca-sitio"
            label="Sitio Web Oficial (Opcional)"
            placeholder="Ej. nike.com, adidas.co"
            value={formSitioWeb}
            onChange={(e) => setFormSitioWeb(e.target.value)}
          />

          <Input
            id="form-marca-descripcion"
            label="Descripción / Reseña de la Marca"
            placeholder="Ej. Fabricante internacional de calzado deportivo de alta gama"
            value={formDescripcion}
            onChange={(e) => setFormDescripcion(e.target.value)}
            helper="Breve reseña o enfoque comercial de la marca"
          />

          <div className="rounded-xl border border-app-border bg-app-surface-alt p-3 text-xs text-app-muted flex items-start gap-2.5">
            <FontAwesomeIcon icon={faLock} className="text-xs text-brand-royal dark:text-brand-sky mt-0.5" />
            <span>
              <strong>Integridad comercial:</strong> Esta marca quedará asociada a los modelos de calzado y no podrá ser eliminada para garantizar la trazabilidad de inventario y pedidos.
            </span>
          </div>
        </form>
      </Modal>

      {/* MODAL DETALLE DE MARCA Y CALZADOS ASOCIADOS */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailMarca?.nombre || "Detalle de Marca"}
        description={`ID #${detailMarca?.idMarca} · Fabricante de calzado`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailMarca?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailMarca && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailMarca);
                  }}
                >
                  Editar Marca
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailMarca && (
          <div className="space-y-6">
            {/* Banner de información de la marca */}
            <div className="rounded-2xl border border-app-border bg-app-surface-alt p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal text-white dark:bg-brand-sky dark:text-slate-900 shadow-sm text-lg">
                  <FontAwesomeIcon icon={faAward} />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-app-text">{detailMarca.nombre}</h3>
                  <div className="flex items-center gap-2 text-xs text-app-muted mt-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
                      {detailMarca.paisOrigen || "Internacional"}
                    </span>
                    {detailMarca.sitioWeb && (
                      <>
                        <span>•</span>
                        <span className="text-brand-royal dark:text-brand-sky font-mono">
                          {detailMarca.sitioWeb}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleEstado(detailMarca)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer self-start sm:self-center ${
                  detailMarca.estado === "Activo"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                }`}
              >
                <FontAwesomeIcon
                  icon={detailMarca.estado === "Activo" ? faToggleOn : faToggleOff}
                  className="text-xs"
                />
                <span>Estado: {detailMarca.estado}</span>
              </button>
            </div>

            {/* Descripción */}
            <div className="rounded-xl border border-app-border bg-app-surface p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-app-muted block">Reseña de la Marca</span>
              <p className="text-xs font-medium text-app-text">
                {detailMarca.descripcion}
              </p>
            </div>

            {/* Métricas de inventario de la marca */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Modelos de Calzado Asociados
                </span>
                <span className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-1 block">
                  {getShoesForMarca(detailMarca.idMarca).length}
                </span>
              </div>

              <div className="rounded-xl border border-app-border bg-app-surface p-3.5 text-center">
                <span className="text-[11px] font-semibold text-app-muted uppercase tracking-wider block">
                  Pares Físicos en Almacén
                </span>
                <span className="text-2xl font-black text-app-text mt-1 block">
                  {getTotalStockForMarca(detailMarca.idMarca)} pares
                </span>
              </div>
            </div>

            {/* Listado de Calzados de esta marca */}
            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faShoePrints} className="text-brand-royal dark:text-brand-sky" />
                  Calzados de la Marca {detailMarca.nombre} ({getShoesForMarca(detailMarca.idMarca).length})
                </h4>
                <span className="text-xs text-app-muted font-semibold">
                  Catálogo Oficial
                </span>
              </div>

              {getShoesForMarca(detailMarca.idMarca).length > 0 ? (
                <div className="divide-y divide-app-border rounded-xl border border-app-border bg-app-surface overflow-hidden">
                  {getShoesForMarca(detailMarca.idMarca).map((prod) => {
                    const firstColor = prod.colores?.[0];
                    const prodImg =
                      firstColor?.imagenes?.[0] ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

                    const prodStock = prod.colores.reduce(
                      (acc, c) => acc + c.variantes.reduce((s, v) => s + v.stockActual, 0),
                      0
                    );

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
                            <span className="text-[11px] text-app-muted font-mono">
                              {prod.sku} · {CATEGORIAS_MAP[prod.idCategoriaProducto] || "Calzado"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-app-text block">
                            ${prod.precioVenta.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-app-muted">
                            {prodStock} pares disponibles
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border p-6 text-center text-app-muted">
                  <FontAwesomeIcon icon={faAward} className="text-2xl mb-2 text-app-muted/50" />
                  <p className="text-xs">
                    Actualmente no hay modelos de calzado registrados bajo esta marca.
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
