import type { SupplierCategory, Supplier } from "./types";

export const MOCK_SUPPLIER_CATEGORIES: SupplierCategory[] = [
  { id: 1, name: "Cuero y Pieles", description: "Cuero vacuno, badana, nobuck, carnaza y pieles curtidas", badgeColor: "border-amber-300 bg-amber-50 text-amber-800" },
  { id: 2, name: "Suelas y Sintéticos", description: "Suelas en caucho, TR, EVA, poliuretano y láminas sintéticas", badgeColor: "border-blue-300 bg-blue-50 text-blue-800" },
  { id: 3, name: "Textiles y Forros", description: "Lonas, mallas transpirables, forros antitranspirantes y plantillas", badgeColor: "border-indigo-300 bg-indigo-50 text-indigo-800" },
  { id: 4, name: "Herrajes y Hebillas", description: "Ojalillos metálicos, pasadores, hebillas, cremalleras y punteras", badgeColor: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { id: 5, name: "Empaques y Cajas", description: "Cajas de calzado, papel seda, bolsas institucionales y etiquetas", badgeColor: "border-purple-300 bg-purple-50 text-purple-800" },
  { id: 6, name: "Pegantes y Adhesivos", description: "Cemento de contacto, adhesivos de poliuretano, reactivadores y solventes", badgeColor: "border-rose-300 bg-rose-50 text-rose-800" },
  { id: 7, name: "Cordones y Elásticos", description: "Cordones encerados, trenzados, elásticos reforzados y reatas", badgeColor: "border-teal-300 bg-teal-50 text-teal-800" },
  { id: 8, name: "Calzado Terminado / Maquila", description: "Zapatos elaborados para distribución, capelladas y armado", badgeColor: "border-cyan-300 bg-cyan-50 text-cyan-800" },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "prov-001", documentType: "NIT", documentNumber: "900.842.105-3",
    businessName: "Curtidos La Sabana S.A.S.", supplierType: "Jurídico", isImported: false,
    categories: [MOCK_SUPPLIER_CATEGORIES[0], MOCK_SUPPLIER_CATEGORIES[2]],
    phone: "+57 (601) 789 4520", email: "ventas@curtidoslasabana.com",
    address: "Calle 17 # 68D-42 Zona Industrial", city: "Bogotá D.C.", country: "Colombia",
    status: "Activo", registrationDate: "2026-01-15T09:30:00",
  },
  {
    id: "prov-002", documentType: "NIT", documentNumber: "890.312.440-1",
    businessName: "Industrias Caucho SuelaFlex Ltda.", supplierType: "Jurídico", isImported: false,
    categories: [MOCK_SUPPLIER_CATEGORIES[1], MOCK_SUPPLIER_CATEGORIES[5]],
    phone: "+57 (604) 448 9110", email: "contacto@suelaflex.com.co",
    address: "Carrera 50 # 32-85", city: "Medellín", country: "Colombia",
    status: "Activo", registrationDate: "2026-02-10T14:15:00",
  },
  {
    id: "prov-003", documentType: "Cédula", documentNumber: "79.845.210",
    businessName: "Hernando Silva (Herrajes El Artesano)", supplierType: "Natural", isImported: false,
    categories: [MOCK_SUPPLIER_CATEGORIES[3], MOCK_SUPPLIER_CATEGORIES[6]],
    phone: "+57 314 258 7963", email: "h.silva.artesano@gmail.com",
    address: "Carrera 22 # 11-14 Barrio Restrepo", city: "Bogotá D.C.", country: "Colombia",
    status: "Activo", registrationDate: "2026-03-05T11:00:00",
  },
  {
    id: "prov-004", documentType: "NIT", documentNumber: "901.458.772-8",
    businessName: "Guangzhou Shoe Materials International Co.", supplierType: "Jurídico", isImported: true,
    categories: [MOCK_SUPPLIER_CATEGORIES[1], MOCK_SUPPLIER_CATEGORIES[2], MOCK_SUPPLIER_CATEGORIES[3]],
    phone: "+86 20 8642 9800", email: "export@gzshoematerials.cn",
    address: "Building 4, Baiyun Leather Industrial District", city: "Guangzhou", country: "China",
    status: "Activo", registrationDate: "2026-04-12T16:45:00",
  },
  {
    id: "prov-005", documentType: "NIT", documentNumber: "900.123.654-7",
    businessName: "Empaques y Cajas Gráficas de Colombia", supplierType: "Jurídico", isImported: false,
    categories: [MOCK_SUPPLIER_CATEGORIES[4]],
    phone: "+57 (602) 667 3322", email: "pedidos@cajasgraficas.com",
    address: "Avenida 3N # 52N-10", city: "Cali", country: "Colombia",
    status: "Activo", registrationDate: "2026-05-20T08:20:00",
  },
  {
    id: "prov-006", documentType: "Cédula", documentNumber: "1.098.742.331",
    businessName: "Beatriz Elena Morales (Pieles del Valle)", supplierType: "Natural", isImported: false,
    categories: [MOCK_SUPPLIER_CATEGORIES[0]],
    phone: "+57 318 654 3210", email: "beatriz.morales.pieles@gmail.com",
    address: "Calle 14 # 9-45", city: "Bucaramanga", country: "Colombia",
    status: "Inactivo", registrationDate: "2026-06-01T10:10:00",
  },
  {
    id: "prov-007", documentType: "NIT", documentNumber: "901.789.231-0",
    businessName: "SoleTech Brasil Componentes Ltda.", supplierType: "Jurídico", isImported: true,
    categories: [MOCK_SUPPLIER_CATEGORIES[1], MOCK_SUPPLIER_CATEGORIES[7]],
    phone: "+55 51 3594 8800", email: "comercial@soletechbrasil.com.br",
    address: "Rua das Indústrias 1200, Novo Hamburgo", city: "Rio Grande do Sul", country: "Brasil",
    status: "Activo", registrationDate: "2026-07-18T13:30:00",
  },
];
