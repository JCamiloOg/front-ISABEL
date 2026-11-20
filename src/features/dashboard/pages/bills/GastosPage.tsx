import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../../shared/components/Button";

export function GastosPage() {
  return (
    <div className="min-h-full bg-app-bg pb-6 text-app-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Encabezado */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-app-border pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                <FontAwesomeIcon icon={faReceipt} className="text-lg" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
                  Gestión de Gastos
                </h1>
                <p className="text-sm text-app-muted">
                  Registra los egresos operativos del negocio y supervisa en tiempo real el saldo de tus cuentas bancarias y cajas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={faPlus}
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
                0 cajas
              </span>
            </div>

            <p className="text-sm text-app-muted">
              Saldo total disponible:{" "}
              <strong className="font-extrabold text-brand-royal dark:text-brand-sky text-base">
                $0
              </strong>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Cards de cajas */}
          </div>
        </section>

        {/* Sección Tabla de Historial */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 text-center text-app-muted">
          No hay gastos registrados.
        </div>
      </div>
    </div>
  );
}

export default GastosPage;
