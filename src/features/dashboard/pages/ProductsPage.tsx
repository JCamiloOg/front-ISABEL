import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faShoePrints,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faTrashCan,
  faLayerGroup,
  faDollarSign,
  faToggleOn,
  faToggleOff,
  faWarehouse,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

import { MOCK_PRODUCTOS_PRISMA } from "../../../data/products";
import type { ProductoConRelaciones, Genero, Estado } from "../../../@types/Products";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Select } from "../../../shared/components/Inputs/Select";
import Modal from "../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Toast, MySwal } from "../../../shared/utils/alerts";

// Mapeos de catálogo
const CATEGORIAS_MAP: Record<number, string> = {
  1: "Deportivo",
  2: "Casual",
  3: "Urbano / Skate",
  4: "Formal",
};

const MARCAS_MAP: Record<number, string> = {
  1: "Nike",
  2: "Adidas",
  3: "Vans",
  4: "Puma",
  5: "Converse",
};

export default function ProductsPage() {
  // Estado local de productos
  const [productos, setProductos] = useState<ProductoConRelaciones[]>(MOCK_PRODUCTOS_PRISMA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenero, setSelectedGenero] = useState<string>("all");
  const [selectedEstado, setSelectedEstado] = useState<string>("all");
  const [selectedMarca, setSelectedMarca] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "nombre",
    direction: "asc",
  });

  // Modal Detalle
  const [detailProduct, setDetailProduct] = useState<ProductoConRelaciones | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductoConRelaciones | null>(null);

  // Estados del formulario
  const [formNombre, setFormNombre] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formMarca, setFormMarca] = useState<number>(1);
  const [formCategoria, setFormCategoria] = useState<number>(1);
  const [formPrecioCompra, setFormPrecioCompra] = useState<number>(50);
  const [formPrecioVenta, setFormPrecioVenta] = useState<number>(99);
  const [formGenero, setFormGenero] = useState<Genero>("Unisex");
  const [formPublico, setFormPublico] = useState<boolean>(true);
  const [formEstado, setFormEstado] = useState<Estado>("Activo");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Métricas ejecutivas
  const metrics = useMemo(() => {
    const totalCount = productos.length;
    const activeCount = productos.filter((p) => p.estado === "Activo").length;
    let totalStock = 0;
    let totalValuation = 0;

    productos.forEach((p) => {
      p.colores.forEach((c) => {
        c.variantes.forEach((v) => {
          totalStock += v.stockActual;
          totalValuation += v.stockActual * p.precioVenta;
        });
      });
    });

    return { totalCount, activeCount, totalStock, totalValuation };
  }, [productos]);

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

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    return productos
      .filter((p) => {
        const matchesQuery =
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          MARCAS_MAP[p.idMarca]?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenero = selectedGenero === "all" || p.genero === selectedGenero;
        const matchesEstado = selectedEstado === "all" || p.estado === selectedEstado;
        const matchesMarca = selectedMarca === "all" || p.idMarca.toString() === selectedMarca;

        return matchesQuery && matchesGenero && matchesEstado && matchesMarca;
      })
      .sort((a, b) => {
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "nombre") {
          return a.nombre.localeCompare(b.nombre) * factor;
        }
        if (sortConfig.key === "sku") {
          return a.sku.localeCompare(b.sku) * factor;
        }
        if (sortConfig.key === "precioVenta") {
          return (a.precioVenta - b.precioVenta) * factor;
        }
        if (sortConfig.key === "stock") {
          const stockA = a.colores.reduce((acc, c) => acc + c.variantes.reduce((s, v) => s + v.stockActual, 0), 0);
          const stockB = b.colores.reduce((acc, c) => acc + c.variantes.reduce((s, v) => s + v.stockActual, 0), 0);
          return (stockA - stockB) * factor;
        }
        return 0;
      });
  }, [productos, searchQuery, selectedGenero, selectedEstado, selectedMarca, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenero("all");
    setSelectedEstado("all");
    setSelectedMarca("all");
    setSortConfig({ key: "nombre", direction: "asc" });
    setCurrentPage(1);
  };

  // Abrir Detalle
  const openDetail = (prod: ProductoConRelaciones) => {
    setDetailProduct(prod);
    setSelectedColorIndex(0);
    setIsDetailOpen(true);
  };

  // Abrir Modal de Creación / Edición
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormNombre("");
    setFormSku(`IS-${Math.floor(100 + Math.random() * 900)}`);
    setFormMarca(1);
    setFormCategoria(1);
    setFormPrecioCompra(45);
    setFormPrecioVenta(89.99);
    setFormGenero("Unisex");
    setFormPublico(true);
    setFormEstado("Activo");
    setFormImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80");
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (prod: ProductoConRelaciones) => {
    setEditingProduct(prod);
    setFormNombre(prod.nombre);
    setFormSku(prod.sku);
    setFormMarca(prod.idMarca);
    setFormCategoria(prod.idCategoriaProducto);
    setFormPrecioCompra(prod.precioCompra);
    setFormPrecioVenta(prod.precioVenta);
    setFormGenero(prod.genero);
    setFormPublico(prod.publico);
    setFormEstado(prod.estado);
    const existingImg = prod.colores?.[0]?.imagenes?.[0] || "";
    setFormImageUrl(existingImg);
    setIsFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formSku.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Completa el nombre y SKU del calzado",
      });
      return;
    }

    if (editingProduct) {
      setProductos((prev) =>
        prev.map((item) => {
          if (item.idProducto === editingProduct.idProducto) {
            const updatedColores = [...item.colores];
            if (updatedColores.length > 0 && formImageUrl) {
              updatedColores[0] = {
                ...updatedColores[0],
                imagenes: [formImageUrl, ...(updatedColores[0].imagenes.slice(1) || [])],
              };
            }
            return {
              ...item,
              nombre: formNombre,
              sku: formSku,
              idMarca: Number(formMarca),
              idCategoriaProducto: Number(formCategoria),
              precioCompra: Number(formPrecioCompra),
              precioVenta: Number(formPrecioVenta),
              genero: formGenero,
              publico: formPublico,
              estado: formEstado,
              colores: updatedColores,
            };
          }
          return item;
        })
      );
      Toast.fire({ icon: "success", title: "Zapato actualizado correctamente" });
    } else {
      const newId = productos.length > 0 ? Math.max(...productos.map((p) => p.idProducto)) + 1 : 1;
      const newShoe: ProductoConRelaciones = {
        idProducto: newId,
        nombre: formNombre,
        sku: formSku,
        idMarca: Number(formMarca),
        idCategoriaProducto: Number(formCategoria),
        idTipoZapato: 1,
        precioCompra: Number(formPrecioCompra),
        precioVenta: Number(formPrecioVenta),
        publico: formPublico,
        genero: formGenero,
        estado: formEstado,
        colores: [
          {
            idProductoColor: Number(`${newId}01`),
            idProducto: newId,
            idColor: 101,
            imagenes: [formImageUrl || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"],
            estado: "Activo",
            variantes: [
              {
                idVariante: Number(`${newId}0101`),
                idProductoColor: Number(`${newId}01`),
                idTalla: 1,
                stockActual: 10,
                descuento: 0,
                estado: "Activo",
                talla: { idTalla: 1, numeroTalla: "40", genero: formGenero, tallaInternacional: "US 8" },
              },
              {
                idVariante: Number(`${newId}0102`),
                idProductoColor: Number(`${newId}01`),
                idTalla: 2,
                stockActual: 12,
                descuento: 0,
                estado: "Activo",
                talla: { idTalla: 2, numeroTalla: "41", genero: formGenero, tallaInternacional: "US 8.5" },
              },
            ],
          },
        ],
      };
      setProductos((prev) => [newShoe, ...prev]);
      Toast.fire({ icon: "success", title: "Nuevo calzado registrado con éxito" });
    }

    setIsFormOpen(false);
  };

  const handleToggleEstado = (prod: ProductoConRelaciones) => {
    const nextEstado: Estado = prod.estado === "Activo" ? "Inactivo" : "Activo";
    setProductos((prev) =>
      prev.map((p) => (p.idProducto === prod.idProducto ? { ...p, estado: nextEstado } : p))
    );
    Toast.fire({
      icon: "info",
      title: `${prod.nombre}: ahora está ${nextEstado}`,
    });
  };

  const handleDeleteProduct = (prod: ProductoConRelaciones) => {
    MySwal.fire({
      title: "¿Eliminar calzado?",
      text: `¿Seguro que deseas remover permanentemente "${prod.nombre}" del catálogo?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setProductos((prev) => prev.filter((p) => p.idProducto !== prod.idProducto));
        Toast.fire({
          icon: "success",
          title: "Calzado eliminado del catálogo",
        });
      }
    });
  };

  // Definición de columnas para el componente global Table
  const tableColumns: TableColumn<ProductoConRelaciones>[] = [
    {
      key: "producto",
      header: "Calzado / Modelo",
      sortable: false,
      render: (prod) => {
        const image =
          prod.colores?.[0]?.imagenes?.[0] ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-app-border bg-app-surface-alt">
              <img
                src={image}
                alt={prod.nombre}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>
            <div className="min-w-0">
              <p
                onClick={() => openDetail(prod)}
                className="font-bold text-app-text hover:text-brand-royal dark:hover:text-brand-sky transition-colors cursor-pointer truncate"
                title={prod.nombre}
              >
                {prod.nombre}
              </p>
              <div className="flex items-center gap-2 text-xs text-app-muted">
                <span className="font-mono">{prod.sku}</span>
                <span>•</span>
                <span>{CATEGORIAS_MAP[prod.idCategoriaProducto] || "Calzado"}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "marca",
      header: "Marca",
      render: (prod) => (
        <span className="inline-flex items-center rounded-lg bg-app-surface-alt px-2.5 py-1 text-xs font-semibold text-app-text border border-app-border">
          {MARCAS_MAP[prod.idMarca] || "Genérico"}
        </span>
      ),
    },
    {
      key: "genero",
      header: "Género",
      render: (prod) => (
        <span className="text-xs font-medium text-app-muted">
          {prod.genero}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock Disponible",
      sortable: true,
      align: "center",
      render: (prod) => {
        const totalStockProd = prod.colores.reduce(
          (accColor, c) =>
            accColor + c.variantes.reduce((accVar, v) => accVar + v.stockActual, 0),
          0
        );

        const isLow = totalStockProd < 10;
        return (
          <div className="flex flex-col items-center">
            <span
              className={`font-extrabold text-sm ${
                isLow ? "text-rose-600 dark:text-rose-400" : "text-app-text"
              }`}
            >
              {totalStockProd} pares
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] text-app-muted">
                {prod.colores.length} {prod.colores.length === 1 ? "color" : "colores"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "precioVenta",
      header: "Precio (PVP)",
      sortable: true,
      align: "right",
      render: (prod) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-sm text-app-text">
            ${prod.precioVenta.toFixed(2)}
          </span>
          <span className="text-[11px] text-app-muted">
            Costo: ${prod.precioCompra.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (prod) => (
        <button
          type="button"
          onClick={() => handleToggleEstado(prod)}
          title={`Hacer clic para cambiar a ${prod.estado === "Activo" ? "Inactivo" : "Activo"}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${
            prod.estado === "Activo"
              ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              prod.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {prod.estado}
        </button>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      headerClassName: "pr-6",
      cellClassName: "pr-6",
      render: (prod) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openDetail(prod)}
            title="Ver detalles completos del calzado"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEditModal(prod)}
            title="Editar producto"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-brand-royal hover:text-brand-royal dark:hover:border-brand-sky dark:hover:text-brand-sky hover:bg-brand-royal/5 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          <button
            type="button"
            onClick={() => handleDeleteProduct(prod)}
            title="Eliminar del catálogo"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-app-border text-app-muted hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:border-rose-800 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          </button>
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
              <FontAwesomeIcon icon={faShoePrints} className="text-lg" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                Gestión de Productos
              </h1>
              <p className="text-sm text-app-muted">
                Control tabular de inventario de calzado, precios, tallas y existencias
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
            Nuevo Zapato
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Modelos Registrados</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-royal dark:bg-brand-royal/20 dark:text-brand-sky">
              <FontAwesomeIcon icon={faShoePrints} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalCount}
            </span>
            <span className="text-xs text-app-muted">modelos</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">
            {metrics.activeCount} activos para venta
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Pares en Stock</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faWarehouse} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              {metrics.totalStock}
            </span>
            <span className="text-xs text-app-muted">pares físicos</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Disponibilidad en almacén
          </p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Valor Inventario (Venta)</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-app-text">
              ${metrics.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Estimado a PVP actual</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-xs transition-all hover:border-brand-sky/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-app-muted">Gestión de Catálogo</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky">
              <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-brand-royal dark:text-brand-sky">
              100%
            </span>
            <span className="text-xs text-app-muted">sincronizado</span>
          </div>
          <p className="mt-1 text-xs text-app-muted">Calzado Isabel ERP</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <Input
              id="search-products"
              type="search"
              placeholder="Buscar por modelo, SKU o marca..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />}
              className="bg-app-surface-alt"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Select
              id="filter-genero"
              value={selectedGenero}
              onChange={(e) => {
                setSelectedGenero(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Género: Todos" },
                { value: "Hombre", label: "Hombre" },
                { value: "Mujer", label: "Mujer" },
                { value: "Unisex", label: "Unisex" },
                { value: "Niño", label: "Niño" },
                { value: "Niña", label: "Niña" },
              ]}
              size="sm"
            />

            <Select
              id="filter-marca"
              value={selectedMarca}
              onChange={(e) => {
                setSelectedMarca(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "Marca: Todas" },
                { value: "1", label: "Nike" },
                { value: "2", label: "Adidas" },
                { value: "3", label: "Vans" },
                { value: "4", label: "Puma" },
                { value: "5", label: "Converse" },
              ]}
              size="sm"
            />

            <Select
              id="filter-estado"
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
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
            Mostrando <strong>{filteredProducts.length}</strong> de{" "}
            <strong>{productos.length}</strong> productos
          </span>
          {(searchQuery || selectedGenero !== "all" || selectedEstado !== "all" || selectedMarca !== "all") && (
            <button
              onClick={handleResetFilters}
              className="font-semibold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer"
            >
              Limpiar filtros aplicados
            </button>
          )}
        </div>
      </div>

      {/* COMPONENTE GLOBAL TABLE DE PRODUCTOS */}
      <Table<ProductoConRelaciones>
        columns={tableColumns}
        data={paginatedProducts}
        rowKey="idProducto"
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredProducts.length,
          itemsPerPage,
          onPageChange: (newPage) => setCurrentPage(newPage),
          onItemsPerPageChange: (newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 8, 15, 25],
        }}
        emptyTitle="No se encontraron productos"
        emptyDescription="Prueba ajustando los filtros de búsqueda, marca o género."
      />

      {/* MODAL DETALLE COMPLETO (Variantes de Color, Tallas y Descuentos) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailProduct?.nombre || "Detalle de Producto"}
        description={`SKU: ${detailProduct?.sku || ""} · ${MARCAS_MAP[detailProduct?.idMarca || 1] || "Calzado"}`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado: <strong className="text-app-text">{detailProduct?.estado}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>
                Cerrar
              </Button>
              {detailProduct && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleOpenEditModal(detailProduct);
                  }}
                >
                  Editar Producto
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailProduct && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="overflow-hidden rounded-2xl border border-app-border bg-slate-100 dark:bg-slate-900/60 aspect-4/3 relative">
                <img
                  src={
                    detailProduct.colores[selectedColorIndex]?.imagenes[0] ||
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={detailProduct.nombre}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-xs font-semibold text-brand-royal dark:text-brand-sky uppercase tracking-wider">
                    {MARCAS_MAP[detailProduct.idMarca]} · {detailProduct.genero}
                  </span>
                  <h4 className="text-xl font-extrabold text-app-text">{detailProduct.nombre}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-app-border bg-app-surface-alt p-3">
                    <span className="text-[11px] font-semibold text-app-muted block">Precio Venta</span>
                    <span className="text-lg font-black text-app-text">${detailProduct.precioVenta.toFixed(2)}</span>
                  </div>

                  <div className="rounded-xl border border-app-border bg-app-surface-alt p-3">
                    <span className="text-[11px] font-semibold text-app-muted block">Costo de Compra</span>
                    <span className="text-lg font-bold text-app-muted">${detailProduct.precioCompra.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-app-muted space-y-1 pt-1">
                  <p>
                    <strong>Visibilidad catálogo:</strong> {detailProduct.publico ? "Público en tienda" : "Solo ERP interno"}
                  </p>
                  <p>
                    <strong>Tipo de calzado:</strong> {CATEGORIAS_MAP[detailProduct.idCategoriaProducto]}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-app-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-app-text uppercase tracking-wider">
                  Variantes por Color ({detailProduct.colores.length})
                </label>
                <span className="text-xs text-app-muted">
                  Color #{detailProduct.colores[selectedColorIndex]?.idColor}
                </span>
              </div>

              <div className="flex gap-2">
                {detailProduct.colores.map((color, idx) => (
                  <button
                    key={color.idProductoColor}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer border ${
                      selectedColorIndex === idx
                        ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky"
                        : "border-app-border bg-app-surface text-app-muted hover:border-brand-royal/30"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white"
                      style={{
                        backgroundColor:
                          color.idColor === 101 ? "#1e293b" : color.idColor === 102 ? "#cbd5e1" : "#2563eb",
                      }}
                    />
                    Color {idx + 1} ({color.variantes.length} tallas)
                  </button>
                ))}
              </div>

              {/* Detalle interno de tallas */}
              <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface mt-3">
                <div className="p-3 bg-app-surface-alt border-b border-app-border flex items-center justify-between text-xs font-bold text-app-muted">
                  <span>TALLA DISPONIBLE</span>
                  <span>STOCK ACTUAL</span>
                  <span>DESCUENTO</span>
                  <span>ESTADO</span>
                </div>

                <div className="divide-y divide-app-border text-xs">
                  {detailProduct.colores[selectedColorIndex]?.variantes.map((v) => (
                    <div key={v.idVariante} className="p-3 flex items-center justify-between hover:bg-app-surface-alt/50">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-8 items-center justify-center rounded bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-bold">
                          {v.talla.numeroTalla}
                        </span>
                        <span className="text-app-muted">({v.talla.tallaInternacional})</span>
                      </div>

                      <div className="font-semibold text-app-text">
                        <span className={v.stockActual < 5 ? "text-rose-500 font-bold" : ""}>
                          {v.stockActual} pares
                        </span>
                      </div>

                      <div className="text-app-muted">
                        {v.descuento > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{v.descuento}%</span>
                        ) : (
                          "0%"
                        )}
                      </div>

                      <div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            v.estado === "Activo"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {v.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL CREAR / EDITAR CALZADO */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? "Editar Calzado" : "Registrar Nuevo Calzado"}
        description="Ingresa los datos comerciales, modelo y características del zapato"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProduct}>
              {editingProduct ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-nombre"
              label="Nombre del Producto / Modelo"
              placeholder="Ej. Air Jordan Retro 1"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              required
            />

            <Input
              id="form-sku"
              label="Código SKU"
              placeholder="Ej. NK-AJ1-001"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="form-marca"
              label="Marca"
              value={formMarca}
              onChange={(e) => setFormMarca(Number(e.target.value))}
              options={[
                { value: 1, label: "Nike" },
                { value: 2, label: "Adidas" },
                { value: 3, label: "Vans" },
                { value: 4, label: "Puma" },
                { value: 5, label: "Converse" },
              ]}
            />

            <Select
              id="form-categoria"
              label="Categoría"
              value={formCategoria}
              onChange={(e) => setFormCategoria(Number(e.target.value))}
              options={[
                { value: 1, label: "Deportivo" },
                { value: 2, label: "Casual" },
                { value: 3, label: "Urbano / Skate" },
                { value: 4, label: "Formal" },
              ]}
            />

            <Select
              id="form-genero"
              label="Género Destino"
              value={formGenero}
              onChange={(e) => setFormGenero(e.target.value as Genero)}
              options={[
                { value: "Unisex", label: "Unisex" },
                { value: "Hombre", label: "Hombre" },
                { value: "Mujer", label: "Mujer" },
                { value: "Niño", label: "Niño" },
                { value: "Niña", label: "Niña" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="form-precio-compra"
              type="number"
              step="0.01"
              label="Costo de Compra ($ USD)"
              placeholder="0.00"
              value={formPrecioCompra}
              onChange={(e) => setFormPrecioCompra(Number(e.target.value))}
              iconLeft={<FontAwesomeIcon icon={faDollarSign} className="text-app-muted text-xs" />}
            />

            <Input
              id="form-precio-venta"
              type="number"
              step="0.01"
              label="Precio de Venta al Público ($ USD)"
              placeholder="0.00"
              value={formPrecioVenta}
              onChange={(e) => setFormPrecioVenta(Number(e.target.value))}
              iconLeft={<FontAwesomeIcon icon={faDollarSign} className="text-app-muted text-xs" />}
            />
          </div>

          <Input
            id="form-image-url"
            label="URL de Imagen Principal"
            placeholder="https://images.unsplash.com/photo-..."
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            iconLeft={<FontAwesomeIcon icon={faImage} className="text-app-muted text-xs" />}
            helper="Puedes usar enlaces de Unsplash o rutas locales para previsualización"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <Select
              id="form-estado"
              label="Estado Inicial"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible)" },
                { value: "Inactivo", label: "Inactivo (Oculto)" },
              ]}
            />

            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-app-text mb-2">Visibilidad en Tienda Online</label>
              <button
                type="button"
                onClick={() => setFormPublico((prev) => !prev)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                  formPublico
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-app-border bg-app-surface text-app-muted"
                }`}
              >
                <span>{formPublico ? "Visible para clientes (Público)" : "Privado (Solo personal)"}</span>
                <FontAwesomeIcon icon={formPublico ? faToggleOn : faToggleOff} className="text-base" />
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
