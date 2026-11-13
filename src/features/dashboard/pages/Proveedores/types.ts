export type TipoDocumentoProveedor = "NIT" | "Cédula";

export type TipoProveedor = "Natural" | "Jurídico";

export type EstadoProveedor = "Activo" | "Inactivo";

export interface CategoriaProveedor {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
  colorBadge?: string;
}

export interface Proveedor {
  idProveedor: string;
  tipoDocumento: TipoDocumentoProveedor;
  numeroDocumento: string;
  razonSocial: string;
  tipoProveedor: TipoProveedor;
  esImportado: boolean;
  categorias: CategoriaProveedor[];
  telefono: string;
  email: string;
  direccion: string;
  ciudad?: string;
  pais?: string;
  estado: EstadoProveedor;
  fechaRegistro: string;
}

export interface FormProveedor {
  tipoDocumento: TipoDocumentoProveedor;
  numeroDocumento: string;
  razonSocial: string;
  tipoProveedor: TipoProveedor;
  esImportado: boolean;
  categoriaIds: number[];
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  pais: string;
}

export type ErroresProveedor = Partial<
  Record<
    | "tipoDocumento"
    | "numeroDocumento"
    | "razonSocial"
    | "tipoProveedor"
    | "categorias"
    | "telefono"
    | "email"
    | "direccion",
    string
  >
>;

