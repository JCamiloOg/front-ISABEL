import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faShoePrints,
  faArrowRotateRight,
  faEye,
  faPenToSquare,
  faLayerGroup,
  faDollarSign,
  faToggleOn,
  faToggleOff,
  faWarehouse,
  faImage,
  faUpload,
  faPalette,
  faRulerCombined,
  faXmark,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import { MOCK_PRODUCTOS_PRISMA } from "../../../../data/products";
import type { ProductoConRelaciones, Genero, Estado, ProductoColor } from "../../../../@types/Products";
import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Inputs/Input";
import { Select } from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import { Table, type TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts";

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

// Catálogo de colores para selección y previsualización
const COLOR_CATALOG: { idColor: number; nombre: string; hex: string }[] = [
  { idColor: 101, nombre: "Negro", hex: "#1e293b" },
  { idColor: 102, nombre: "Blanco", hex: "#f1f5f9" },
  { idColor: 103, nombre: "Azul", hex: "#2563eb" },
  { idColor: 104, nombre: "Rojo", hex: "#dc2626" },
  { idColor: 105, nombre: "Gris", hex: "#64748b" },
  { idColor: 106, nombre: "Verde Militar", hex: "#16a34a" },
  { idColor: 107, nombre: "Beige / Café", hex: "#b45309" },
  { idColor: 108, nombre: "Amarillo", hex: "#eab308" },
  { idColor: 109, nombre: "Rosa Pastel", hex: "#ec4899" },
  { idColor: 110, nombre: "Naranja", hex: "#ea580c" },
];

const getColorInfo = (idColor: number) => {
  return (
    COLOR_CATALOG.find((c) => c.idColor === idColor) || {
      idColor,
      nombre: `Color #${idColor}`,
      hex: "#64748b",
    }
  );
};

const getTallaInternacional = (numero: string): string => {
  const num = parseInt(numero, 10);
  if (isNaN(num)) return `Talla ${numero}`;
  const us = Math.max(4, (num - 32) * 0.8 + 4).toFixed(1).replace(".0", "");
  return `US ${us}`;
};

// Interfaces para manejo de colores y tallas en el formulario
interface FormVarianteItem {
  idVariante?: number;
  idTalla?: number;
  numeroTalla: string;
  stockActual: number;
  descuento: number;
  estado: Estado;
}

interface FormColorItem {
  idProductoColor?: number;
  idColor: number;
  nombreColor: string;
  imagenes: string[];
  estado: Estado;
  variantes: FormVarianteItem[];
}

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

  // Estados del formulario (sin campo SKU visible al usuario)
  const [formNombre, setFormNombre] = useState("");
  const [formMarca, setFormMarca] = useState<number>(1);
  const [formCategoria, setFormCategoria] = useState<number>(1);
  const [formPrecioCompra, setFormPrecioCompra] = useState<number>(50);
  const [formPrecioVenta, setFormPrecioVenta] = useState<number>(99);
  const [formGenero, setFormGenero] = useState<Genero>("Unisex");
  const [formPublico, setFormPublico] = useState<boolean>(true);
  const [formEstado, setFormEstado] = useState<Estado>("Activo");

  // Colores y tallas dinámicos del formulario
  const [formColores, setFormColores] = useState<FormColorItem[]>([]);
  const [activeFormColorIndex, setActiveFormColorIndex] = useState<number>(0);

  // Campos para agregar nuevo color / nueva talla rápida en el formulario
  const [newColorSelectId, setNewColorSelectId] = useState<number>(101);
  const [newTallaNumero, setNewTallaNumero] = useState<string>("40");
  const [newTallaStock, setNewTallaStock] = useState<number>(10);
  const [newTallaDescuento, setNewTallaDescuento] = useState<number>(0);

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

  // Toggle de Estado del Producto
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

  // Toggle de Estado del Color en Modal Detalle
  const handleToggleColorEstadoInDetail = (colorIdx: number) => {
    if (!detailProduct) return;
    const targetColor = detailProduct.colores[colorIdx];
    if (!targetColor) return;
    const nextEstado: Estado = targetColor.estado === "Activo" ? "Inactivo" : "Activo";
    const colorName = getColorInfo(targetColor.idColor).nombre;

    const updatedColores = detailProduct.colores.map((c, i) =>
      i === colorIdx ? { ...c, estado: nextEstado } : c
    );

    const updatedProd: ProductoConRelaciones = {
      ...detailProduct,
      colores: updatedColores,
    };

    setDetailProduct(updatedProd);
    setProductos((prev) =>
      prev.map((p) => (p.idProducto === updatedProd.idProducto ? updatedProd : p))
    );

    Toast.fire({
      icon: "info",
      title: `Color ${colorName}: cambiado a ${nextEstado}`,
    });
  };

  // Toggle de Estado de la Talla en Modal Detalle
  const handleToggleTallaEstadoInDetail = (colorIdx: number, idVariante: number) => {
    if (!detailProduct) return;
    let tallaNumero = "";
    let nextEstado: Estado = "Activo";

    const updatedColores = detailProduct.colores.map((color, cIdx) => {
      if (cIdx !== colorIdx) return color;
      const updatedVariantes = color.variantes.map((v) => {
        if (v.idVariante === idVariante) {
          nextEstado = v.estado === "Activo" ? "Inactivo" : "Activo";
          tallaNumero = v.talla.numeroTalla;
          return { ...v, estado: nextEstado };
        }
        return v;
      });
      return { ...color, variantes: updatedVariantes };
    });

    const updatedProd: ProductoConRelaciones = {
      ...detailProduct,
      colores: updatedColores,
    };

    setDetailProduct(updatedProd);
    setProductos((prev) =>
      prev.map((p) => (p.idProducto === updatedProd.idProducto ? updatedProd : p))
    );

    Toast.fire({
      icon: "info",
      title: `Talla ${tallaNumero}: cambiada a ${nextEstado}`,
    });
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormNombre("");
    setFormMarca(1);
    setFormCategoria(1);
    setFormPrecioCompra(45);
    setFormPrecioVenta(89.99);
    setFormGenero("Unisex");
    setFormPublico(true);
    setFormEstado("Activo");

    // Color inicial por defecto con tallas
    setFormColores([
      {
        idColor: 101,
        nombreColor: "Negro",
        imagenes: [],
        estado: "Activo",
        variantes: [
          { numeroTalla: "39", stockActual: 10, descuento: 0, estado: "Activo" },
          { numeroTalla: "40", stockActual: 12, descuento: 0, estado: "Activo" },
          { numeroTalla: "41", stockActual: 15, descuento: 0, estado: "Activo" },
          { numeroTalla: "42", stockActual: 8, descuento: 0, estado: "Activo" },
        ],
      },
    ]);
    setActiveFormColorIndex(0);
    setNewColorSelectId(102);
    setNewTallaNumero("43");
    setNewTallaStock(10);
    setNewTallaDescuento(0);
    setIsFormOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (prod: ProductoConRelaciones) => {
    setEditingProduct(prod);
    setFormNombre(prod.nombre);
    setFormMarca(prod.idMarca);
    setFormCategoria(prod.idCategoriaProducto);
    setFormPrecioCompra(prod.precioCompra);
    setFormPrecioVenta(prod.precioVenta);
    setFormGenero(prod.genero);
    setFormPublico(prod.publico);
    setFormEstado(prod.estado);

    const loadedColores: FormColorItem[] = prod.colores.map((c) => ({
      idProductoColor: c.idProductoColor,
      idColor: c.idColor,
      nombreColor: getColorInfo(c.idColor).nombre,
      imagenes: [...c.imagenes],
      estado: c.estado,
      variantes: c.variantes.map((v) => ({
        idVariante: v.idVariante,
        idTalla: v.idTalla,
        numeroTalla: v.talla.numeroTalla,
        stockActual: v.stockActual,
        descuento: v.descuento,
        estado: v.estado,
      })),
    }));

    setFormColores(
      loadedColores.length > 0
        ? loadedColores
        : [
          {
            idColor: 101,
            nombreColor: "Negro",
            imagenes: [],
            estado: "Activo",
            variantes: [{ numeroTalla: "40", stockActual: 10, descuento: 0, estado: "Activo" }],
          },
        ]
    );
    setActiveFormColorIndex(0);
    setNewColorSelectId(101);
    setNewTallaNumero("40");
    setNewTallaStock(10);
    setNewTallaDescuento(0);
    setIsFormOpen(true);
  };

  // Manejo de Colores en el Formulario
  const handleAddColor = () => {
    const chosenColor = getColorInfo(newColorSelectId);
    const alreadyExists = formColores.some((c) => c.idColor === newColorSelectId);
    if (alreadyExists) {
      Toast.fire({
        icon: "warning",
        title: `El color ${chosenColor.nombre} ya está en la lista`,
      });
      return;
    }

    const newColorItem: FormColorItem = {
      idColor: chosenColor.idColor,
      nombreColor: chosenColor.nombre,
      imagenes: [],
      estado: "Activo",
      variantes: [
        { numeroTalla: "39", stockActual: 8, descuento: 0, estado: "Activo" },
        { numeroTalla: "40", stockActual: 10, descuento: 0, estado: "Activo" },
        { numeroTalla: "41", stockActual: 12, descuento: 0, estado: "Activo" },
      ],
    };

    setFormColores((prev) => [...prev, newColorItem]);
    setActiveFormColorIndex(formColores.length);
    Toast.fire({
      icon: "success",
      title: `Color ${chosenColor.nombre} agregado`,
    });
  };

  const handleRemoveColor = (indexToRemove: number) => {
    if (formColores.length <= 1) {
      Toast.fire({
        icon: "warning",
        title: "El producto debe tener al menos un color",
      });
      return;
    }
    setFormColores((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (activeFormColorIndex >= indexToRemove && activeFormColorIndex > 0) {
      setActiveFormColorIndex((prev) => prev - 1);
    }
  };

  const handleToggleFormColorEstado = (index: number) => {
    setFormColores((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const nextEstado: Estado = c.estado === "Activo" ? "Inactivo" : "Activo";
        return { ...c, estado: nextEstado };
      })
    );
  };

  // Manejo de Tallas en el Formulario
  const handleAddTallaToActiveColor = () => {
    if (!newTallaNumero.trim()) {
      Toast.fire({ icon: "warning", title: "Ingresa el número de talla" });
      return;
    }

    const activeColor = formColores[activeFormColorIndex];
    if (!activeColor) return;

    const exists = activeColor.variantes.some((v) => v.numeroTalla === newTallaNumero.trim());
    if (exists) {
      Toast.fire({
        icon: "warning",
        title: `La talla ${newTallaNumero} ya existe en este color`,
      });
      return;
    }

    const newVar: FormVarianteItem = {
      numeroTalla: newTallaNumero.trim(),
      stockActual: Number(newTallaStock) || 0,
      descuento: Number(newTallaDescuento) || 0,
      estado: "Activo",
    };

    setFormColores((prev) =>
      prev.map((c, i) =>
        i === activeFormColorIndex ? { ...c, variantes: [...c.variantes, newVar] } : c
      )
    );

    Toast.fire({
      icon: "success",
      title: `Talla ${newTallaNumero} agregada`,
    });
  };

  const handleRemoveTallaFromActiveColor = (varIdx: number) => {
    const activeColor = formColores[activeFormColorIndex];
    if (!activeColor) return;
    if (activeColor.variantes.length <= 1) {
      Toast.fire({
        icon: "warning",
        title: "Cada color debe tener al menos una talla",
      });
      return;
    }
    setFormColores((prev) =>
      prev.map((c, i) =>
        i === activeFormColorIndex
          ? { ...c, variantes: c.variantes.filter((_, idx) => idx !== varIdx) }
          : c
      )
    );
  };

  const handleToggleFormTallaEstado = (varIdx: number) => {
    setFormColores((prev) =>
      prev.map((c, i) => {
        if (i !== activeFormColorIndex) return c;
        const updatedVars: FormVarianteItem[] = c.variantes.map((v, idx) => {
          if (idx !== varIdx) return v;
          const nextEstado: Estado = v.estado === "Activo" ? "Inactivo" : "Activo";
          return { ...v, estado: nextEstado };
        });
        return { ...c, variantes: updatedVars };
      })
    );
  };

  const handleUpdateTallaField = (
    varIdx: number,
    field: "stockActual" | "descuento",
    value: number
  ) => {
    setFormColores((prev) =>
      prev.map((c, i) => {
        if (i !== activeFormColorIndex) return c;
        const updatedVars = c.variantes.map((v, idx) =>
          idx === varIdx ? { ...v, [field]: value } : v
        );
        return { ...c, variantes: updatedVars };
      })
    );
  };

  // Manejo de Imagen mediante archivo (File Input)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const dataUrl = reader.result;
        setFormColores((prev) =>
          prev.map((c, i) =>
            i === activeFormColorIndex ? { ...c, imagenes: [dataUrl, ...c.imagenes.slice(1)] } : c
          )
        );
        Toast.fire({
          icon: "success",
          title: "Imagen cargada correctamente",
        });
      }
    };
    reader.readAsDataURL(file);
    // Reiniciar input para permitir cargar el mismo archivo si se desea
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setFormColores((prev) =>
      prev.map((c, i) => (i === activeFormColorIndex ? { ...c, imagenes: [] } : c))
    );
  };

  // Guardar Producto (Crear o Editar)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Ingresa el nombre del calzado",
      });
      return;
    }

    if (formColores.length === 0) {
      Toast.fire({
        icon: "warning",
        title: "Agrega al menos un color al calzado",
      });
      return;
    }

    for (const c of formColores) {
      if (c.variantes.length === 0) {
        Toast.fire({
          icon: "warning",
          title: `El color ${c.nombreColor} debe tener al menos una talla`,
        });
        return;
      }
    }

    if (editingProduct) {
      const updatedColores: ProductoColor[] = formColores.map((fc, cIdx) => {
        const prodColorId = fc.idProductoColor || Number(`${editingProduct.idProducto}${cIdx + 1}`);
        return {
          idProductoColor: prodColorId,
          idProducto: editingProduct.idProducto,
          idColor: fc.idColor,
          imagenes:
            fc.imagenes.length > 0
              ? fc.imagenes
              : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
          estado: fc.estado,
          variantes: fc.variantes.map((fv, vIdx) => {
            const varId = fv.idVariante || Number(`${prodColorId}${vIdx + 1}`);
            const idTalla = fv.idTalla || vIdx + 1;
            return {
              idVariante: varId,
              idProductoColor: prodColorId,
              idTalla,
              stockActual: Number(fv.stockActual) || 0,
              descuento: Number(fv.descuento) || 0,
              estado: fv.estado,
              talla: {
                idTalla,
                numeroTalla: fv.numeroTalla,
                genero: formGenero,
                tallaInternacional: getTallaInternacional(fv.numeroTalla),
              },
            };
          }),
        };
      });

      setProductos((prev) =>
        prev.map((item) => {
          if (item.idProducto === editingProduct.idProducto) {
            return {
              ...item,
              nombre: formNombre,
              sku: editingProduct.sku, // El SKU se mantiene sin requerir edición al usuario
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

      // Generar SKU automáticamente sin solicitarlo al usuario
      const brandPrefixes: Record<number, string> = {
        1: "NK",
        2: "AD",
        3: "VN",
        4: "PM",
        5: "CV",
      };
      const prefix = brandPrefixes[formMarca] || "IS";
      const autoSku = `${prefix}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;

      const newColores: ProductoColor[] = formColores.map((fc, cIdx) => {
        const prodColorId = Number(`${newId}${cIdx + 1}`);
        return {
          idProductoColor: prodColorId,
          idProducto: newId,
          idColor: fc.idColor,
          imagenes:
            fc.imagenes.length > 0
              ? fc.imagenes
              : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
          estado: fc.estado,
          variantes: fc.variantes.map((fv, vIdx) => {
            const varId = Number(`${prodColorId}${vIdx + 1}`);
            const idTalla = vIdx + 1;
            return {
              idVariante: varId,
              idProductoColor: prodColorId,
              idTalla,
              stockActual: Number(fv.stockActual) || 0,
              descuento: Number(fv.descuento) || 0,
              estado: fv.estado,
              talla: {
                idTalla,
                numeroTalla: fv.numeroTalla,
                genero: formGenero,
                tallaInternacional: getTallaInternacional(fv.numeroTalla),
              },
            };
          }),
        };
      });

      const newShoe: ProductoConRelaciones = {
        idProducto: newId,
        nombre: formNombre,
        sku: autoSku,
        idMarca: Number(formMarca),
        idCategoriaProducto: Number(formCategoria),
        idTipoZapato: 1,
        precioCompra: Number(formPrecioCompra),
        precioVenta: Number(formPrecioVenta),
        publico: formPublico,
        genero: formGenero,
        estado: formEstado,
        colores: newColores,
      };

      setProductos((prev) => [newShoe, ...prev]);
      Toast.fire({ icon: "success", title: "Nuevo calzado registrado con éxito" });
    }

    setIsFormOpen(false);
  };

  // Definición de columnas para el componente global Table (Sin opción de eliminación de productos)
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
              className={`font-extrabold text-sm ${isLow ? "text-rose-600 dark:text-rose-400" : "text-app-text"
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
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${prod.estado === "Activo"
            ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
            }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${prod.estado === "Activo" ? "bg-emerald-500" : "bg-slate-400"
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

      {/* MODAL DETALLE COMPLETO (Variantes de Color, Tallas y Cambio de Estado) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={detailProduct?.nombre || "Detalle de Producto"}
        description={`SKU: ${detailProduct?.sku || ""} · ${MARCAS_MAP[detailProduct?.idMarca || 1] || "Calzado"}`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-app-muted">
              Estado General: <strong className="text-app-text">{detailProduct?.estado}</strong>
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

            <div className="space-y-4 pt-3 border-t border-app-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-app-text uppercase tracking-wider">
                    Variantes por Color ({detailProduct.colores.length})
                  </label>
                  <span className="text-xs text-app-muted">
                    · Clic en el color para ver sus tallas
                  </span>
                </div>

                {/* Cambio de estado del color activo en detalle */}
                {detailProduct.colores[selectedColorIndex] && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-muted">
                      Estado de {getColorInfo(detailProduct.colores[selectedColorIndex].idColor).nombre}:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleColorEstadoInDetail(selectedColorIndex)}
                      title={`Clic para cambiar estado del color a ${detailProduct.colores[selectedColorIndex].estado === "Activo" ? "Inactivo" : "Activo"
                        }`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${detailProduct.colores[selectedColorIndex].estado === "Activo"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                        }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          detailProduct.colores[selectedColorIndex].estado === "Activo"
                            ? faToggleOn
                            : faToggleOff
                        }
                        className="text-xs"
                      />
                      <span>{detailProduct.colores[selectedColorIndex].estado}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botones de Colores */}
              <div className="flex flex-wrap gap-2">
                {detailProduct.colores.map((color, idx) => {
                  const colorInfo = getColorInfo(color.idColor);
                  const isSelected = selectedColorIndex === idx;
                  return (
                    <button
                      key={color.idProductoColor}
                      type="button"
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer border ${isSelected
                        ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky shadow-xs"
                        : "border-app-border bg-app-surface text-app-muted hover:border-brand-royal/30"
                        } ${color.estado === "Inactivo" ? "opacity-75" : ""}`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white shadow-xs shrink-0"
                        style={{ backgroundColor: colorInfo.hex }}
                      />
                      <span>{colorInfo.nombre}</span>
                      <span className="text-[10px] font-normal opacity-75">
                        ({color.variantes.length} {color.variantes.length === 1 ? "talla" : "tallas"})
                      </span>
                      <span
                        className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${color.estado === "Activo"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                      >
                        {color.estado}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detalle interno de tallas con cambio interactivo de estado */}
              <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface mt-3">
                <div className="p-3 bg-app-surface-alt border-b border-app-border flex items-center justify-between text-xs font-bold text-app-muted">
                  <span>TALLA DISPONIBLE</span>
                  <span>STOCK ACTUAL</span>
                  <span>DESCUENTO</span>
                  <span className="text-right">ESTADO (CLIC PARA CAMBIAR)</span>
                </div>

                <div className="divide-y divide-app-border text-xs">
                  {detailProduct.colores[selectedColorIndex]?.variantes.map((v) => (
                    <div
                      key={v.idVariante}
                      className="p-3 flex items-center justify-between hover:bg-app-surface-alt/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-8 items-center justify-center rounded bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-extrabold">
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

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleTallaEstadoInDetail(selectedColorIndex, v.idVariante)}
                          title={`Hacer clic para cambiar a ${v.estado === "Activo" ? "Inactivo" : "Activo"}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${v.estado === "Activo"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                            }`}
                        >
                          <FontAwesomeIcon
                            icon={v.estado === "Activo" ? faToggleOn : faToggleOff}
                            className="text-xs"
                          />
                          <span>{v.estado}</span>
                        </button>
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
        description="Ingresa los datos comerciales, colores, tallas e imágenes del calzado"
        size="xl"
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
        <form onSubmit={handleSaveProduct} className="space-y-5">
          {/* Nombre del Producto (Sin campo SKU en el formulario) */}
          <div>
            <Input
              id="form-nombre"
              label="Nombre del Producto / Modelo"
              placeholder="Ej. Air Jordan Retro 1"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="form-estado"
              label="Estado Inicial del Calzado"
              value={formEstado}
              onChange={(e) => setFormEstado(e.target.value as Estado)}
              options={[
                { value: "Activo", label: "Activo (Disponible para venta)" },
                { value: "Inactivo", label: "Inactivo (Oculto en catálogo)" },
              ]}
            />

            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-app-text mb-2">Visibilidad en Tienda Online</label>
              <button
                type="button"
                onClick={() => setFormPublico((prev) => !prev)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all cursor-pointer ${formPublico
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-app-border bg-app-surface text-app-muted"
                  }`}
              >
                <span>{formPublico ? "Visible para clientes (Público)" : "Privado (Solo personal)"}</span>
                <FontAwesomeIcon icon={formPublico ? faToggleOn : faToggleOff} className="text-base" />
              </button>
            </div>
          </div>

          {/* SECCIÓN CREAR COLORES Y TALLAS */}
          <div className="space-y-4 pt-4 border-t border-app-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-app-text flex items-center gap-2">
                  <FontAwesomeIcon icon={faPalette} className="text-brand-royal dark:text-brand-sky" />
                  Colores, Imágenes y Tallas del Calzado
                </h3>
                <p className="text-xs text-app-muted">
                  Configura cada color, sube su imagen y define sus tallas disponibles
                </p>
              </div>

              {/* Selector para añadir un nuevo color */}
              <div className="flex items-center gap-2">
                <select
                  value={newColorSelectId}
                  onChange={(e) => setNewColorSelectId(Number(e.target.value))}
                  className="h-8 rounded-lg border border-app-border bg-app-surface px-2 text-xs font-semibold text-app-text"
                >
                  {COLOR_CATALOG.map((c) => (
                    <option key={c.idColor} value={c.idColor}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-royal px-3 text-xs font-bold text-white hover:bg-brand-royal/90 dark:bg-brand-sky dark:text-slate-900 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  <span>Añadir Color</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Colores */}
            <div className="flex flex-wrap gap-2">
              {formColores.map((colorItem, idx) => {
                const colorInfo = getColorInfo(colorItem.idColor);
                const isActive = activeFormColorIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${isActive
                      ? "border-brand-royal bg-brand-royal/10 text-brand-royal dark:border-brand-sky dark:bg-brand-sky/15 dark:text-brand-sky shadow-xs"
                      : "border-app-border bg-app-surface text-app-muted hover:border-brand-royal/30"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFormColorIndex(idx)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: colorInfo.hex }}
                      />
                      <span>{colorInfo.nombre}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        ({colorItem.variantes.length} {colorItem.variantes.length === 1 ? "talla" : "tallas"})
                      </span>
                    </button>

                    {/* Toggle estado del color dentro del formulario */}
                    <button
                      type="button"
                      onClick={() => handleToggleFormColorEstado(idx)}
                      title={`Color ${colorItem.estado}. Clic para cambiar.`}
                      className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer transition-all ${colorItem.estado === "Activo"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300"
                        }`}
                    >
                      {colorItem.estado}
                    </button>

                    {formColores.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        title="Eliminar este color"
                        className="text-app-muted hover:text-rose-500 cursor-pointer ml-0.5"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contenido del color activo: Imagen mediante input de archivo + Tallas */}
            {formColores[activeFormColorIndex] && (
              <div className="rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-app-border gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 rounded-full border border-white shadow-xs"
                      style={{
                        backgroundColor: getColorInfo(formColores[activeFormColorIndex].idColor).hex,
                      }}
                    />
                    <h4 className="text-xs font-bold text-app-text uppercase tracking-wider">
                      Configuración para: {getColorInfo(formColores[activeFormColorIndex].idColor).nombre}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-app-muted">Estado del color:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleFormColorEstado(activeFormColorIndex)}
                      title={`Clic para cambiar estado a ${formColores[activeFormColorIndex].estado === "Activo" ? "Inactivo" : "Activo"
                        }`}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer ${formColores[activeFormColorIndex].estado === "Activo"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"
                        }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          formColores[activeFormColorIndex].estado === "Activo"
                            ? faToggleOn
                            : faToggleOff
                        }
                        className="text-xs"
                      />
                      <span>{formColores[activeFormColorIndex].estado}</span>
                    </button>
                  </div>
                </div>

                {/* CAMPO DE IMAGEN: INPUT DE ARCHIVO */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-app-text flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faImage} className="text-brand-royal dark:text-brand-sky text-xs" />
                    Imagen del calzado ({getColorInfo(formColores[activeFormColorIndex].idColor).nombre})
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-app-border bg-app-surface-alt">
                    {formColores[activeFormColorIndex]?.imagenes?.[0] ? (
                      <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-app-border bg-app-surface shadow-xs">
                        <img
                          src={formColores[activeFormColorIndex].imagenes[0]}
                          alt="Vista previa"
                          className="h-full w-full object-cover object-center"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          title="Remover imagen"
                          className="absolute top-1 right-1 h-5 w-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-rose-700 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 shrink-0 rounded-xl border border-dashed border-app-border flex flex-col items-center justify-center text-app-muted bg-app-surface">
                        <FontAwesomeIcon icon={faImage} className="text-2xl text-app-muted/50" />
                        <span className="text-[10px] mt-1 text-center font-medium">Sin imagen</span>
                      </div>
                    )}

                    <div className="flex-1 w-full text-center sm:text-left">
                      <input
                        type="file"
                        id="shoe-image-file-input"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="shoe-image-file-input"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-royal dark:text-brand-sky bg-brand-royal/10 dark:bg-brand-sky/15 hover:bg-brand-royal/20 transition-all cursor-pointer border border-brand-royal/20 dark:border-brand-sky/20"
                      >
                        <FontAwesomeIcon icon={faUpload} />
                        {formColores[activeFormColorIndex]?.imagenes?.[0]
                          ? "Cambiar archivo de imagen"
                          : "Seleccionar imagen desde tu equipo"}
                      </label>
                      <p className="text-[11px] text-app-muted mt-1.5">
                        Formatos recomendados: PNG, JPG o WEBP. La imagen se asocia directamente a este color.
                      </p>
                    </div>
                  </div>
                </div>

                {/* GESTIÓN DE TALLAS PARA EL COLOR ACTIVO */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-app-text flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faRulerCombined} className="text-brand-royal dark:text-brand-sky text-xs" />
                      Tallas disponibles para este color
                    </label>
                    <span className="text-xs text-app-muted font-medium">
                      {formColores[activeFormColorIndex].variantes.length} registradas
                    </span>
                  </div>

                  {/* Barra rápida para agregar nueva talla */}
                  <div className="flex flex-wrap items-end gap-2.5 p-3 rounded-xl bg-app-surface-alt border border-app-border">
                    <div className="w-24">
                      <label className="text-[11px] font-semibold text-app-muted block mb-1">Talla</label>
                      <input
                        type="text"
                        placeholder="Ej. 40"
                        value={newTallaNumero}
                        onChange={(e) => setNewTallaNumero(e.target.value)}
                        className="h-8 w-full rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-bold text-app-text"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[11px] font-semibold text-app-muted block mb-1">Stock (pares)</label>
                      <input
                        type="number"
                        min="0"
                        value={newTallaStock}
                        onChange={(e) => setNewTallaStock(Number(e.target.value))}
                        className="h-8 w-full rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-bold text-app-text"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[11px] font-semibold text-app-muted block mb-1">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newTallaDescuento}
                        onChange={(e) => setNewTallaDescuento(Number(e.target.value))}
                        className="h-8 w-full rounded-lg border border-app-border bg-app-surface px-2.5 text-xs font-bold text-app-text"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTallaToActiveColor}
                      className="h-8 inline-flex items-center gap-1.5 rounded-lg bg-brand-royal px-3.5 text-xs font-bold text-white hover:bg-brand-royal/90 dark:bg-brand-sky dark:text-slate-900 transition-all cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      <span>Añadir Talla</span>
                    </button>
                  </div>

                  {/* Tabla de tallas configuradas con estado cambiable y eliminación de talla */}
                  <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
                    <div className="grid grid-cols-5 gap-2 p-2.5 bg-app-surface-alt border-b border-app-border text-[11px] font-bold text-app-muted">
                      <span>TALLA</span>
                      <span>STOCK</span>
                      <span>DESCUENTO</span>
                      <span className="text-center">ESTADO</span>
                      <span className="text-right">ACCIÓN</span>
                    </div>

                    <div className="divide-y divide-app-border text-xs">
                      {formColores[activeFormColorIndex].variantes.map((v, vIdx) => (
                        <div
                          key={vIdx}
                          className="grid grid-cols-5 gap-2 p-2.5 items-center hover:bg-app-surface-alt/40 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-6 w-8 items-center justify-center rounded bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky font-extrabold text-xs">
                              {v.numeroTalla}
                            </span>
                            <span className="text-[10px] text-app-muted">({getTallaInternacional(v.numeroTalla)})</span>
                          </div>

                          <div>
                            <input
                              type="number"
                              min="0"
                              value={v.stockActual}
                              onChange={(e) => handleUpdateTallaField(vIdx, "stockActual", Number(e.target.value))}
                              className="h-7 w-20 rounded border border-app-border bg-app-surface px-1.5 text-xs font-semibold text-app-text"
                            />
                          </div>

                          <div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={v.descuento}
                              onChange={(e) => handleUpdateTallaField(vIdx, "descuento", Number(e.target.value))}
                              className="h-7 w-16 rounded border border-app-border bg-app-surface px-1.5 text-xs font-semibold text-app-text"
                            />
                            <span className="text-[10px] text-app-muted ml-1">%</span>
                          </div>

                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFormTallaEstado(vIdx)}
                              title={`Clic para cambiar estado a ${v.estado === "Activo" ? "Inactivo" : "Activo"}`}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${v.estado === "Activo"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300"
                                }`}
                            >
                              <FontAwesomeIcon icon={v.estado === "Activo" ? faToggleOn : faToggleOff} className="text-xs" />
                              <span>{v.estado}</span>
                            </button>
                          </div>

                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveTallaFromActiveColor(vIdx)}
                              title="Eliminar esta talla del color"
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-app-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
