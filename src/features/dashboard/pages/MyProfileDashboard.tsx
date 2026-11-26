import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faIdCard,
    faEnvelope,
    faPhone,
    faLocationDot,
    faCalendarCheck,
    faShieldHalved,
    faCheckCircle,
    faKey,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Inputs/Input";
import { Toast } from "../../../shared/utils/alerts";

interface DashboardProfileData {
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

const DASHBOARD_USER_DATA: DashboardProfileData = {
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

export default function MyProfileDashboard() {
    const profile = DASHBOARD_USER_DATA;

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
        <div className="space-y-6">
            {/* Encabezado del Perfil */}
            <div className="relative overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xs">
                <div className="h-24 bg-linear-to-r from-brand-royal via-brand-royal/90 to-brand-sky/80" />
                <div className="px-5 pb-5 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
                        <div className="flex items-end gap-4">
                            <div className="flex size-20 md:mb-3 mb-10 shrink-0 items-center justify-center rounded-2xl border-4 border-app-surface bg-brand-royal text-white text-xl font-black shadow-md">
                                {initials || <FontAwesomeIcon icon={faUser} />}
                            </div>
                            <div className="pb-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg sm:text-xl font-black text-app-text tracking-tight">
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
                                <p className="text-xs text-app-muted mt-0.5">{profile.email}</p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-app-border bg-app-surface-alt/60 px-3 py-1.5 text-[11px] font-semibold text-app-muted">
                            <FontAwesomeIcon icon={faLock} className="text-[10px]" />
                            Datos de solo lectura
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Columna Izquierda: Identificación y Cambio de Contraseña */}
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

                        <Button type="submit" variant="primary" size="sm" icon={faKey} className="w-full">
                            Cambiar contraseña
                        </Button>
                    </form>
                </div>

                {/* Columna Derecha: Información Personal (Solo Lectura) */}
                <div className="xl:col-span-2">
                    <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-app-border/70">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                                <FontAwesomeIcon icon={faUser} className="text-sm" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-app-text">Información Personal</h2>
                                <p className="text-xs text-app-muted">
                                    Consulta tus datos registrados en el sistema
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
