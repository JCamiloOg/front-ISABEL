import React, { useState, useMemo } from "react";
import type { Usuario, UsuarioFormData } from "../../../../@types/Users";
import { initialUsuarios, TIPOS_DOCUMENTO, ROLES_SISTEMA } from "../../../../data/mockUsers";
import { UserModal } from "./components/UserModal";
import { UserDetailModal } from "./components/UserDetailModal";
import Input from "../../../../shared/components/Inputs/Input";
import Select from "../../../../shared/components/Inputs/Select";
import Button from "../../../../shared/components/Button";
import Table, { type TableColumn } from "../../../../shared/components/Table";
import { Toast, MySwal } from "../../../../shared/utils/alerts";
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
  faUserShield,
  faBoxesPacking,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export const UsersPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filtrado de usuarios: sólo administradores y bodegueros (los clientes quedan estrictamente excluidos)
  const filteredUsers = useMemo(() => {
    return usuarios.filter((user) => {
      // Exclusión garantizada: solo roles 1 (Administrador) y 2 (Bodeguero)
      if (user.id_rol !== 1 && user.id_rol !== 2) return false;

      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        fullName.includes(normalizedSearch) ||
        user.documento_identidad.includes(searchTerm) ||
        user.correo.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter === "Todos" ||
        (roleFilter === "1" && user.id_rol === 1) ||
        (roleFilter === "2" && user.id_rol === 2);

      const matchesStatus =
        statusFilter === "Todos" ||
        (statusFilter === "Activo" && user.estado) ||
        (statusFilter === "Inactivo" && !user.estado);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usuarios, searchTerm, roleFilter, statusFilter]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Guardar usuario (Crear o Editar)
  const handleSaveUser = (formData: UsuarioFormData) => {
    const tipoDocObj = TIPOS_DOCUMENTO.find(
      (t) => t.id_tipo_documento === formData.id_tipo_documento
    );
    const rolObj = ROLES_SISTEMA.find((r) => r.id_rol === formData.id_rol);

    if (selectedUser) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === selectedUser.id_usuario
            ? {
                ...u,
                ...formData,
                tipo_documento: tipoDocObj,
                rol: rolObj,
              }
            : u
        )
      );

      Toast.fire({
        icon: "success",
        title: `Usuario "${formData.nombre} ${formData.apellido}" actualizado con éxito`,
      });
    } else {
      const nuevoUsuario: Usuario = {
        id_usuario: Date.now(),
        ...formData,
        fecha_creacion: new Date().toISOString(),
        tipo_documento: tipoDocObj,
        rol: rolObj,
      };

      setUsuarios((prev) => [nuevoUsuario, ...prev]);

      Toast.fire({
        icon: "success",
        title: `Usuario "${formData.nombre} ${formData.apellido}" registrado exitosamente`,
      });
    }

    setSelectedUser(null);
    setIsFormModalOpen(false);
  };

  // Alternar estado activo / inactivo con confirmación SweetAlert
  const handleToggleStatus = async (user: Usuario) => {
    const nuevoEstado = !user.estado;
    const accion = nuevoEstado ? "activar" : "desactivar";

    const result = await MySwal.fire({
      title: `¿Desea ${accion} este usuario?`,
      html: `
        <div class="text-left text-xs space-y-1">
          <p>Usuario: <strong class="text-[#0E2347] font-bold">${user.nombre} ${user.apellido}</strong></p>
          <p class="text-slate-500">Rol: <strong class="text-[#2B62D9] font-bold">${user.rol?.nombre}</strong></p>
          <p class="text-[11px] text-slate-400 pt-1">
            ${
              nuevoEstado
                ? "El usuario podrá volver a ingresar al sistema con sus credenciales."
                : "El acceso al sistema quedará suspendido temporalmente."
            }
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === user.id_usuario ? { ...u, estado: nuevoEstado } : u
        )
      );

      Toast.fire({
        icon: "info",
        title: `Usuario ${user.nombre} ahora está ${nuevoEstado ? "Activo" : "Inactivo"}`,
      });
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (user: Usuario) => {
    const result = await MySwal.fire({
      title: "¿Eliminar usuario definitivamente?",
      html: `
        <div class="text-left text-xs space-y-1">
          <p>Se eliminará a: <strong class="text-rose-600 font-bold">${user.nombre} ${user.apellido}</strong></p>
          <p class="text-slate-500">Documento: ${user.documento_identidad} • ${user.correo}</p>
          <p class="text-[11px] text-slate-400 pt-1">Esta acción removerá los accesos a la plataforma de Calzado ISABEL.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== user.id_usuario));

      Toast.fire({
        icon: "success",
        title: "Usuario eliminado del sistema",
      });
    }
  };

  // Formato fecha
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
      }).format(d);
    } catch {
      return isoString;
    }
  };

  // Columnas de la Tabla
  const columns: TableColumn<Usuario>[] = [
    {
      key: "usuario",
      header: "Usuario / Correo",
      render: (u) => (
        <div>
          <div className="font-bold text-app-text text-sm">
            {u.nombre} {u.apellido}
          </div>
          <div className="text-xs text-app-muted truncate max-w-56">{u.correo}</div>
        </div>
      ),
    },
    {
      key: "documento",
      header: "Documento",
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-app-text text-xs px-2 py-0.5 bg-app-surface-alt border border-app-border rounded-md">
            {u.tipo_documento?.codigo || "CC"}
          </span>
          <span className="text-xs text-app-muted font-mono">{u.documento_identidad}</span>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Rol del Sistema",
      align: "center",
      render: (u) => {
        const isAdmin = u.id_rol === 1;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              isAdmin
                ? "bg-brand-royal/10 text-brand-royal dark:text-brand-sky border-brand-royal/20"
                : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
            }`}
          >
            <FontAwesomeIcon icon={isAdmin ? faUserShield : faBoxesPacking} className="text-[10px]" />
            <span>{isAdmin ? "Administrador" : "Bodeguero"}</span>
          </span>
        );
      },
    },
    {
      key: "contacto",
      header: "Contacto / Dirección",
      render: (u) => (
        <div className="text-xs text-app-muted">
          <div className="text-app-text font-semibold">{u.telefono}</div>
          <div className="truncate max-w-44 text-[11px]">{u.direccion}</div>
        </div>
      ),
    },
    {
      key: "fecha",
      header: "Registro",
      render: (u) => (
        <span className="text-xs text-app-muted">{formatDate(u.fecha_creacion)}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (u) => (
        <span
          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            u.estado
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
          }`}
        >
          {u.estado ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Ver detalle */}
          <button
            type="button"
            title="Ver detalles"
            aria-label={`Ver detalle de ${u.nombre}`}
            onClick={() => {
              setSelectedUser(u);
              setIsDetailModalOpen(true);
            }}
            className="p-1.5 hover:bg-brand-sky/15 rounded-lg text-brand-royal dark:text-brand-sky cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* Editar */}
          <button
            type="button"
            title="Editar usuario"
            aria-label={`Editar ${u.nombre}`}
            onClick={() => {
              setSelectedUser(u);
              setIsFormModalOpen(true);
            }}
            className="p-1.5 hover:bg-indigo-500/15 rounded-lg text-indigo-600 dark:text-indigo-400 cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {/* Cambiar estado */}
          <button
            type="button"
            title={u.estado ? "Desactivar usuario" : "Activar usuario"}
            aria-label={`Cambiar estado de ${u.nombre}`}
            onClick={() => handleToggleStatus(u)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              u.estado
                ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                : "text-slate-400 hover:bg-slate-500/15"
            }`}
          >
            <FontAwesomeIcon icon={u.estado ? faToggleOn : faToggleOff} />
          </button>

          {/* Eliminar */}
          <button
            type="button"
            title="Eliminar usuario"
            aria-label={`Eliminar ${u.nombre}`}
            onClick={() => handleDeleteUser(u)}
            className="p-1.5 hover:bg-rose-500/15 rounded-lg text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-app-text animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-brand-navy text-white dark:bg-brand-royal text-xs font-bold rounded-md">
              ISABEL • Configuración
            </span>
            <span className="text-xs text-app-muted font-medium">Personal Interno</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-app-text">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-app-muted">
            Administre los accesos y credenciales de Administradores y Bodegueros del sistema Calzado ISABEL.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={faUserPlus}
          className="shadow-md shadow-brand-royal/20"
          onClick={() => {
            setSelectedUser(null);
            setIsFormModalOpen(true);
          }}
        >
          Registrar Nuevo Usuario
        </Button>
      </div>

      {/* ─── Métricas de Usuarios ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Personal */}
        <div className="isabel-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-app-muted">
              Total Personal
            </p>
            <h3 className="text-2xl font-black text-app-text mt-0.5">
              {usuarios.length}
            </h3>
            <span className="text-[11px] text-app-muted font-medium">Excluye clientes externos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faUsers} />
          </div>
        </div>

        {/* Administradores */}
        <div className="isabel-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
              Administradores
            </p>
            <h3 className="text-2xl font-black text-brand-royal dark:text-brand-sky mt-0.5">
              {usuarios.filter((u) => u.id_rol === 1).length}
            </h3>
            <span className="text-[11px] text-app-muted font-medium">Control total del sistema</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 text-brand-royal dark:text-brand-sky flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
        </div>

        {/* Bodegueros */}
        <div className="isabel-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Equipo de Bodega
            </p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {usuarios.filter((u) => u.id_rol === 2).length}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
              {usuarios.filter((u) => u.id_rol === 2 && u.estado).length} activos en turno
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-inner">
            <FontAwesomeIcon icon={faBoxesPacking} />
          </div>
        </div>
      </div>

      {/* ─── Búsqueda y Filtros ─── */}
      <div className="isabel-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <Input
          id="user-search"
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
          className="text-app-text placeholder:text-app-muted"
          aria-label="Buscar usuarios"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Filtro Rol */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUserShield} className="w-4 h-4 text-app-muted shrink-0" />
            <span className="text-xs font-semibold text-app-muted whitespace-nowrap">
              Rol:
            </span>
            <Select
              id="user-role-filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              size="sm"
              containerClassName="w-36"
              options={[
                { value: "Todos", label: "Todos los Roles" },
                { value: "1", label: "Administrador" },
                { value: "2", label: "Bodeguero" },
              ]}
            />
          </div>

          {/* Filtro Estado */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-app-muted shrink-0" />
            <span className="text-xs font-semibold text-app-muted whitespace-nowrap">
              Estado:
            </span>
            <Select
              id="user-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              size="sm"
              containerClassName="w-32"
              options={[
                { value: "Todos", label: "Todos" },
                { value: "Activo", label: "Activos" },
                { value: "Inactivo", label: "Inactivos" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ─── Tabla de Usuarios ─── */}
      <div className="isabel-card rounded-2xl overflow-hidden border border-app-border">
        <Table<Usuario>
          columns={columns}
          data={paginatedUsers}
          rowKey="id_usuario"
          isLoading={false}
          emptyTitle="No hay usuarios registrados"
          emptyDescription="No se encontraron colaboradores con los filtros de búsqueda seleccionados."
          containerClassName="w-full"
          hoverable={true}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: filteredUsers.length,
            itemsPerPage: itemsPerPage,
            onPageChange: (page) => setCurrentPage(page),
            onItemsPerPageChange: (size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            },
            pageSizeOptions: [5, 10, 20],
          }}
        />
      </div>

      {/* ─── Modales ─── */}
      <UserModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;
