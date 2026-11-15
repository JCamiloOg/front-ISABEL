import React, { useState, useMemo } from "react";
import type { Client, ClientFormData, ClientStatus } from "../../../../@types/client";
import { initialClients } from "../../../../data/mockClients";
import { ClientModal } from "./components/clients/ClientModal";
import { ClientDetailModal } from "./components/clients/ClientDetailModal";
import Input from "../../../../shared/components/Inputs/Input";
import Select from "../../../../shared/components/Inputs/Select";
import Button from "../../../../shared/components/Button";
import Table from "../../../../shared/components/Table";
import type { TableColumn } from "../../../../shared/components/Table";
import { Toast } from "../../../../shared/utils/alerts"; // 👉 Importación del Toast de alertas
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faUserPlus,
    faEye,
    faPenToSquare,
    faToggleOn,
    faToggleOff,
    faTrash,
    faUsers,
    faFilter,
    faBox,
} from "@fortawesome/free-solid-svg-icons";

export const ClientsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("Todos");

    // Estados de los modales
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Filtrado de clientes en tiempo real
    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
            const normalizedSearch = searchTerm.toLowerCase();

            const matchesSearch =
                fullName.includes(normalizedSearch) ||
                client.documentNumber.includes(searchTerm) ||
                client.email.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "Todos" || client.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);
    
    // Configuración de paginación
    const totalPages = Math.max(
        1,
        Math.ceil(filteredClients.length / itemsPerPage)
    );

    // Clientes que se mostrarán en la página actual
    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;

        return filteredClients.slice(
            startIndex,
            startIndex + itemsPerPage
        );
    }, [filteredClients, currentPage, itemsPerPage]);

    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // Crear o editar cliente con mensajes / alertas Toast
    const handleSaveClient = (formData: ClientFormData) => {
        if (selectedClient) {
            setClients((previousClients) =>
                previousClients.map((client) =>
                    client.id === selectedClient.id
                        ? { ...client, ...formData }
                        : client
                )
            );
            // Mensaje de éxito al editar
            Toast.fire({
                icon: "success",
                title: `Cliente "${formData.firstName} ${formData.lastName}" actualizado con éxito`,
            });
        } else {
            const newClient: Client = {
                id: `cli-${Date.now()}`,
                ...formData,
                commercialHistory: {
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrderDate: "Sin compras",
                },
                createdAt: new Date().toISOString().split("T")[0],
            };

            setClients((previousClients) => [newClient, ...previousClients]);
            
            // Mensaje de éxito al registrar nuevo cliente
            Toast.fire({
                icon: "success",
                title: `Cliente "${formData.firstName} ${formData.lastName}" registrado exitosamente`,
            });
        }

        setSelectedClient(null);
        setIsFormModalOpen(false);
    };

    // Cambiar estado del cliente (Activo / Inactivo) con mensaje
    const handleToggleStatus = (id: string) => {
        setClients((previousClients) =>
            previousClients.map((client) => {
                if (client.id === id) {
                    const newStatus: ClientStatus =
                        client.status === "Activo" ? "Inactivo" : "Activo";

                    // Mensaje informativo al cambiar estado
                    Toast.fire({
                        icon: "info",
                        title: `Estado de ${client.firstName} cambiado a ${newStatus}`,
                    });

                    return { ...client, status: newStatus };
                }

                return client;
            })
        );
    };

    // Eliminar cliente con confirmación y mensaje
    const handleDeleteClient = (id: string, clientName: string) => {
        if (window.confirm(`¿Está seguro de eliminar a ${clientName} del sistema ISABEL?`)) {
            setClients((previousClients) =>
                previousClients.filter((client) => client.id !== id)
            );

            // Mensaje de advertencia/éxito al eliminar
            Toast.fire({
                icon: "success",
                title: "Cliente eliminado del sistema",
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const columns: TableColumn<Client>[] = [
        {
            key: "cliente",
            header: "Cliente / Razón Social",
            render: (client) => (
                <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                        {client.firstName} {client.lastName}
                    </div>
                    <div className="text-xs text-slate-400">
                        {client.email}
                    </div>
                </div>
            ),
        },
        {
            key: "documento",
            header: "Documento",
            render: (client) => (
                <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {client.documentType}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 ml-1.5">
                        {client.documentNumber}
                    </span>
                </div>
            ),
        },
        {
            key: "contacto",
            header: "Contacto",
            render: (client) => (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    <div>{client.phone}</div>
                    <div className="text-slate-400 truncate max-w-50">
                        {client.address}
                    </div>
                </div>
            ),
        },
        {
            key: "historial",
            header: "Historial (Pedidos)",
            align: "center",
            render: (client) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg">
                    <FontAwesomeIcon icon={faBox} />
                    {client.commercialHistory.totalOrders} pedidos
                </span>
            ),
        },
        {
            key: "estado",
            header: "Estado",
            render: (client) => (
                <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        client.status === "Activo"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                >
                    {client.status}
                </span>
            ),
        },
        {
            key: "acciones",
            header: "Acciones",
            align: "right",
            render: (client) => (
                <div className="flex items-center justify-end gap-1.5">
                    {/* Ver detalles */}
                    <button
                        type="button"
                        title="Ver detalle y compras"
                        aria-label={`Ver detalle de ${client.firstName}`}
                        onClick={() => {
                            setSelectedClient(client);
                            setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>

                    {/* Editar */}
                    <button
                        type="button"
                        title="Editar información"
                        aria-label={`Editar ${client.firstName}`}
                        onClick={() => {
                            setSelectedClient(client);
                            setIsFormModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>

                    {/* Cambiar estado */}
                    <button
                        type="button"
                        title="Cambiar estado"
                        aria-label={`Cambiar estado de ${client.firstName}`}
                        onClick={() => handleToggleStatus(client.id)}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400 cursor-pointer"
                    >
                        <FontAwesomeIcon
                            icon={client.status === "Activo" ? faToggleOn : faToggleOff}
                        />
                    </button>

                    {/* Eliminar */}
                    <button
                        type="button"
                        title="Eliminar cliente"
                        aria-label={`Eliminar ${client.firstName}`}
                        onClick={() => handleDeleteClient(client.id, `${client.firstName} ${client.lastName}`)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg text-red-600 dark:text-red-400 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-900 dark:bg-brand-royal text-white text-xs font-semibold rounded-md">
                            ISABEL • Módulo Ventas
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Paradise Shoes
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight mt-1">
                        Gestión de Clientes
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Administre la base de datos de compradores, empresas aliadas y su historial comercial.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    icon={faUserPlus}
                    className="shadow-md active:scale-95"
                    onClick={() => {
                        setSelectedClient(null);
                        setIsFormModalOpen(true);
                    }}
                >
                    Registrar Nuevo Cliente
                </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-slate-200 dark:border-[#3E3A4A] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">
                            Total Clientes
                        </p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                            {clients.length}
                        </h3>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl">
                        <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-slate-200 dark:border-[#3E3A4A] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">
                            Clientes Activos
                        </p>
                        <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {clients.filter((client) => client.status === "Activo").length}
                        </h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-slate-200 dark:border-[#3E3A4A] shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">
                            Volumen Comercial
                        </p>
                        <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {formatCurrency(
                                clients.reduce(
                                    (total, client) =>
                                        total + client.commercialHistory.totalSpent,
                                    0
                                )
                            )}
                        </h3>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <FontAwesomeIcon icon={faBox} className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Búsqueda y filtros */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-slate-200 dark:border-[#3E3A4A] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input
                    id="client-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchTerm(event.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Buscar por nombre, documento o correo..."
                    iconLeft={faMagnifyingGlass}
                    size="md"
                    containerClassName="w-full md:max-w-96"
                    className="text-slate-900 dark:text-white placeholder:text-slate-400"
                    aria-label="Buscar clientes"
                />

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <FontAwesomeIcon
                        icon={faFilter}
                        className="w-4 h-4 text-slate-400 shrink-0"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        Estado:
                    </span>

                    <Select
                        id="client-status-filter"
                        value={statusFilter}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            setStatusFilter(event.target.value);
                            setCurrentPage(1);
                        }}
                        size="sm"
                        containerClassName="w-full md:w-40"
                        className="text-slate-900 dark:text-white"
                        aria-label="Filtrar clientes por estado"
                        options={[
                            { value: "Todos", label: "Todos" },
                            { value: "Activo", label: "Activos" },
                            { value: "Inactivo", label: "Inactivos" },
                        ]}
                    />
                </div>
            </div>

            {/* Tabla de clientes */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-[#3E3A4A] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table<Client>
                        columns={columns}
                        data={paginatedClients}
                        rowKey="id"
                        isLoading={false}
                        emptyTitle="No hay clientes registrados"
                        emptyDescription="No se encontraron clientes con los filtros de búsqueda actuales."
                        containerClassName="w-full"
                        hoverable={true}
                        pagination={{
                            currentPage: currentPage,
                            totalPages: totalPages,
                            totalItems: filteredClients.length,
                            itemsPerPage: itemsPerPage,

                            onPageChange: (page) => {
                                setCurrentPage(page);
                            },

                            onItemsPerPageChange: (size) => {
                                setItemsPerPage(size);
                                setCurrentPage(1);
                            },

                            pageSizeOptions: [5, 10, 20, 50],
                        }}
                    />
                </div>
            </div>

            {/* Modales */}
            <ClientModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setSelectedClient(null);
                }}
                onSave={handleSaveClient}
                clientToEdit={selectedClient}
            />

            <ClientDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                client={selectedClient}
            />
        </div>
    );
};

export default ClientsPage;