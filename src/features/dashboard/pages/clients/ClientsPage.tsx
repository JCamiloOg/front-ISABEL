import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBagShopping,
  faBan,
  faCalendarDay,
  faCircleCheck,
  faEnvelope,
  faEye,
  faLocationDot,
  faMoneyBillWave,
  faPenToSquare,
  faPhone,
  faReceipt,
  faTrash,
  faUser,
  faUserPlus,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import Button from "../../../../shared/components/Button";
import Select from "../../../../shared/components/Inputs/Select";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { MySwal, Toast } from "../../../../shared/utils/alerts";
import { Switcher } from "../../components/Switcher";
import ClientCreateModal, {
  type ClientCreateFormData,
  type ClientDocumentTypeOption,
} from "./components/clientCreateModal";
import ClientUpdateModal, {
  type ClientUpdateFormData,
} from "./components/clientUpdate";
import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
  type ClientDetailRecord,
  type ClientRecord,
} from "./services/clientsServicies";

const DOCUMENT_TYPE_ID_MAP: Record<ClientDocumentTypeOption, number> = {
  CC: 1,
  CE: 2,
  TI: 3,
  PP: 4,
  NIT: 5,
};

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Modal de edición (PUT /clients/:identityDocument)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<ClientRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modal de detalle (GET /clients/:identityDocument)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<ClientDetailRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Paginación y ordenación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("fullName");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const formatCurrency = (amount: number | string | undefined | null) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ── Petición GET: Obtener Clientes ──
  const loadClients = useCallback(async () => {
    const response = await getClients();
    return response.status === 200 ? response.data.clients || [] : null;
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await loadClients();
      if (data) setClients(data);
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los clientes.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadClients]);

  useEffect(() => {
    let active = true;
    loadClients()
      .then((data) => {
        if (active && data) setClients(data);
      })
      .catch((error) => {
        if (active && isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: error.response?.data?.message || "Error al obtener los clientes.",
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
  }, [loadClients]);

  // ── Petición GET: Detalle del Cliente por Documento ──
  const handleViewDetail = async (client: ClientRecord) => {
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setSelectedClient(null);

    try {
      const response = await getClientById(client.identityDocument);
      if (response.status === 200) {
        setSelectedClient(response.data.client || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del cliente.",
          text: "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedClient(null);
  };

  // ── Petición POST: Crear Cliente ──
  const handleCreateClient = async (data: ClientCreateFormData, onClose: () => void) => {
    try {
      setIsCreating(true);
      const res = await createClient({
        identityDocument: data.documentNumber,
        documentTypeId: DOCUMENT_TYPE_ID_MAP[data.documentType],
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: data.password,
        status: true,
      });

      if (res.status === 201 || res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Cliente creado exitosamente",
        });
        await fetchClients();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al crear cliente",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // ── Petición PUT: Abrir Modal y Actualizar Cliente ──
  const handleOpenEditModal = (client: ClientRecord) => {
    setClientToEdit(client);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setClientToEdit(null);
  };

  const handleUpdateClient = async (
    identityDocument: string,
    data: ClientUpdateFormData,
    onClose: () => void
  ) => {
    try {
      setIsUpdating(true);
      const res = await updateClient(identityDocument, {
        documentTypeId: DOCUMENT_TYPE_ID_MAP[data.documentType],
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status,
      });

      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data.message || "Cliente actualizado exitosamente",
        });
        await fetchClients();
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: "Error al actualizar cliente",
          text: error.response?.data?.message || "Por favor, intenta nuevamente",
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Petición PUT: Actualizar Estado del Cliente ──
  const handleToggleStatus = async (client: ClientRecord, nextChecked: boolean) => {
    const actionText = nextChecked ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿${nextChecked ? "Activar" : "Desactivar"} cliente?`,
      html: `¿Estás seguro de que deseas ${actionText} al cliente <b>"${client.fullName}"</b> (${client.identityDocument})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await updateClient(client.identityDocument, { status: nextChecked });

        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: nextChecked ? "Cliente activado" : "Cliente desactivado",
            text:
              res.data.message ||
              `El cliente ahora está ${nextChecked ? "activo" : "inactivo"}.`,
          });
          await fetchClients();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: `Error al ${actionText} cliente`,
            text: error.response?.data?.message || "Por favor, intenta nuevamente",
          });
        }
      }
    }
  };

  // ── Petición DELETE: Eliminar Cliente ──
  const handleDeleteClient = async (client: ClientRecord) => {
    if (client.totalOrders > 0) {
      await MySwal.fire({
        title: "No se puede eliminar",
        html: `El cliente <b>"${client.fullName}"</b> tiene <b>${client.totalOrders}</b> pedido(s) registrado(s) en el historial.<br/><span class="text-xs text-app-muted mt-2 inline-block">Puedes desactivarlo usando el interruptor de estado.</span>`,
        icon: "warning",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const result = await MySwal.fire({
      title: "¿Eliminar cliente?",
      html: `¿Estás seguro de que deseas eliminar permanentemente a <b>"${client.fullName}"</b> (${client.identityDocument})?<br/><span class="text-xs text-rose-500 font-semibold mt-1 inline-block">Esta acción no se puede deshacer.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteClient(client.identityDocument);
        if (res.status === 200 || res.status === 204) {
          Toast.fire({
            icon: "success",
            title: "Cliente eliminado",
            text: res.data.message || "El cliente fue eliminado exitosamente.",
          });
          await fetchClients();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          Toast.fire({
            icon: "error",
            title: "Error al eliminar cliente",
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
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (statusFilter === "active" && !client.status) return false;
      if (statusFilter === "inactive" && client.status) return false;

      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const docMatch = client.identityDocument.toLowerCase().includes(q);
        const nameMatch = client.fullName.toLowerCase().includes(q);
        const emailMatch = client.email.toLowerCase().includes(q);
        const phoneMatch = client.phone.toLowerCase().includes(q);
        return docMatch || nameMatch || emailMatch || phoneMatch;
      }

      return true;
    });
  }, [clients, statusFilter, searchTerm]);

  // Ordenación
  const sortedClients = useMemo(() => {
    if (!sortKey || !sortDir) return filteredClients;

    return [...filteredClients].sort((a, b) => {
      let cmp = 0;

      if (sortKey === "identityDocument") {
        cmp = a.identityDocument.localeCompare(b.identityDocument);
      } else if (sortKey === "fullName") {
        cmp = a.fullName.localeCompare(b.fullName);
      } else if (sortKey === "totalOrders") {
        cmp = a.totalOrders - b.totalOrders;
      } else if (sortKey === "status") {
        cmp = a.status === b.status ? 0 : a.status ? 1 : -1;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredClients, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedClients.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedClients = useMemo(
    () => sortedClients.slice(startIndex, startIndex + itemsPerPage),
    [sortedClients, startIndex, itemsPerPage]
  );

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 flex items-center justify-center text-brand-royal dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Clientes
            </h1>
            <p className="text-sm text-app-muted">
              Directorio de clientes y registro de compradores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={faArrowRotateRight}
            onClick={fetchClients}
            disabled={isLoading}
            className="hover:border-brand-royal dark:hover:border-brand-sky"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={faUserPlus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Tabla de Clientes (diseño compacto sin scroll horizontal) */}
      <Table>
        <Table.Header
          title="Directorio de Clientes"
          description="Listado de clientes registrados con estado de acceso y pedidos asociados"
          action={
            <Select
              id="filter-client-status"
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
          }
        />

        <div className="mb-4">
          <Table.Search
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, documento, correo o teléfono..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredClients.length} de {clients.length} clientes encontrados
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
                sortKey="fullName"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Cliente
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="identityDocument"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Documento
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Contacto y Dirección
              </th>
              <Table.SortableCell
                sortKey="totalOrders"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Pedidos
              </Table.SortableCell>
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
            ) : paginatedClients.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron clientes con los filtros seleccionados."
                    : "No hay clientes registrados en el sistema."
                }
              />
            ) : (
              paginatedClients.map((client) => (
                <Table.Row
                  key={client.identityDocument}
                  onClick={() => handleViewDetail(client)}
                >
                  {/* Cliente: Nombre completo + Correo */}
                  <Table.Cell rounded="left" className="max-w-[200px]">
                    <div className="flex flex-col min-w-0">
                      <span
                        className="font-bold text-xs text-app-text leading-snug truncate"
                        title={client.fullName}
                      >
                        {client.fullName}
                      </span>
                      <span
                        className="text-[11px] text-app-muted truncate mt-0.5"
                        title={client.email}
                      >
                        {client.email}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Documento: Badge tipo + Número */}
                  <Table.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {client.documentType && (
                        <span className="inline-flex items-center justify-center rounded-md bg-app-surface-alt border border-app-border px-2 py-0.5 text-[11px] font-bold text-app-text uppercase shrink-0">
                          {client.documentType}
                        </span>
                      )}
                      <span className="font-mono text-xs font-semibold text-brand-royal dark:text-brand-sky">
                        {client.identityDocument}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Contacto y Dirección: Teléfono + Dirección */}
                  <Table.Cell className="max-w-[210px]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-app-text whitespace-nowrap">
                        {client.phone}
                      </span>
                      <span
                        className="text-[11px] text-app-muted truncate mt-0.5"
                        title={client.address || "Sin dirección"}
                      >
                        {client.address || "Sin dirección"}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Pedidos */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-royal/10 dark:bg-brand-sky/15 border border-brand-royal/20 dark:border-brand-sky/25 px-2.5 py-1 text-xs font-bold text-brand-royal dark:text-brand-sky">
                      <FontAwesomeIcon icon={faBagShopping} className="text-[11px]" />
                      {client.totalOrders} {client.totalOrders === 1 ? "pedido" : "pedidos"}
                    </span>
                  </Table.Cell>

                  {/* Estado */}
                  <Table.Cell className="text-center whitespace-nowrap">
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Switcher
                        checked={Boolean(client.status)}
                        onChange={(checked) => handleToggleStatus(client, checked)}
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
                          handleViewDetail(client);
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
                          handleOpenEditModal(client);
                        }}
                        title="Editar Cliente"
                        className="hover:text-brand-royal dark:hover:text-brand-sky"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        icon={faTrash}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client);
                        }}
                        title={
                          client.totalOrders > 0
                            ? "No se puede eliminar: tiene pedidos asociados"
                            : "Eliminar Cliente"
                        }
                        className={
                          client.totalOrders > 0
                            ? "opacity-40 text-app-muted hover:bg-transparent cursor-not-allowed"
                            : "text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                        }
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
          totalItems={filteredClients.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* Modal de Creación de Cliente */}
      <ClientCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClient}
        onSubmitLoading={isCreating}
      />

      {/* Modal de Edición de Cliente */}
      <ClientUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        client={clientToEdit}
        onSubmit={handleUpdateClient}
        onSubmitLoading={isUpdating}
      />

      {/* Modal de Detalle del Cliente */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Detalle del Cliente"
        description={
          selectedClient
            ? `Información completa y métricas comerciales de ${selectedClient.fullName}`
            : "Consultando ficha del cliente..."
        }
        icon={faUser}
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
            <div className="h-20 bg-app-border/40 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
              <div className="h-16 bg-app-border/40 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="h-20 bg-app-border/40 rounded-xl" />
              <div className="h-20 bg-app-border/40 rounded-xl" />
              <div className="h-20 bg-app-border/40 rounded-xl" />
            </div>
          </div>
        ) : !selectedClient ? (
          <div className="py-10 text-center text-app-muted">
            No se encontró la información del cliente solicitado.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tarjeta de Cabecera */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-brand-royal/5 dark:to-brand-sky/5">
              <div className="flex items-center gap-3.5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky">
                  <FontAwesomeIcon icon={faUser} className="text-2xl" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-app-text">
                      {selectedClient.fullName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        selectedClient.status
                          ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={selectedClient.status ? faCircleCheck : faBan}
                        className="text-[10px]"
                      />
                      {selectedClient.status ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-xs text-app-muted mt-1 font-mono">
                    {selectedClient.documentType ? `${selectedClient.documentType}: ` : "Doc: "}
                    <strong className="text-app-text">{selectedClient.identityDocument}</strong>
                  </p>
                  <p className="text-[11px] text-app-muted mt-0.5">
                    Registrado el{" "}
                    {selectedClient.createdAt
                      ? new Date(selectedClient.createdAt).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Sin fecha"}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-semibold text-app-muted uppercase tracking-wider">
                  Pedidos Totales
                </span>
                <p className="text-2xl sm:text-3xl font-black text-brand-royal dark:text-brand-sky mt-0.5">
                  {selectedClient.metrics.totalOrders}
                </p>
              </div>
            </div>

            {/* Datos de Contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon icon={faPhone} className="text-brand-royal dark:text-brand-sky" />
                  Teléfono
                </span>
                <p className="text-sm font-bold text-app-text truncate">
                  {selectedClient.phone || "No registrado"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-brand-royal dark:text-brand-sky" />
                  Correo Electrónico
                </span>
                <p className="text-sm font-bold text-app-text truncate" title={selectedClient.email}>
                  {selectedClient.email || "No registrado"}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <span className="text-xs font-bold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-brand-royal dark:text-brand-sky" />
                  Dirección
                </span>
                <p
                  className="text-sm font-bold text-app-text truncate"
                  title={selectedClient.address || ""}
                >
                  {selectedClient.address || "No registrada"}
                </p>
              </div>
            </div>

            {/* Métricas Comerciales de la API */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                  <span>Volumen de Compras</span>
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                </div>
                <p className="text-xl font-black text-brand-royal dark:text-brand-sky mt-2 font-mono">
                  {formatCurrency(selectedClient.metrics.purchaseVolume)}
                </p>
                <span className="text-[11px] text-app-muted">Acumulado histórico</span>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                  <span>Último Mes</span>
                  <FontAwesomeIcon
                    icon={faReceipt}
                    className="text-emerald-500"
                  />
                </div>
                <p className="text-xl font-black text-app-text mt-2 font-mono">
                  {formatCurrency(selectedClient.metrics.lastMonthSalesTotal)}
                </p>
                <span className="text-[11px] text-app-muted">Compras últimos 30 días</span>
              </div>

              <div className="p-4 rounded-xl border border-app-border bg-app-surface">
                <div className="flex items-center justify-between text-app-muted text-xs font-semibold">
                  <span>Última Compra</span>
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    className="text-brand-royal dark:text-brand-sky"
                  />
                </div>
                <p className="text-base font-bold text-app-text mt-2">
                  {selectedClient.metrics.lastPurchaseDate
                    ? new Date(selectedClient.metrics.lastPurchaseDate).toLocaleDateString(
                        "es-CO",
                        { year: "numeric", month: "short", day: "numeric" }
                      )
                    : "Sin compras"}
                </p>
                <span className="text-[11px] text-app-muted">Fecha del último pedido</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientsPage;
