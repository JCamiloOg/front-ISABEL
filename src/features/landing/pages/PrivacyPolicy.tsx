import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faScaleBalanced,
  faUserLock,
  faDatabase,
  faEnvelopeOpenText,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const USER_RIGHTS = [
  "Conocer, actualizar y rectificar tus datos personales frente a información parcial, inexacta, incompleta o fraccionada.",
  "Solicitar prueba de la autorización otorgada para el tratamiento de tus datos, salvo las excepciones previstas en la ley.",
  "Ser informado respecto del uso que se le ha dado a tus datos personales.",
  "Presentar ante la Superintendencia de Industria y Comercio (SIC) quejas por infracciones a lo dispuesto en la Ley 1581 de 2012.",
  "Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías constitucionales y legales.",
  "Acceder en forma gratuita a tus datos personales que hayan sido objeto de tratamiento.",
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-app-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div
          data-aos="fade-up"
          className="rounded-3xl border border-app-border bg-app-surface p-6 sm:p-10 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
              <FontAwesomeIcon icon={faShieldHalved} className="text-2xl" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-brand-royal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-royal dark:text-brand-sky">
                Marco Legal Colombiano • Ley 1581 de 2012
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-app-text tracking-tight">
                Política de Privacidad y Tratamiento de Datos
              </h1>
              <p className="text-sm text-app-muted max-w-2xl">
                En cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 y el artículo 15 de la Constitución Política de Colombia (Habeas Data), protegemos tu información personal.
              </p>
            </div>
          </div>
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <h2 className="text-base font-bold text-app-text">1. Marco Normativo</h2>
            </div>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Esta política se rige por las disposiciones de la <strong className="text-app-text">Ley 1581 de 2012</strong> (Régimen General de Protección de Datos Personales), el <strong className="text-app-text">Decreto Reglamentario 1377 de 2013</strong> y demás normas concordantes de la República de Colombia.
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-royal/10 text-brand-royal dark:text-brand-sky">
                <FontAwesomeIcon icon={faDatabase} />
              </div>
              <h2 className="text-base font-bold text-app-text">2. Finalidad del Tratamiento</h2>
            </div>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
              Los datos recolectados (nombre, documento de identidad, correo, teléfono y dirección) se utilizan exclusivamente para gestionar pedidos, facturación, envíos, garantías, devoluciones y atención al cliente.
            </p>
          </div>
        </div>

        {/* Derechos del titular */}
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="rounded-2xl border border-app-border bg-app-surface p-6 sm:p-8 shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-3 border-b border-app-border/70 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <FontAwesomeIcon icon={faUserLock} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-app-text">3. Derechos de los Titulares</h2>
              <p className="text-xs text-app-muted">
                Como titular de tus datos personales, tienes derecho a:
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {USER_RIGHTS.map((right, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-app-border/70 bg-app-surface-alt/40 p-3.5 text-xs text-app-text leading-relaxed"
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-emerald-500 mt-0.5 shrink-0"
                />
                <span>{right}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Seguridad y Consultas */}
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xs space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <FontAwesomeIcon icon={faEnvelopeOpenText} />
            </div>
            <h2 className="text-base font-bold text-app-text">4. Consultas, Reclamos y Seguridad</h2>
          </div>
          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Implementamos medidas técnicas y administrativas para proteger tus datos contra acceso no autorizado, pérdida o alteración. Las consultas se atenderán en un término máximo de <strong className="text-app-text">10 días hábiles</strong> y los reclamos en un máximo de <strong className="text-app-text">15 días hábiles</strong> conforme a la Ley 1581 de 2012.
          </p>
        </div>
      </div>
    </div>
  );
}
