import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faEnvelope,
    faKey,
    faLock,
    faCheck,
    faRotateRight,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../../shared/components/Inputs/Input";
import Button from "../../../shared/components/Button";

type Step = 1 | 2 | 3 | 4;

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>(1);

    // Datos del formulario
    const [email, setEmail] = useState("");
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Errores y estados de carga
    const [emailError, setEmailError] = useState("");
    const [codeError, setCodeError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Refs para el input de código de 6 dígitos
    const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Paso 1: Enviar correo
    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");

        if (!email.trim() || !email.includes("@")) {
            setEmailError("Por favor ingresa un correo electrónico válido");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 600);
    };

    // Control de inputs de código (auto-focus al escribir o borrar)
    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        setCodeError("");

        if (value && index < 5) {
            codeInputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            codeInputsRef.current[index - 1]?.focus();
        }
    };

    const handlePasteCode = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);
        if (pastedData.length < 6) {
            codeInputsRef.current[pastedData.length]?.focus();
        } else {
            codeInputsRef.current[5]?.focus();
        }
    };

    // Paso 2: Validar código
    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError("");

        const fullCode = code.join("");
        if (fullCode.length < 6) {
            setCodeError("Por favor ingresa el código completo de 6 dígitos");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(3);
        }, 600);
    };

    // Paso 3: Guardar nueva contraseña
    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(4); // Pantalla de éxito
        }, 700);
    };

    return (
        <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
            {/* Luces sutiles decorativas de fondo */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-sky/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-royal/15 rounded-full blur-3xl pointer-events-none" />

            {/* Tarjeta Central */}
            <div className="w-full max-w-lg bg-app-surface text-app-text rounded-3xl border border-app-border shadow-2xl p-7 sm:p-10 relative z-10 transition-all duration-300">
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-app-border">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-app-muted hover:text-brand-royal dark:hover:text-brand-sky transition-colors group"
                    >
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            className="text-xs transition-transform duration-200 group-hover:-translate-x-1"
                        />
                        <span>Volver al inicio de sesión</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <img
                            src="/Logo Isabel Zapatos.svg"
                            alt="Logo Isabel"
                            className="h-7 w-auto object-contain"
                        />
                        <span className="text-xs font-bold tracking-tight text-brand-navy dark:text-white">
                            ISABEL
                        </span>
                    </div>
                </div>

                {/* Stepper Visual (Pasos 1, 2, 3) */}
                {step !== 4 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                            {/* Línea conectora de fondo */}
                            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-app-border z-0" />
                            {/* Línea de progreso coloreada */}
                            <div
                                className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-brand-royal dark:bg-brand-sky z-0 transition-all duration-500 ease-out"
                                style={{
                                    width: step === 1 ? "0%" : step === 2 ? "50%" : "calc(100% - 3rem)",
                                }}
                            />

                            {/* Paso 1: Correo */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > 1
                                            ? "bg-brand-royal text-white"
                                            : step === 1
                                                ? "bg-brand-royal text-white ring-4 ring-brand-sky/30 shadow-md"
                                                : "bg-app-surface border-2 border-app-border text-app-muted"
                                        }`}
                                >
                                    {step > 1 ? <FontAwesomeIcon icon={faCheck} /> : "1"}
                                </div>
                                <span
                                    className={`text-[11px] font-semibold transition-colors ${step >= 1 ? "text-brand-royal dark:text-brand-sky font-bold" : "text-app-muted"
                                        }`}
                                >
                                    Correo
                                </span>
                            </div>

                            {/* Paso 2: Código */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > 2
                                            ? "bg-brand-royal text-white"
                                            : step === 2
                                                ? "bg-brand-royal text-white ring-4 ring-brand-sky/30 shadow-md"
                                                : "bg-app-surface border-2 border-app-border text-app-muted"
                                        }`}
                                >
                                    {step > 2 ? <FontAwesomeIcon icon={faCheck} /> : "2"}
                                </div>
                                <span
                                    className={`text-[11px] font-semibold transition-colors ${step >= 2 ? "text-brand-royal dark:text-brand-sky font-bold" : "text-app-muted"
                                        }`}
                                >
                                    Código
                                </span>
                            </div>

                            {/* Paso 3: Contraseña */}
                            <div className="flex flex-col items-center gap-1.5 z-10">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 3
                                            ? "bg-brand-royal text-white ring-4 ring-brand-sky/30 shadow-md"
                                            : "bg-app-surface border-2 border-app-border text-app-muted"
                                        }`}
                                >
                                    3
                                </div>
                                <span
                                    className={`text-[11px] font-semibold transition-colors ${step === 3 ? "text-brand-royal dark:text-brand-sky font-bold" : "text-app-muted"
                                        }`}
                                >
                                    Contraseña
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================
                    PASO 1: INGRESAR CORREO ELECTRÓNICO
                ========================================= */}
                {step === 1 && (
                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <div className="space-y-1.5">
                            <span className="section-subtitle">
                                Paso 1 de 3
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-app-text tracking-tight">
                                Recuperar tu contraseña
                            </h2>
                            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                                Ingresa el correo asociado a tu cuenta de Calzado Isabel. Te enviaremos un código de seguridad para verificar tu identidad.
                            </p>
                        </div>

                        <Input
                            id="recovery-email"
                            type="email"
                            label="Correo Electrónico"
                            placeholder="ejemplo@isabel.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            iconLeft={faEnvelope}
                            error={emailError}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            loadingText="Enviando código..."
                            className="shadow-lg shadow-brand-royal/20"
                        >
                            Enviar Código de Verificación
                        </Button>
                    </form>
                )}

                {/* =========================================
                    PASO 2: CÓDIGO ENVIADO AL CORREO (6 DÍGITOS)
                ========================================= */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        <div className="space-y-1.5">
                            <span className="section-subtitle">
                                Paso 2 de 3
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-app-text tracking-tight">
                                Ingresa el código de 6 dígitos
                            </h2>
                            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                                Enviamos un código de seguridad a{" "}
                                <span className="font-semibold text-app-text">{email}</span>.
                            </p>
                        </div>

                        {/* Inputs de 6 Dígitos */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-app-text">
                                Código de Verificación
                            </label>
                            <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePasteCode}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            codeInputsRef.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`w-full h-12 sm:h-14 text-center font-extrabold text-lg sm:text-xl rounded-xl bg-app-surface border transition-all text-app-text ${digit
                                                ? "border-brand-royal dark:border-brand-sky bg-brand-sky/10 ring-2 ring-brand-sky/30"
                                                : "border-app-border focus:border-brand-royal dark:focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/30"
                                            } ${codeError ? "border-rose-500! ring-rose-500/20! text-rose-500" : ""}`}
                                    />
                                ))}
                            </div>
                            {codeError && (
                                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                                    {codeError}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-app-muted">¿No recibiste el correo?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setCode(["", "", "", "", "", ""]);
                                    codeInputsRef.current[0]?.focus();
                                }}
                                className="font-bold text-brand-royal dark:text-brand-sky hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
                                <span>Reenviar código</span>
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                onClick={() => setStep(1)}
                                className="w-1/3"
                            >
                                Cambiar Correo
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={isLoading}
                                loadingText="Verificando..."
                                className="w-2/3 shadow-lg shadow-brand-royal/20"
                            >
                                Validar Código
                            </Button>
                        </div>
                    </form>
                )}

                {/* =========================================
                    PASO 3: NUEVA CONTRASEÑA
                ========================================= */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-1.5">
                            <span className="section-subtitle">
                                Paso 3 de 3
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-app-text tracking-tight">
                                Restablecer contraseña
                            </h2>
                            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                                Elige una nueva contraseña segura para proteger tu cuenta de Calzado Isabel.
                            </p>
                        </div>

                        <Input
                            id="new-password"
                            type="password"
                            label="Nueva Contraseña"
                            placeholder="Mínimo 8 caracteres"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            iconLeft={faLock}
                            helper="Usa al menos 8 caracteres con letras y números"
                        />

                        <Input
                            id="confirm-new-password"
                            type="password"
                            label="Confirmar Contraseña"
                            placeholder="Repite tu nueva contraseña"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            iconLeft={faKey}
                            error={passwordError}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            loadingText="Guardando cambios..."
                            className="shadow-lg shadow-brand-royal/20"
                        >
                            Guardar Nueva Contraseña
                        </Button>
                    </form>
                )}

                {/* =========================================
                    PASO 4: ÉXITO Y REDIRECCIÓN
                ========================================= */}
                {step === 4 && (
                    <div className="text-center py-4 space-y-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-app-text tracking-tight">
                                ¡Contraseña actualizada con éxito!
                            </h2>
                            <p className="text-sm text-app-muted max-w-sm mx-auto leading-relaxed">
                                Tu nueva contraseña ha sido guardada de forma segura. Ya puedes acceder a tu cuenta de Calzado Isabel.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Link to="/login" className="block w-full">
                                <Button variant="primary" size="lg" fullWidth className="shadow-lg shadow-brand-royal/20">
                                    Iniciar Sesión Ahora
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
