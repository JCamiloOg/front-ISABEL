import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBan,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faPalette,
  faPenToSquare,
  faPlus,
  faShoePrints,
  faTrash,
  faWarehouse,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "../../../../shared/components/Button";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { Switcher } from "../../components/Switcher";
import ProductCreateModal from "./product/components/ProductCreateModal";
import ProductUpdateModal from "./product/components/ProductUpdateModal";
import {
  createProduct,
  deleteProduct,
  getProductBrands,
  getProductById,
  getProductCategories,
  getProductColors,
  getProducts,
  getProductShoeTypes,
  getProductSizes,
  updateProduct,
  updateProductStatus,
  type BrandRecord,
  type CategoryRecord,
  type ColorRecord,
  type CreateProductDTO,
  type ProductDetailRecord,
  type ProductRecord,
  type ShoeTypeRecord,
  type SizeRecord,
  type UpdateProductDTO,
} from "./product/services/ProductServices";

const FALLBACK_SHOE_IMAGES: Record<string, string> = {
  "NK-AF1-001":
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
  "AD-UBL-002":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
  "PM-SDC-003":
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80",
  "NB-574-004":
    "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=400&q=80",
  "CV-CTA-005":
    "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=400&q=80",
};

function ProductThumbnail({
  src,
  sku,
  alt,
  sizeClass = "h-11 w-11 rounded-xl",
}: {
  src?: string | null;
  sku?: string | null;
  alt: string;
  sizeClass?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const validSrc =
    !hasError && src && !src.includes("example.com")
      ? src
      : (sku && FALLBACK_SHOE_IMAGES[sku]) || "/shoesGreenSplash.jpg";

  return (
    <img
      src={validSrc}
      alt={alt}
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={`${sizeClass} shrink-0 object-cover border border-app-border bg-app-surface-alt shadow-2xs`}
    />
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [shoeTypes, setShoeTypes] = useState<ShoeTypeRecord[]>([]);
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [sizes, setSizes] = useState<SizeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal de creación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<ProductRecord | null>(null);
  const [productDetailToEdit, setProductDetailToEdit] = useState<ProductDetailRecord | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetailRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Filtros, búsqueda, ordenación y paginación
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const formatCurrency = (amount: number | string | undefined | null) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ── Petición GET: Obtener Productos y Catálogos Auxiliares ──
  const loadInitialData = useCallback(async () => {
    const [productsRes, categoriesRes, brandsRes, typesRes, colorsRes, sizesRes] =
      await Promise.all([
        getProducts(),
        getProductCategories(),
        getProductBrands(),
        getProductShoeTypes(),
        getProductColors(),
        getProductSizes(),
      ]);

    return {
      products: productsRes.status === 200 ? productsRes.data.products || [] : [],
      categories: categoriesRes.status === 200 ? categoriesRes.data.categories || [] : [],
      brands: brandsRes.status === 200 ? brandsRes.data.brands || [] : [],
      shoeTypes: typesRes.status === 200 ? typesRes.data.shoeTypes || [] : [],
      colors: colorsRes.status === 200 ? colorsRes.data.colors || [] : [],
      sizes: sizesRes.status === 200 ? sizesRes.data.sizes || [] : [],
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadInitialData();
      setProducts(data.products);
      setCategories(data.categories);
      setBrands(data.brands);
      setShoeTypes(data.shoeTypes);
      setColors(data.colors);
      setSizes(data.sizes);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los productos.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadInitialData]);

  useEffect(() => {
    let active = true;
    loadInitialData()
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setCategories(data.categories);
        setBrands(data.brands);
        setShoeTypes(data.shoeTypes);
        setColors(data.colors);
        setSizes(data.sizes);
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener los productos.",
            text: "Por favor, intenta nuevamente",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadInitialData]);

  // ── Petición GET: Detalle de Producto por ID ──
  const selectedProductTotalStock = useMemo(() => {
    if (!selectedProduct?.productColors) return 0;
    return selectedProduct.productColors.reduce((colorAcc, pc) => {
      const variantsStock = (pc.productVariants || []).reduce(
        (varAcc, v) => varAcc + (Number(v.currentStock) || 0),
        0
      );
      return colorAcc + variantsStock;
    }, 0);
  }, [selectedProduct]);

  const handleViewDetail = async (productItem: ProductRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedProduct(null);

    try {
      const response = await getProductById(productItem.id);
      if (response.status === 200) {
        setSelectedProduct(response.data.product || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del producto.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  // ── Petición POST: Crear Producto ──
  const handleCreateProduct = async (data: CreateProductDTO, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createProduct(data);

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Calzado registrado exitosamente",
        });
        await fetchProducts();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear producto",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Actualizar Producto ──
  const handleOpenEditModal = async (productItem: ProductRecord) => {
    setProductToEdit(productItem);
    setProductDetailToEdit(null);
    setIsUpdateModalOpen(true);
    setIsLoadingEdit(true);

    try {
      const response = await getProductById(productItem.id);
      if (response.status === 200) {
        setProductDetailToEdit(response.data.product || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al cargar las variantes del producto.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setProductToEdit(null);
    setProductDetailToEdit(null);
  };

  const handleUpdateProduct = async (
    id: number,
    data: UpdateProductDTO,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateProduct(id, data);

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Calzado actualizado exitosamente",
        });
        await fetchProducts();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar producto",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición PATCH: Cambiar Estado del Producto ──
  const handleToggleStatus = async (productItem: ProductRecord, nextChecked: boolean) => {
    const actionText = nextChecked ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿${nextChecked ? "Activar" : "Desactivar"} producto?`,
      html: `¿Estás seguro de que deseas ${actionText} el calzado <b>"${productItem.name}"</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await updateProductStatus(productItem.id, nextChecked);

        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: nextChecked ? "Producto activado" : "Producto desactivado",
            text:
              res.data.message ||
              `El producto ahora está ${nextChecked ? "activo" : "inactivo"}.`,
          });
          await fetchProducts();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: `Error al ${actionText} producto`,
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  // ── Petición DELETE: Eliminar Producto ──
  const handleDeleteProduct = async (productItem: ProductRecord) => {
    const result = await MySwal.fire({
      title: "¿Eliminar producto?",
      html: `¿Estás seguro de que deseas eliminar permanentemente el calzado <b>"${productItem.name}"</b> (#${productItem.id})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteProduct(productItem.id);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Producto eliminado",
            text: res.data.message || "El calzado fue eliminado exitosamente.",
          });
          await fetchProducts();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar producto",
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setBrandFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (categoryFilter !== "all" && String(item.productCategoryId) !== categoryFilter) {
        return false;
      }
      if (brandFilter !== "all" && String(item.brandId) !== brandFilter) {
        return false;
      }
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;

      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        return (
          String(item.id).includes(q) ||
          item.name.toLowerCase().includes(q) ||
          (item.sku || "").toLowerCase().includes(q) ||
          (item.brand?.name || "").toLowerCase().includes(q) ||
          (item.productCategory?.name || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [products, categoryFilter, brandFilter, statusFilter, searchTerm]);

  // Ordenación
  const sortedProducts = useMemo(() => {
    if (!sortKey || !sortDir) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") {
        cmp = a.id - b.id;
      } else if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "salePrice") {
        cmp = (Number(a.salePrice) || 0) - (Number(b.salePrice) || 0);
      } else if (sortKey === "status") {
        cmp = a.status === b.status ? 0 : a.status ? 1 : -1;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredProducts, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedProducts = useMemo(
    () => sortedProducts.slice(startIndex, startIndex + itemsPerPage),
    [sortedProducts, startIndex, itemsPerPage]
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "all" ||
    brandFilter !== "all" ||
    statusFilter !== "all";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-app-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faShoePrints} />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Gestión de Productos
            </h1>
            <p className="text-sm text-app-muted">
              Catálogo maestro de calzado, variantes de color, tallas e inventario físico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchProducts}
            disabled={isLoading}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={faPlus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* ─── Tabla Principal (compacta y sin scroll horizontal) ─── */}
      <Table>
        <Table.Header
          title="Catálogo de Productos"
          description="Listado maestro de modelos de calzado con precios, visibilidad y estado"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                id="filter-product-category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Categoría: Todas" },
                  ...categories.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
                size="sm"
              />

              <Select
                id="filter-product-brand"
                value={brandFilter}
                onChange={(e) => {
                  setBrandFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Marca: Todas" },
                  ...brands.map((b) => ({ value: String(b.id), label: b.name })),
                ]}
                size="sm"
              />

              <Select
                id="filter-product-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "Estado: Todos" },
                  { value: "active", label: "Activos" },
                  { value: "inactive", label: "Inactivos" },
                ]}
                size="sm"
              />
            </div>
          }
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar producto por ID, nombre, SKU, marca o categoría..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredProducts.length} de {products.length} productos encontrados
            </span>
            <Button
              size="sm"
              variant="ghost"
              icon={faArrowRotateRight}
              onClick={handleResetFilters}
            >
              Restablecer filtros
            </Button>
          </div>
        )}

        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Producto
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Clasificación
              </th>
              <Table.SortableCell
                sortKey="salePrice"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-right"
              >
                Precios
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider">
                Tienda
              </th>
              <Table.SortableCell
                sortKey="status"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Estado
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-center text-app-muted text-xs uppercase tracking-wider">
                Acciones
              </th>
            </Table.Row>
          </Table.Thead>

          <Table.Tbody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, rIdx) => (
                <Table.Row key={`loading-${rIdx}`}>
                  <Table.Cell rounded="left" colSpan={6} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedProducts.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron productos con los filtros seleccionados."
                    : "No hay productos registrados en el inventario."
                }
              />
            ) : (
              paginatedProducts.map((row) => (
                <Table.Row key={row.id} onClick={() => handleViewDetail(row)}>
                  {/* Producto: Imagen + Nombre + SKU / Género */}
                  <Table.Cell rounded="left" className="max-w-56">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductThumbnail
                        key={`${row.id}-${row.image ?? ""}`}
                        src={row.image}
                        sku={row.sku}
                        alt={row.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-bold text-xs text-app-text leading-snug truncate"
                          title={row.name}
                        >
                          {row.name}
                        </span>
                        <span className="text-[11px] text-app-muted truncate mt-0.5 font-mono">
                          {row.sku ? `${row.sku} · ` : `#${row.id} · `}
                          {row.gender}
                        </span>
                      </div>
                    </div>
                  </Table.Cell>

                  {/* Clasificación: Categoría + Marca / Tipo */}
                  <Table.Cell className="max-w-48">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-app-text truncate">
                        {row.productCategory?.name || "Sin categoría"}
                      </span>
                      <span className="text-[11px] text-app-muted truncate mt-0.5">
                        {row.brand?.name || "Sin marca"}
                        {row.shoeType?.name ? ` · ${row.shoeType.name}` : ""}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Precios */}
                  <Table.Cell className="text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs font-black text-brand-royal dark:text-brand-sky">
                        {formatCurrency(row.salePrice)}
                      </span>
                      <span className="font-mono text-[10px] text-app-muted mt-0.5">
                        Costo: {formatCurrency(row.purchasePrice)}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Tienda (isPublic) */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                        row.isPublic
                          ? "bg-brand-royal/10 dark:bg-brand-sky/15 border-brand-royal/20 dark:border-brand-sky/25 text-brand-royal dark:text-brand-sky"
                          : "bg-app-surface-alt border-app-border text-app-muted"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={row.isPublic ? faEye : faEyeSlash}
                        className="text-[10px]"
                      />
                      {row.isPublic ? "Público" : "Oculto"}
                    </span>
                  </Table.Cell>

                  {/* Estado */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switcher
                        checked={Boolean(row.status)}
                        onChange={(checked) => handleToggleStatus(row, checked)}
                        size="sm"
                        showLabel={true}
                      />
                    </div>
                  </Table.Cell>

                  {/* Acciones */}
                  <Table.Cell rounded="right" className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faEye}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(row);
                        }}
                        title="Ver Detalle"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faPenToSquare}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(row);
                        }}
                        title="Editar Producto"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(row);
                        }}
                        title="Eliminar Producto"
                        className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Producto */}
      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        brands={brands}
        shoeTypes={shoeTypes}
        colors={colors}
        sizes={sizes}
        onSubmit={handleCreateProduct}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Producto */}
      <ProductUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        productItem={productToEdit}
        productDetail={productDetailToEdit}
        isLoadingDetail={isLoadingEdit}
        categories={categories}
        brands={brands}
        shoeTypes={shoeTypes}
        colors={colors}
        sizes={sizes}
        onSubmit={handleUpdateProduct}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle de Producto */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle del Producto"
        description={
          selectedProduct
            ? `Ficha completa y variantes de "${selectedProduct.name}"`
            : "Consultando ficha del producto..."
        }
        icon={faShoePrints}
        size="lg"
        footer={
          <div className="flex w-full justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={faXmark}
              onClick={handleCloseDetailModal}
            >
              Cerrar
            </Button>
          </div>
        }
      >
        {isLoadingDetail ? (
          <div className="space-y-4 py-6 animate-pulse">
            <div className="h-24 bg-app-border/40 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
            </div>
            <div className="h-24 bg-app-border/40 rounded-2xl" />
          </div>
        ) : !selectedProduct ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información del producto solicitado.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cabecera del producto */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-linear-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <ProductThumbnail
                  key={`detail-${selectedProduct.id}-${selectedProduct.image ?? ""}`}
                  src={
                    selectedProduct.image ||
                    selectedProduct.productColors?.[0]?.colorImages?.[0]?.image
                  }
                  sku={selectedProduct.sku}
                  alt={selectedProduct.name}
                  sizeClass="size-14 rounded-2xl"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-app-text truncate">
                      {selectedProduct.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        selectedProduct.status
                          ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={selectedProduct.status ? faCircleCheck : faBan}
                        className="text-[10px]"
                      />
                      {selectedProduct.status ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-app-muted mt-1 font-mono">
                    ID #{selectedProduct.id}
                    {selectedProduct.sku ? ` · SKU: ${selectedProduct.sku}` : ""}
                    {` · ${selectedProduct.gender}`}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                  Precio de Venta
                </span>
                <p className="text-2xl font-black text-brand-royal dark:text-brand-sky font-mono mt-0.5">
                  {formatCurrency(selectedProduct.salePrice)}
                </p>
                <span className="text-[11px] text-app-muted font-mono">
                  Costo: {formatCurrency(selectedProduct.purchasePrice)}
                </span>
              </div>
            </div>

            {/* Clasificación y Stock Total */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted block mb-1">
                  Categoría
                </span>
                <p className="text-sm font-bold text-app-text truncate">
                  {selectedProduct.productCategory?.name || "Sin categoría"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted block mb-1">
                  Marca
                </span>
                <p className="text-sm font-bold text-app-text truncate">
                  {selectedProduct.brand?.name || "Sin marca"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted block mb-1">
                  Tipo de Calzado
                </span>
                <p className="text-sm font-bold text-app-text truncate">
                  {selectedProduct.shoeType?.name || "Sin tipo"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1">
                  <FontAwesomeIcon
                    icon={faWarehouse}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Stock Total
                </span>
                <p
                  className={`text-sm font-black font-mono ${
                    selectedProductTotalStock > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {selectedProductTotalStock}{" "}
                  {selectedProductTotalStock === 1 ? "par" : "pares"}
                </p>
              </div>
            </div>

            {/* Colores y Variantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faPalette}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                  Colores y Variantes ({selectedProduct.productColors?.length ?? 0})
                </h4>
                <span className="text-xs font-bold text-app-muted font-mono">
                  Existencias: {selectedProductTotalStock}
                </span>
              </div>

              {!selectedProduct.productColors || selectedProduct.productColors.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-app-border text-xs text-app-muted text-center">
                  Este producto aún no tiene variantes de color o tallas registradas.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProduct.productColors.map((pc) => {
                    const colorStock = (pc.productVariants || []).reduce(
                      (acc, v) => acc + (Number(v.currentStock) || 0),
                      0
                    );

                    return (
                      <div
                        key={pc.id}
                        className="rounded-xl border border-app-border bg-app-surface p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-6 w-6 rounded-md border border-app-border shrink-0"
                              style={{ backgroundColor: pc.color?.hex || "#2B62D9" }}
                            />
                            <span className="text-sm font-bold text-app-text">
                              {pc.color?.name || `Color #${pc.colorId}`}
                            </span>
                            {pc.color?.hex && (
                              <span className="font-mono text-xs text-app-muted">
                                {pc.color.hex}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Stock: {colorStock}
                            </span>
                            <span className="badge-sky text-[11px]">{pc.status}</span>
                          </div>
                        </div>

                        {pc.productVariants && pc.productVariants.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {pc.productVariants.map((variant) => (
                              <span
                                key={variant.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-app-border bg-app-surface-alt px-2.5 py-1 text-xs"
                              >
                                <strong className="text-app-text">
                                  {variant.size
                                    ? `${variant.size.sizeNumber} (${variant.size.internationalSize})`
                                    : `Talla #${variant.sizeId}`}
                                </strong>
                                <span className="text-app-muted">·</span>
                                <span className="font-mono font-bold text-brand-royal dark:text-brand-sky">
                                  Stock: {variant.currentStock}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-app-muted pt-1">
                            Sin tallas registradas para este color.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
