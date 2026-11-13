export type TipoCaja = 'Cuenta bancaria' | 'Efectivo';

export interface Caja {
  id: string;
  nombre: string;
  tipo: TipoCaja;
  saldo: number;
}

export interface Gasto {
  id: string;
  codigo: string;
  concepto: string;
  fecha: string; // YYYY-MM-DD
  cajaId: string;
  cajaNombre: string;
  valor: number;
  descripcion: string;
}

export interface Almacen {
  cajas: Caja[];
  gastos: Gasto[];
  conceptos: string[];
}

export interface DatosGasto {
  concepto: string;
  fecha: string;
  cajaId: string;
  valor: number;
  descripcion: string;
}

export interface FormGasto {
  concepto: string;
  fecha: string;
  cajaId: string;
  valor: string; // solo dígitos
  descripcion: string;
}

export type ErroresGasto = Partial<Record<'concepto' | 'fecha' | 'cajaId' | 'valor', string>>;

export interface FormCaja {
  nombre: string;
  tipo: TipoCaja | '';
  saldo: string; // solo dígitos
}

export type ErroresCaja = Partial<Record<keyof FormCaja, string>>;

