import type { ErroresProveedor, FormProveedor, Proveedor } from "./types";

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

export function limpiarDocumento(doc: string): string {
  return doc.replace(/[^\w]/g, "").toLowerCase().trim();
}

export function validarEmail(email: string): boolean {
  if (!email.trim()) return true; // si está vacío no falla aquí (se valida opcional)
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function validarFormProveedor(
  form: FormProveedor,
  proveedores: Proveedor[],
  idEditando?: string,
): ErroresProveedor {
  const errores: ErroresProveedor = {};

  // 1. Tipo de documento
  if (!form.tipoDocumento) {
    errores.tipoDocumento = "Selecciona el tipo de documento.";
  }

  // 2. Número de documento obligatorio y sin duplicados
  const docLimpio = limpiarDocumento(form.numeroDocumento);
  if (!form.numeroDocumento.trim()) {
    errores.numeroDocumento = "El número de documento es obligatorio.";
  } else if (docLimpio.length < 5) {
    errores.numeroDocumento = "Ingresa un número de documento válido (mínimo 5 caracteres).";
  } else {
    const duplicado = proveedores.find(
      (p) =>
        limpiarDocumento(p.numeroDocumento) === docLimpio &&
        p.idProveedor !== idEditando,
    );
    if (duplicado) {
      errores.numeroDocumento = `Ya existe un proveedor con este documento (${duplicado.razonSocial}).`;
    }
  }

  // 3. Razón Social obligatoria
  if (!form.razonSocial.trim()) {
    errores.razonSocial = "La razón social o nombre del proveedor es obligatorio.";
  } else if (form.razonSocial.trim().length < 3) {
    errores.razonSocial = "La razón social debe tener al menos 3 caracteres.";
  }

  // 4. Tipo de proveedor
  if (!form.tipoProveedor) {
    errores.tipoProveedor = "Selecciona si es persona Natural o Jurídica.";
  }

  // 5. Categorías (al menos una seleccionada)
  if (!form.categoriaIds || form.categoriaIds.length === 0) {
    errores.categorias = "Debes asociar al menos una categoría al proveedor.";
  }

  // 6. Validación de Correo Electrónico
  if (form.email.trim() && !validarEmail(form.email)) {
    errores.email = "Ingresa una dirección de correo electrónico válida (ej: contacto@empresa.com).";
  }

  return errores;
}

