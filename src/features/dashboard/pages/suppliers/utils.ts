import type { SupplierFormErrors, SupplierForm, Supplier } from "./types";

export function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function cleanDocument(doc: string): string {
  return doc.replace(/[^\w]/g, "").toLowerCase().trim();
}

export function validateEmail(email: string): boolean {
  if (!email.trim()) return true; // si está vacío no falla aquí (se valida opcional)
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function validateSupplierForm(
  form: SupplierForm,
  proveedores: Supplier[],
  idEditando?: string,
): SupplierFormErrors {
  const errores: SupplierFormErrors = {};

  // 1. Tipo de documento
  if (!form.documentType) {
    errores.documentType = "Selecciona el tipo de documento.";
  }

  // 2. Número de documento obligatorio y sin duplicados
  const docLimpio = cleanDocument(form.documentNumber);
  if (!form.documentNumber.trim()) {
    errores.documentNumber = "El número de documento es obligatorio.";
  } else if (docLimpio.length < 5) {
    errores.documentNumber = "Ingresa un número de documento válido (mínimo 5 caracteres).";
  } else {
    const duplicado = proveedores.find(
      (p) =>
        cleanDocument(p.documentNumber) === docLimpio &&
        p.id !== idEditando,
    );
    if (duplicado) {
      errores.documentNumber = `Ya existe un proveedor con este documento (${duplicado.businessName}).`;
    }
  }

  // 3. Razón Social obligatoria
  if (!form.businessName.trim()) {
    errores.businessName = "La razón social o nombre del proveedor es obligatorio.";
  } else if (form.businessName.trim().length < 3) {
    errores.businessName = "La razón social debe tener al menos 3 caracteres.";
  }

  // 4. Tipo de proveedor
  if (!form.supplierType) {
    errores.supplierType = "Selecciona si es persona Natural o Jurídica.";
  }

  // 5. Validación de Correo Electrónico
  if (form.email.trim() && !validateEmail(form.email)) {
    errores.email = "Ingresa una dirección de correo electrónico válida (ej: contacto@empresa.com).";
  }

  return errores;
}

