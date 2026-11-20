// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTags, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { SupplierCategoryWithRelations } from "../../../../../@types/suppliers";
import Button from "../../../../../shared/components/Button";
import Modal from "../../../../../shared/components/Modal";

interface SupplierCategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: SupplierCategoryWithRelations | null;
  isLoading: boolean;
  onEdit: (category: SupplierCategoryWithRelations) => void;
  onDelete: (category: SupplierCategoryWithRelations) => void;
}

export function SupplierCategoryDetailModal({
  isOpen,
  onClose,
  category,
  isLoading,
  onEdit,
  onDelete,
}: SupplierCategoryDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category?.name ?? "Detalle de categoría"}
      description="Información de la categoría y proveedores asociados."
      icon={faTags}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            icon={faPenToSquare}
            onClick={() => category && onEdit(category)}
            disabled={!category || isLoading}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            icon={faTrash}
            onClick={() => category && onDelete(category)}
            disabled={!category || isLoading}
          >
            Eliminar
          </Button>
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="py-8 text-center text-app-muted">Cargando categoría...</p>
      ) : category ? (
        <div className="space-y-5 py-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Descripción
            </h3>
            <p className="mt-1 text-sm text-app-text">
              {category.description || "Sin descripción"}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Proveedores asociados ({category.suppliers?.length ?? 0})
            </h3>
            {category.suppliers?.length ? (
              <ul className="mt-2 divide-y divide-app-border rounded-xl border border-app-border">
                {category.suppliers.map((assignment, index) => (
                  // El backend devuelve los datos del proveedor dentro de
                  // "supplier"; document se usa como clave estable cuando existe.
                  <li
                    key={
                      assignment.supplier?.document ||
                      assignment.supplierId?.toString() ||
                      `supplier-${index}`
                    }
                    className="px-4 py-3 text-sm text-app-text"
                  >
                    {assignment.supplier?.businessName || assignment.supplierId}
                  </li>
                  
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-app-muted">
                Esta categoría todavía no tiene proveedores asociados.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default SupplierCategoryDetailModal;
