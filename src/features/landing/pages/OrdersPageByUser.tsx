import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Table, type TableColumn } from "../../../shared/components/Table";

interface OrderExampleRow {
  id: string;
}

const EXAMPLE_ORDERS: OrderExampleRow[] = [
  { id: "PED-001" },
];

export default function OrdersPageByUser() {
  const columns: TableColumn<OrderExampleRow>[] = [
    {
      key: "id",
      header: "Pedido",
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand-royal dark:text-brand-sky">
          #{row.id}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-app-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faBagShopping} className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-app-text tracking-tight">
                Mis Pedidos
              </h1>
              <p className="text-xs sm:text-sm text-app-muted">
                Consulta el historial de tus compras realizadas en la tienda
              </p>
            </div>
          </div>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-brand-royal px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-brand-sky hover:text-brand-navy transition-colors"
          >
            <span>Ir al catálogo</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
          </Link>
        </div>

        {/* Espacio de la Tabla con 1 columna de ejemplo */}
        <Table
          columns={columns}
          data={EXAMPLE_ORDERS}
          rowKey="id"
          emptyTitle="Aún no tienes pedidos"
          emptyDescription="Cuando realices una compra aparecerá listada aquí."
        />
      </div>
    </div>
  );
}
