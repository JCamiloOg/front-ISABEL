import React, { useCallback, useEffect, useMemo, useState } from "react";
import Input from "../../../../shared/components/Inputs/Input";
import Select from "../../../../shared/components/Inputs/Select";
import Button from "../../../../shared/components/Button";
import Modal from "../../../../shared/components/Modal";
import Table, { type SortDirection } from "../../../../shared/components/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserPlus,
  faUsers,
  faEye,
  faPenToSquare,
  faTrashCan,
  faArrowRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { isAxiosError } from "axios";
import { Toast, MySwal } from "../../../../shared/utils/alerts";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByID,
  updateStatusUser,
  updateUser,
  type DocumentTypeOption,
  type RoleOption,
  type UserPayload,
  type UserPayloadByID,
} from "./services/usersServices";

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserPayload[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  // Paginación y ordenamiento
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  // Modal Detalle
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserPayloadByID | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Modal Crear / Editar
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserPayload | null>(null);
  const [formDocumentTypeId, setFormDocumentTypeId] = useState<string>("");
  const [formIdentityDocument, setFormIdentityDocument] = useState<string>("");
  const [formFirstName, setFormFirstName] = useState<string>("");
  const [formLastName, setFormLastName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formAddress, setFormAddress] = useState<string>("");
  const [formRoleId, setFormRoleId] = useState<string>("");
  const [formPassword, setFormPassword] = useState<string>("");
  const [isPasswordManuallyEdited, setIsPasswordManuallyEdited] = useState<boolean>(false);

  // ── GET /users ──
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      if (response.status === 200) {
        setUsers(response.data.users || []);
        setRoles(response.data.roles || []);
        setDocumentTypes(response.data.documentTypes || []);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener los usuarios.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  // Solo colaboradores internos (excluye el rol "Cliente")
  const internalUsers = useMemo(() => {
    return users.filter(
      (u) => (u.role?.name || "").trim().toLowerCase() !== "cliente"
    );
  }, [users]);

  // Roles internos disponibles para el formulario y filtro
  const internalRoles = useMemo(() => {
    return roles.filter((r) => r.name.trim().toLowerCase() !== "cliente");
  }, [roles]);


  // ── GET /users/:identityDocument ──
  const handleOpenDetail = async (identityDocument: string) => {
    try {
      setIsLoadingDetail(true);
      setIsDetailOpen(true);
      const response = await getUserByID(identityDocument);
      if (response.status === 200) {
        setSelectedUser(response.data.users || null);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al obtener el detalle del usuario.",
        });
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ── Abrir Modal Crear / Editar ──
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormDocumentTypeId(documentTypes[0] ? String(documentTypes[0].id) : "1");
    setFormIdentityDocument("");
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormRoleId(internalRoles[0] ? String(internalRoles[0].id) : "");
    setFormPassword("");
    setIsPasswordManuallyEdited(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserPayload) => {
    setEditingUser(user);
    setFormDocumentTypeId(String(user.documentTypeId));
    setFormIdentityDocument(user.identityDocument);
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormAddress(user.address || "");
    setFormRoleId(user.roleId ? String(user.roleId) : "");
    setFormPassword("");
    setIsPasswordManuallyEdited(false);
    setIsFormOpen(true);
  };

  // ── POST / PUT Usuario ──
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formDocumentTypeId ||
      !formIdentityDocument.trim() ||
      !formFirstName.trim() ||
      !formLastName.trim() ||
      !formEmail.trim() ||
      !formPhone.trim() ||
      !formRoleId
    ) {
      Toast.fire({
        icon: "warning",
        title: "Completa todos los campos obligatorios.",
      });
      return;
    }

    const finalPassword = formPassword.trim() || (!editingUser ? formIdentityDocument.trim() : "");

    if (!editingUser && !finalPassword) {
      Toast.fire({
        icon: "warning",
        title: "Asigna una contraseña para el nuevo colaborador.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const baseData = {
        documentTypeId: Number(formDocumentTypeId),
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        address: formAddress.trim() || null,
        roleId: Number(formRoleId),
        ...(finalPassword ? { password: finalPassword } : {}),
      };

      if (editingUser) {
        const res = await updateUser(editingUser.identityDocument, baseData);
        if (res.status === 200) {
          Toast.fire({
            icon: "success",
            title: res.data?.message || "Usuario actualizado exitosamente!",
          });
          setIsFormOpen(false);
          fetchUsers();
        }
      } else {
        const res = await createUser({
          identityDocument: formIdentityDocument.trim(),
          ...baseData,
        });
        if (res.status === 201) {
          Toast.fire({
            icon: "success",
            title: res.data?.message || "Usuario registrado exitosamente",
          });
          setIsFormOpen(false);
          fetchUsers();
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al guardar el usuario.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── PATCH /users/status/:identityDocument ──
  const handleToggleStatus = async (user: UserPayload) => {
    const newStatus = !user.status;
    try {
      const res = await updateStatusUser(user.identityDocument, newStatus);
      if (res.status === 200) {
        Toast.fire({
          icon: "success",
          title: res.data?.message || `Usuario ${newStatus ? "activado" : "desactivado"}`,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.identityDocument === user.identityDocument ? { ...u, status: newStatus } : u
          )
        );
      }
    } catch (error) {
      if (isAxiosError(error)) {
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Error al actualizar estado.",
        });
      }
    }
  };

  // ── DELETE /users/:identityDocument ──
  const handleDeleteUser = (user: UserPayload) => {
    MySwal.fire({
      title: "¿Eliminar colaborador?",
      text: `¿Seguro que deseas eliminar a "${user.firstName} ${user.lastName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteUser(user.identityDocument);
          if (res.status === 200) {
            Toast.fire({
              icon: "success",
              title: res.data?.message || "Usuario eliminado exitosamente.",
            });
            fetchUsers();
          }
        } catch (error) {
          if (isAxiosError(error)) {
            Toast.fire({
              icon: "error",
              title:
                error.response?.data?.message ||
                "No se puede eliminar el usuario porque tiene movimientos asociados.",
            });
          }
        }
      }
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("Todos");
    setStatusFilter("Todos");
    setCurrentPage(1);
  };

  // Filtrado
  const filteredUsers = useMemo(() => {
    return internalUsers.filter((u) => {
      if (roleFilter !== "Todos" && u.role?.name !== roleFilter) return false;
      if (statusFilter === "Activo" && !u.status) return false;
      if (statusFilter === "Inactivo" && u.status) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        u.identityDocument.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [internalUsers, searchTerm, roleFilter, statusFilter]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || roleFilter !== "Todos" || statusFilter !== "Todos"
  );

  // Ordenamiento
  const sortedUsers = useMemo(() => {
    if (!sortKey || !sortDir) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "identityDocument") {
        cmp = a.identityDocument.localeCompare(b.identityDocument);
      } else if (sortKey === "name") {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortKey === "role") {
        cmp = (a.role?.name || "").localeCompare(b.role?.name || "");
      } else if (sortKey === "status") {
        cmp = Number(a.status) - Number(b.status);
      } else if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredUsers, sortKey, sortDir]);

  // Paginación
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, activePage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-royal/10 dark:bg-brand-sky/15 flex items-center justify-center text-brand-royal dark:text-brand-sky text-xl">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-text">
              Usuarios del Sistema
            </h1>
            <p className="text-sm text-app-muted">
              Directorio de colaboradores internos (Administradores y Bodegueros)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={faArrowRotateRight}
            onClick={fetchUsers}
            disabled={isLoading}
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            icon={faUserPlus}
            onClick={handleOpenCreate}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* ─── Filtros ─── */}
      <div className="isabel-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre, documento o correo..."
              iconLeft={
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-app-muted text-sm" />
              }
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "Todos", label: "Rol: Todos" },
                ...internalRoles.map((r) => ({
                  value: r.name,
                  label: r.name,
                })),
              ]}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "Todos", label: "Estado: Todos" },
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-2 border-t border-app-border/60 flex items-center justify-between text-xs text-app-muted">
            <span>
              Mostrando {filteredUsers.length} de {internalUsers.length} colaboradores
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
      </div>

      {/* ─── Tabla Principal ─── */}
      <Table>
        <Table.Table>
          <Table.Thead>
            <Table.Row head>
              <Table.SortableCell
                sortKey="identityDocument"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Documento
              </Table.SortableCell>
              <Table.SortableCell
                sortKey="name"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Colaborador
              </Table.SortableCell>
              <th className="px-4 py-3 font-bold select-none text-app-muted text-xs uppercase tracking-wider">
                Teléfono
              </th>
              <Table.SortableCell
                sortKey="role"
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                className="text-center"
              >
                Rol
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
              Array.from({ length: 5 }).map((_, idx) => (
                <Table.Row key={`skeleton-${idx}`}>
                  <Table.Cell rounded="left" colSpan={6} className="py-4">
                    <div className="h-4 w-full rounded-md bg-app-border/70 animate-pulse" />
                  </Table.Cell>
                </Table.Row>
              ))
            ) : paginatedUsers.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={
                  hasActiveFilters
                    ? "No se encontraron colaboradores con los filtros seleccionados."
                    : "No hay usuarios registrados en el sistema."
                }
              />
            ) : (
              paginatedUsers.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`.trim();
                const isAdmin = user.role?.name.toLowerCase() === "administrador";

                return (
                  <Table.Row
                    key={user.identityDocument}
                    onClick={() => handleOpenDetail(user.identityDocument)}
                  >
                    <Table.Cell rounded="left">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-brand-royal dark:text-brand-sky">
                          {user.identityDocument}
                        </span>
                        <span className="text-[10px] text-app-muted">
                          {user.documentType?.documentType || "CC"}
                        </span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-app-text">{fullName}</span>
                        <span className="text-[11px] text-app-muted">{user.email}</span>
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <span className="font-mono text-xs text-app-muted">{user.phone}</span>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${isAdmin
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                      >
                        {user.role?.name || "Sin rol"}
                      </span>
                    </Table.Cell>

                    <Table.Cell className="text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(user);
                        }}
                        title="Clic para cambiar estado"
                        className="inline-flex items-center gap-1.5 rounded-full cursor-pointer transition-transform hover:scale-105"
                      >
                        {user.status ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400">
                            <span className="size-1.5 rounded-full bg-rose-500" />
                            Inactivo
                          </span>
                        )}
                      </button>
                    </Table.Cell>

                    <Table.Cell rounded="right" className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faEye}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(user.identityDocument);
                          }}
                          title="Ver detalle"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faPenToSquare}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(user);
                          }}
                          title="Editar"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={faTrashCan}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          title="Eliminar"
                        />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Tbody>
        </Table.Table>

        <Table.Pagination
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={itemsPerPage}
          pageSizeOptions={[5, 8, 12, 20]}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Table>

      {/* ─── Modal Detalle Usuario ─── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUser(null);
        }}
        title={
          selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : "Detalle del Usuario"
        }
        description={
          selectedUser
            ? `${selectedUser.documentType?.documentType || "Doc"}: ${selectedUser.identityDocument}`
            : "Cargando información..."
        }
        size="md"
        footer={
          <div className="flex w-full justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsDetailOpen(false)}>
              Cerrar
            </Button>
          </div>
        }
      >
        {isLoadingDetail || !selectedUser ? (
          <div className="space-y-3 py-2">
            <div className="h-4 w-3/4 rounded bg-app-border/70 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-app-border/70 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-app-border bg-app-surface-alt p-4 text-xs">
            <div>
              <p className="text-app-muted font-semibold">Correo</p>
              <p className="font-bold text-app-text mt-0.5 break-all">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-app-muted font-semibold">Teléfono</p>
              <p className="font-bold text-app-text mt-0.5">{selectedUser.phone}</p>
            </div>
            <div>
              <p className="text-app-muted font-semibold">Rol</p>
              <p className="font-bold text-brand-royal dark:text-brand-sky mt-0.5">
                {selectedUser.role?.name || "Sin rol"}
              </p>
            </div>
            <div>
              <p className="text-app-muted font-semibold">Estado</p>
              <p className="font-bold text-app-text mt-0.5">
                {selectedUser.status ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-app-muted font-semibold">Dirección</p>
              <p className="font-bold text-app-text mt-0.5">
                {selectedUser.address || "No registrada"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Modal Crear / Editar Usuario ─── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? "Editar Colaborador" : "Nuevo Colaborador"}
        description="Completa la información personal y el rol de acceso al sistema"
        size="lg"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveUser}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de Documento *"
              value={formDocumentTypeId}
              onChange={(e) => setFormDocumentTypeId(e.target.value)}
              options={documentTypes.map((dt) => ({
                value: String(dt.id),
                label: dt.documentType,
              }))}
            />
            <Input
              label="Número de Documento *"
              placeholder="Ej. 1017100005"
              maxLength={20}
              value={formIdentityDocument}
              onChange={(e) => {
                const newDoc = e.target.value;
                setFormIdentityDocument(newDoc);
                if (!editingUser && !isPasswordManuallyEdited) {
                  setFormPassword(newDoc);
                }
              }}
              disabled={Boolean(editingUser)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombres *"
              placeholder="Ej. Laura Marcela"
              maxLength={120}
              value={formFirstName}
              onChange={(e) => setFormFirstName(e.target.value)}
              required
            />
            <Input
              label="Apellidos *"
              placeholder="Ej. Mejía Valencia"
              maxLength={120}
              value={formLastName}
              onChange={(e) => setFormLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="email"
              label="Correo Electrónico *"
              placeholder="colaborador@calzadostore.co"
              maxLength={150}
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <Input
              label="Teléfono *"
              placeholder="Ej. 3001112233"
              maxLength={20}
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Rol Asignado *"
              value={formRoleId}
              onChange={(e) => setFormRoleId(e.target.value)}
              options={internalRoles.map((r) => ({
                value: String(r.id),
                label: r.name,
              }))}
            />
            <Input
              type="password"
              label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña (por defecto: numero de documento) *"}
              placeholder={editingUser ? "Dejar vacío para conservar actual" : "Por defecto será el documento"}
              maxLength={200}
              value={formPassword}
              onChange={(e) => {
                setFormPassword(e.target.value);
                setIsPasswordManuallyEdited(true);
              }}
            />
          </div>

          <Input
            label="Dirección"
            placeholder="Ej. Cra 43A # 14-25, Medellín"
            maxLength={255}
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;