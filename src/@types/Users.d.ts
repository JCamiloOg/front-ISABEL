export type TipoDocumentoId = 1 | 2 | 3 | 4 | 5; // 1: CC, 2: CE, 3: TI, 4: Pasaporte, 5: NIT
export type RolId = 1 | 2; // 1: Administrador, 2: Bodeguero (clientes excluidos de este módulo)

export interface TipoDocumento {
  id_tipo_documento: TipoDocumentoId;
  codigo: string;
  nombre: string;
}

export interface Rol {
  id_rol: RolId;
  nombre: "Administrador" | "Bodeguero";
  descripcion: string;
}

export interface Usuario {
  id_usuario?: number;
  documento_identidad: string;
  id_tipo_documento: TipoDocumentoId;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  contrasena?: string;
  id_rol: RolId;
  estado: boolean;
  fecha_creacion: string;
  // Campos populados / helpers para UI
  tipo_documento?: TipoDocumento;
  rol?: Rol;
}

export interface UsuarioFormData {
  documento_identidad: string;
  id_tipo_documento: TipoDocumentoId;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  contrasena: string;
  id_rol: RolId;
  estado: boolean;
}

export interface LoggedUser {
  email: string;
  name: string;
  lastName: string;
  role: string;
}
