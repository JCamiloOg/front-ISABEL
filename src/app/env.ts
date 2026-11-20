// URL base del backend. Se usa el puerto 3000 por defecto y se añade /api,
// que coincide con el prefijo montado por el servidor Express.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";