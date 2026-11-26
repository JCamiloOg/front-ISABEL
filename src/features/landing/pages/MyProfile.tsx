import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faEnvelope,
  faPhone,
  faLocationDot,
  faCalendarCheck,
  faPenToSquare,
  faFloppyDisk,
  faXmark,
  faShieldHalved,
  faCheckCircle,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Toast } from "../../../shared/utils/alerts";

interface ClientProfileData {
  identityDocument: string;
  documentTypeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
  createdAt: string;
}

const DOCUMENT_TYPES: Record<number, string> = {
  1: "Cédula de Ciudadanía",
  2: "Cédula de Extranjería",
  3: "Pasaporte",
  4: "NIT",
  5: "Tarjeta de Identidad",
};

const INITIAL_CLIENT_DATA: ClientProfileData = {
  identityDocument: "1036945821",
  documentTypeId: 1,
  firstName: "Valentina",
  lastName: "Restrepo Gómez",
  email: "valentina.restrepo@correo.com",
  phone: "314 582 9041",
  address: "Cra 43A # 18-45, Apto 602, El Poblado, Medellín",
  status: true,
  createdAt: "2025-02-14T15:30:00.000Z",
};

export default function MyProfile() {
  const [profile, setProfile] = useState<ClientProfileData>(INITIAL_CLIENT_DATA);
  const [draft, setDraft] = useState<ClientProfileData>(INITIAL_CLIENT_DATA);
  const [isEditing, setIsEditing] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();

  const formattedCreatedAt = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(profile.createdAt));

  const handleStartEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim() || !draft.phone.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Por favor completa los campos obligatorios.",
      });
      return;
    }

    setProfile(draft);
    setIsEditing(false);
    Toast.fire({
      icon: "success",
      title: "Perfil actualizado correctamente.",
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      Toast.fire({
        icon: "warning",
        title: "Completa todos los campos de contraseña.",
      });
      return;
    }
    if (passwords.next.length < 6) {
      Toast.fire({
        icon: "warning",
        title: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      Toast.fire({
        icon: "error",
        title: "Las contraseñas nuevas no coinciden.",
      });
      return;
    }

    setPasswords({ current: "", next: "", confirm: "" });
    Toast.fire({
      icon: "success",
      title: "Contraseña actualizada correctamente.",
    });
  };

  return (
    <div className="min-h-screen bg-app-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Encabezado / Hero del Perfil */}
        <div className="relative overflow-hidden rounded-3xl border border-app-border bg-app-surface shadow-sm">
          <div className="h-28 bg-linear-to-r from-brand-royal via-brand-royal/90 to-brand-sky/80" />
          <div className="px-6 pb-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
              <div className="flex items-end gap-4">
                <div className="flex size-24 md:mb-3 mb-10 shrink-0 items-center justify-center rounded-2xl border-4 border-app-surface bg-brand-royal text-white text-2xl font-black shadow-md">
                  {initials || <FontAwesomeIcon icon={faUser} />}
                </div>
                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-black text-app-text tracking-tight">
                      {fullName}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${profile.status
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
                      {profile.status ? "Cuenta Activa" : "Cuenta Inactiva"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-app-muted mt-0.5">
                    {profile.email}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={faPenToSquare}
                  onClick={handleStartEdit}
                  className="self-start sm:self-auto"
                >
                  Editar perfil
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Información de Identificación y Cuenta */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-app-border/70">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                  <FontAwesomeIcon icon={faIdCard} className="text-sm" />
                </div>
                <h2 className="text-sm font-bold text-app-text">Identificación</h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-app-muted block mb-0.5">Tipo de documento</span>
                  <span className="font-semibold text-app-text">
                    {DOCUMENT_TYPES[profile.documentTypeId] || `Tipo #${profile.documentTypeId}`}
                  </span>
                </div>

                <div>
                  <span className="text-app-muted block mb-0.5">Número de documento</span>
                  <span className="font-mono font-bold text-app-text text-sm">
                    {profile.identityDocument}
                  </span>
                </div>

                <div className="pt-2 border-t border-app-border/60 flex items-center gap-2 text-app-muted">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-brand-royal dark:text-brand-sky" />
                  <div>
                    <span className="block text-[11px]">Miembro desde</span>
                    <span className="font-semibold text-app-text">{formattedCreatedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seguridad / Cambio de Contraseña */}
            <form
              onSubmit={handleUpdatePassword}
              className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-app-border/70">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-app-text">Seguridad</h2>
                  <p className="text-[11px] text-app-muted">Actualiza tu contraseña</p>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  label="Contraseña actual"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  size="sm"
                />
                <Input
                  label="Nueva contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={passwords.next}
                  onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  size="sm"
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  size="sm"
                />
              </div>

              <Button type="submit" variant="outline" size="sm" icon={faKey} className="w-full">
                Cambiar contraseña
              </Button>
            </form>
          </div>

          {/* Columna Derecha: Datos Personales y de Contacto */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-app-border/70">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                    <FontAwesomeIcon icon={faUser} className="text-sm" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-app-text">Información Personal</h2>
                    <p className="text-xs text-app-muted">
                      {isEditing
                        ? "Modifica tus datos personales y de contacto"
                        : "Tus datos registrados en la tienda"}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={faXmark}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="sm" icon={faFloppyDisk}>
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <Input
                      label="Nombres *"
                      value={draft.firstName}
                      onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                    />
                    <Input
                      label="Apellidos *"
                      value={draft.lastName}
                      onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                    />
                    <Input
                      label="Correo electrónico *"
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                      iconLeft={<FontAwesomeIcon icon={faEnvelope} className="text-app-muted text-xs" />}
                    />
                    <Input
                      label="Teléfono *"
                      value={draft.phone}
                      onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                      iconLeft={<FontAwesomeIcon icon={faPhone} className="text-app-muted text-xs" />}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Dirección de envío"
                        value={draft.address}
                        onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                        iconLeft={<FontAwesomeIcon icon={faLocationDot} className="text-app-muted text-xs" />}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted block mb-1">
                        Nombres
                      </span>
                      <span className="text-sm font-bold text-app-text">{profile.firstName}</span>
                    </div>

                    <div className="rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted block mb-1">
                        Apellidos
                      </span>
                      <span className="text-sm font-bold text-app-text">{profile.lastName}</span>
                    </div>

                    <div className="rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className="text-[10px]" />
                        Correo electrónico
                      </span>
                      <span className="text-sm font-semibold text-app-text break-all">
                        {profile.email}
                      </span>
                    </div>

                    <div className="rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1">
                        <FontAwesomeIcon icon={faPhone} className="text-[10px]" />
                        Teléfono
                      </span>
                      <span className="text-sm font-semibold text-app-text">{profile.phone}</span>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-app-muted flex items-center gap-1.5 mb-1">
                        <FontAwesomeIcon icon={faLocationDot} className="text-[10px]" />
                        Dirección
                      </span>
                      <span className="text-sm font-semibold text-app-text">
                        {profile.address || "Sin dirección registrada"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
