import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSackDollar, faArrowTrendUp, faBoxOpen, 
  faFileInvoiceDollar, faCrown, 
  faCheckCircle, faSearch, faTriangleExclamation, 
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- Datos Mock: Balance de Gastos y Ganancias ---
const dataBalanceFinanciero = [
  { periodo: 'Sem 1', ventas: 2100000, gastos: 1100000, ganancia: 1000000 },
  { periodo: 'Sem 2', ventas: 2450000, gastos: 1200000, ganancia: 1250000 },
  { periodo: 'Sem 3', ventas: 1950000, gastos: 950000, ganancia: 1000000 },
  { periodo: 'Sem 4', ventas: 2900000, gastos: 1350000, ganancia: 1550000 },
];

// --- Datos Mock: Seguimiento Ventas por Día / Mes / Año ---
const seriesVentasPorPeriodo = {
  'Día': [
    { label: '09:00', valor: 120000 },
    { label: '11:00', valor: 280000 },
    { label: '14:00', valor: 450000 },
    { label: '16:00', valor: 690000 },
    { label: '18:00', valor: 850000 },
  ],
  'Mes': [
    { label: 'Ene', valor: 6800000 },
    { label: 'Feb', valor: 7200000 },
    { label: 'Mar', valor: 8100000 },
    { label: 'Abr', valor: 7900000 },
    { label: 'May', valor: 8800000 },
    { label: 'Jun', valor: 9400000 },
  ],
  'Año': [
    { label: '2023', valor: 78500000 },
    { label: '2024', valor: 94200000 },
    { label: '2025', valor: 103800000 },
    { label: '2026', valor: 112500000 },
  ]
};

// --- Datos Mock: Estado de Comprobantes de Pago ---
const dataComprobantes = [
  { name: 'Verificados', value: 85, color: '#2B62D9' },
  { name: 'Por Comprobar', value: 10, color: '#52A5E8' },
  { name: 'Rechazados', value: 5, color: '#64748B' },
];

const pedidosPendientesIniciales = [
  { id: 'PED-0482', cliente: 'Alejandro Ríos', producto: "Nike Air Force 1 '07 White", total: '$389.000', comprobante: 'Verificado', estado: 'Por despachar', fecha: '16 Nov 2026' },
  { id: 'PED-0481', cliente: 'María Fernández', producto: 'Jordan 1 Mid SE Red', total: '$520.000', comprobante: 'Por comprobar', estado: 'Pendiente pago', fecha: '16 Nov 2026' },
  { id: 'PED-0480', cliente: 'Carlos Mendoza', producto: 'Adidas Ultraboost 24', total: '$610.000', comprobante: 'Por comprobar', estado: 'Pendiente pago', fecha: '15 Nov 2026' },
  { id: 'PED-0479', cliente: 'Valentina Cruz', producto: 'Nike Dunk Low Panda', total: '$490.000', comprobante: 'Verificado', estado: 'Despachado', fecha: '14 Nov 2026' },
];

export default function DashboardPage() {
  const [periodoVentas, setPeriodoVentas] = useState<'Día' | 'Mes' | 'Año'>('Mes');
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const [mostrarBanner, setMostrarBanner] = useState(true);

  const datosVentas = {
    'Día': { valor: '$850K', porcentaje: '5.2%', comparativa: 'ayer' },
    'Mes': { valor: '$9.4M', porcentaje: '21.1%', comparativa: 'mes anterior' },
    'Año': { valor: '$112.5M', porcentaje: '14.3%', comparativa: 'año anterior' },
  };
  const ventaActual = datosVentas[periodoVentas];

  const pedidosFiltrados = pedidosPendientesIniciales.filter((p) =>
    p.id.toLowerCase().includes(busquedaTabla.toLowerCase()) ||
    p.cliente.toLowerCase().includes(busquedaTabla.toLowerCase()) ||
    p.producto.toLowerCase().includes(busquedaTabla.toLowerCase()) ||
    p.estado.toLowerCase().includes(busquedaTabla.toLowerCase())
  );

  // Estilo adaptable para tooltips de Recharts en modo claro y oscuro
  const tooltipStyle = {
    backgroundColor: 'var(--color-app-surface, #1e293b)',
    borderColor: 'var(--color-app-border, #334155)',
    color: 'var(--color-app-text, #f8fafc)',
    borderRadius: '0.75rem',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen bg-app-surface-alt/40 flex flex-col justify-between transition-colors" style={{ fontFamily: '"Nunito", sans-serif' }}>
      
      {/* CONTENIDO PRINCIPAL */}
      <main className="p-[24px] space-y-[24px] max-w-[1440px] w-full mx-auto">
        
        {/* --- HEADER --- */}
        <div>
          <p className="text-[12px] text-brand-royal dark:text-brand-sky font-bold uppercase tracking-wider">Medición y Desempeño</p>
          <h1 className="text-[24px] font-bold text-app-text">Tablero de Control — Paradise Shoes</h1>
        </div>

        {/* --- 1. KPIs SUPERIORES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          
          {/* KPI 1: Ventas Totales */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-[12px] text-app-muted font-bold uppercase tracking-wider">Ventas Totales</p>
              <FontAwesomeIcon icon={faSackDollar} className="text-brand-royal dark:text-brand-sky text-[18px]" />
            </div>
            
            <h2 className="text-[28px] font-bold text-app-text mt-[12px]">
              {ventaActual.valor}
            </h2>
            <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold mt-[6px] flex items-center gap-[6px]">
              <FontAwesomeIcon icon={faArrowTrendUp} /> +{ventaActual.porcentaje} vs {ventaActual.comparativa}
            </p>
            
            {/* Chips de selección rápida */}
            <div className="flex gap-[6px] mt-[12px] text-[12px] bg-app-surface-alt border border-app-border w-fit p-[6px] rounded-lg">
              {(['Día', 'Mes', 'Año'] as const).map((periodo) => (
                <button
                  key={periodo}
                  type="button"
                  onClick={() => setPeriodoVentas(periodo)}
                  className={`px-[12px] py-[6px] rounded-md font-bold transition-colors cursor-pointer ${
                    periodoVentas === periodo 
                      ? 'bg-brand-royal text-white shadow-xs' 
                      : 'text-app-muted hover:bg-app-surface hover:text-app-text'
                  }`}
                >
                  {periodo}
                </button>
              ))}
            </div>
          </div>

          {/* KPI 2: Balance de Gastos y Ganancias */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-[12px] text-app-muted font-bold uppercase tracking-wider">Ganancia Neta</p>
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-emerald-600 dark:text-emerald-400 text-[18px]" />
            </div>
            <h2 className="text-[28px] font-bold text-emerald-600 dark:text-emerald-400 mt-[12px]">$4.8M</h2>
            <div className="mt-[6px] space-y-[6px] text-[12px]">
              <p className="text-app-muted">Gastos del período: <span className="font-bold text-app-text">$4.6M</span></p>
              <p className="text-app-muted">Margen neto: <span className="font-bold text-emerald-600 dark:text-emerald-400">51.0%</span></p>
            </div>
          </div>

          {/* KPI 3: Pedidos Pendientes */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-[12px] text-app-muted font-bold uppercase tracking-wider">Pedidos Pendientes</p>
              <FontAwesomeIcon icon={faBoxOpen} className="text-amber-500 text-[18px]" />
            </div>
            <h2 className="text-[28px] font-bold text-app-text mt-[12px]">3</h2>
            <div className="mt-[6px] flex items-center justify-between">
              <span className="text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-[12px] py-[6px] rounded-full">
                POR DESPACHAR
              </span>
              <button className="text-[12px] font-bold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer">
                Ver →
              </button>
            </div>
          </div>

          {/* KPI 4: Comprobantes de Pago */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-[12px] text-app-muted font-bold uppercase tracking-wider">Comprobantes Pago</p>
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-brand-royal dark:text-brand-sky text-[18px]" />
            </div>
            <h2 className="text-[28px] font-bold text-app-text mt-[12px]">2</h2>
            <div className="mt-[6px] flex items-center justify-between">
              <span className="text-[10px] font-bold bg-brand-royal/15 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky px-[12px] py-[6px] rounded-full">
                POR VALIDAR
              </span>
              <button className="text-[12px] font-bold text-brand-royal dark:text-brand-sky hover:underline cursor-pointer">
                Revisar →
              </button>
            </div>
          </div>

        </div>

        {/* --- 2. BANNER DE ALERTA OPERATIVA --- */}
        {mostrarBanner && (
          <div className="bg-amber-500/10 border border-amber-500/30 border-l-4 border-l-amber-500 p-[12px] rounded-lg flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-app-text">Atención en bodega y caja</p>
                <p className="text-[12px] text-app-muted">Tienes 2 comprobantes de transferencia pendientes por validar y 3 pedidos en alistamiento.</p>
              </div>
            </div>
            <button onClick={() => setMostrarBanner(false)} className="text-app-muted hover:text-app-text p-[6px] cursor-pointer">
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        )}

        {/* --- 3. GRÁFICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          
          {/* Gráfica 1: Balance de Gastos y Ganancias */}
          <div className="bg-app-surface p-[24px] rounded-xl shadow-xs border border-app-border transition-colors">
            <h3 className="text-[14px] font-bold text-app-text mb-[18px]">Balance: Ventas, Gastos y Ganancias</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBalanceFinanciero} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} tickFormatter={(val) => `$${val/1000000}M`} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="ventas" name="Ventas" fill="#2B62D9" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="gastos" name="Gastos" fill="#52A5E8" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="ganancia" name="Ganancia Neta" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-[12px] mt-[12px] text-[12px] text-app-muted">
              <div className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-[#2B62D9]"></span> Ventas</div>
              <div className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-[#52A5E8]"></span> Gastos</div>
              <div className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span> Ganancia</div>
            </div>
          </div>

          {/* Gráfica 2: Evolución de Ventas según filtro activo */}
          <div className="bg-app-surface p-[24px] rounded-xl shadow-xs border border-app-border transition-colors">
            <div className="flex justify-between items-center mb-[18px]">
              <h3 className="text-[14px] font-bold text-app-text">Comportamiento de Ventas ({periodoVentas})</h3>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seriesVentasPorPeriodo[periodoVentas]} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94A3B8' }} 
                    tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : `$${val/1000}K`} 
                  />
                  <Tooltip cursor={{ stroke: 'rgba(148, 163, 184, 0.3)' }} contentStyle={tooltipStyle} />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    name="Ventas" 
                    stroke="#2B62D9" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#52A5E8', strokeWidth: 0 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-[18px] mt-[12px] text-[12px] text-app-muted">
              <span>Visualizando histórico consolidado por <strong className="text-app-text">{periodoVentas.toLowerCase()}</strong></span>
            </div>
          </div>

          {/* Gráfica 3: Estado de Comprobantes de Pago */}
          <div className="bg-app-surface p-[24px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <h3 className="text-[14px] font-bold text-app-text mb-[18px]">Estado de Comprobantes de Pago</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataComprobantes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} stroke="none">
                    {dataComprobantes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-[6px] mt-[12px] text-[12px]">
              {dataComprobantes.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-app-muted">
                  <span className="flex items-center gap-[6px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-app-text">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- 4. MEDICIONES ESTRATÉGICAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          
          {/* Bloque 1: Producto Más Vendido y Menos Vendido */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div>
              <h3 className="text-[14px] font-bold text-app-text mb-[18px]">Rotación de Productos</h3>
              <div className="space-y-[12px]">
                {/* Más vendido */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-[12px] rounded-lg">
                  <span className="inline-block text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-[12px] py-[6px] rounded-full mb-[6px]">
                    PRODUCTO MÁS VENDIDO
                  </span>
                  <p className="text-[14px] font-bold text-app-text">Nike Air Force 1 '07 White</p>
                  <p className="text-[12px] text-app-muted mt-[6px]">47 pares vendidos · Stock actual: 18 prs</p>
                </div>

                {/* Menos vendido */}
                <div className="bg-rose-500/10 border border-rose-500/20 p-[12px] rounded-lg">
                  <span className="inline-block text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 px-[12px] py-[6px] rounded-full mb-[6px]">
                    PRODUCTO MENOS VENDIDO
                  </span>
                  <p className="text-[14px] font-bold text-app-text">Jordan 4 Retro Military Olive</p>
                  <p className="text-[12px] text-app-muted mt-[6px]">2 pares vendidos · Stock actual: 14 prs</p>
                </div>
              </div>
            </div>
            <button className="w-full text-[12px] text-app-text font-bold bg-app-surface border border-app-border hover:bg-app-surface-alt py-[12px] rounded-lg mt-[18px] transition cursor-pointer">
              Ver reporte de inventario
            </button>
          </div>

          {/* Bloque 2: Top Mejores Proveedores */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div>
              <div className="flex justify-between items-center mb-[18px]">
                <h3 className="text-[14px] font-bold text-app-text">Top Mejores Proveedores</h3>
                <span className="text-[10px] font-bold bg-brand-royal/15 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky px-[12px] py-[6px] rounded-full">
                  14 REGISTRADOS
                </span>
              </div>

              <div className="space-y-[12px]">
                <div className="flex justify-between items-center border-b border-app-border pb-[12px]">
                  <div>
                    <p className="text-[14px] font-bold text-app-text">1. Nike Colombia S.A.S.</p>
                    <p className="text-[12px] text-app-muted">18 órdenes cumplidas · Calzado Deportivo</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                    <FontAwesomeIcon icon={faCheckCircle} /> ACTIVO
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-app-border pb-[12px]">
                  <div>
                    <p className="text-[14px] font-bold text-app-text">2. Adidas Distribuciones</p>
                    <p className="text-[12px] text-app-muted">12 órdenes cumplidas · Línea Running</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                    <FontAwesomeIcon icon={faCheckCircle} /> ACTIVO
                  </span>
                </div>

                <div className="flex justify-between items-center pb-[6px]">
                  <div>
                    <p className="text-[14px] font-bold text-app-text">3. Importadora Jordan Med</p>
                    <p className="text-[12px] text-app-muted">9 órdenes cumplidas · Edición Limitada</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                    <FontAwesomeIcon icon={faCheckCircle} /> ACTIVO
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full text-[12px] text-app-text font-bold bg-app-surface border border-app-border hover:bg-app-surface-alt py-[12px] rounded-lg mt-[18px] transition cursor-pointer">
              Ver todos los proveedores (14)
            </button>
          </div>

          {/* Bloque 3: Consolidación del Cliente Top del Negocio */}
          <div className="bg-app-surface p-[18px] rounded-xl shadow-xs border border-app-border flex flex-col justify-between transition-colors">
            <div>
              <h3 className="text-[14px] font-bold text-app-text mb-[18px] flex items-center gap-[6px]">
                <FontAwesomeIcon icon={faCrown} className="text-amber-500"/> Cliente Top del Negocio
              </h3>
              
              <div className="bg-app-surface-alt text-app-text p-[18px] rounded-xl border border-app-border relative">
                <span className="absolute top-[18px] right-[18px] text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-[12px] py-[6px] rounded-full">
                  TOP #1 COMPRAS
                </span>
                <h4 className="font-bold text-[18px]">Valentina Cruz</h4>
                <p className="text-[12px] text-app-muted mt-[6px]">Documento: 1.037.654.321 · Medellín</p>
                
                <div className="grid grid-cols-2 gap-[12px] mt-[18px]">
                  <div className="bg-app-surface border border-app-border p-[12px] rounded-lg">
                    <p className="text-[10px] text-app-muted uppercase font-bold">Total Comprado</p>
                    <p className="font-bold text-[16px] text-app-text mt-[6px]">$4.280.000</p>
                  </div>
                  <div className="bg-app-surface border border-app-border p-[12px] rounded-lg">
                    <p className="text-[10px] text-app-muted uppercase font-bold">Pedidos Totales</p>
                    <p className="font-bold text-[16px] text-brand-royal dark:text-brand-sky mt-[6px]">9 pedidos</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full text-[12px] text-app-text font-bold bg-app-surface border border-app-border hover:bg-app-surface-alt py-[12px] rounded-lg mt-[18px] transition cursor-pointer">
              Ver historial de clientes
            </button>
          </div>

        </div>

        {/* --- 5. TABLA DE SEGUIMIENTO DE PEDIDOS Y COMPROBANTES --- */}
        <div className="bg-app-surface p-[24px] rounded-xl shadow-xs border border-app-border transition-colors">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[12px] mb-[18px]">
            <div>
              <h3 className="text-[16px] font-bold text-app-text">Seguimiento de Pedidos y Comprobantes</h3>
              <p className="text-[12px] text-app-muted mt-[6px]">
                <span className="font-bold text-app-text">{pedidosFiltrados.length} RESULTADOS</span> · Control de despachos y validación de pagos recientes.
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={busquedaTabla}
                onChange={(e) => setBusquedaTabla(e.target.value)}
                placeholder="Buscar por ID, cliente o estado..."
                className="w-full text-[14px] text-app-text placeholder:text-app-muted bg-app-surface-alt border border-app-border rounded-lg pl-[12px] pr-[36px] py-[6px] focus:outline-none focus:border-brand-royal dark:focus:border-brand-sky transition-colors"
              />
              <FontAwesomeIcon icon={faSearch} className="text-app-muted text-[14px] absolute right-[12px] top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] text-app-muted">
              <thead className="text-[12px] text-app-muted uppercase bg-app-surface-alt border-y border-app-border">
                <tr>
                  <th className="px-[18px] py-[12px] font-bold">ID Pedido</th>
                  <th className="px-[18px] py-[12px] font-bold">Cliente</th>
                  <th className="px-[18px] py-[12px] font-bold">Producto</th>
                  <th className="px-[18px] py-[12px] font-bold">Total</th>
                  <th className="px-[18px] py-[12px] font-bold">Comprobante</th>
                  <th className="px-[18px] py-[12px] font-bold">Estado Pedido</th>
                  <th className="px-[18px] py-[12px] font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-app-border hover:bg-app-surface-alt/60 transition-colors">
                    <td className="px-[18px] py-[12px] font-bold text-app-text">{pedido.id}</td>
                    <td className="px-[18px] py-[12px] text-app-text/90">{pedido.cliente}</td>
                    <td className="px-[18px] py-[12px] text-app-text/90">{pedido.producto}</td>
                    <td className="px-[18px] py-[12px] font-bold text-app-text">{pedido.total}</td>
                    <td className="px-[18px] py-[12px]">
                      {pedido.comprobante === 'Verificado' ? (
                        <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-[12px] py-[6px] text-[10px] rounded-full font-bold uppercase">
                          Verificado
                        </span>
                      ) : (
                        <span className="bg-brand-royal/15 text-brand-royal dark:bg-brand-sky/15 dark:text-brand-sky px-[12px] py-[6px] text-[10px] rounded-full font-bold uppercase">
                          Por comprobar
                        </span>
                      )}
                    </td>
                    <td className="px-[18px] py-[12px]">
                      {pedido.estado === 'Despachado' ? (
                        <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-[12px] py-[6px] text-[10px] rounded-full font-bold uppercase">
                          Despachado
                        </span>
                      ) : (
                        <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 px-[12px] py-[6px] text-[10px] rounded-full font-bold uppercase">
                          {pedido.estado}
                        </span>
                      )}
                    </td>
                    <td className="px-[18px] py-[12px] text-right">
                      <button className="text-[12px] font-bold text-brand-royal dark:text-brand-sky hover:underline transition cursor-pointer">
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-[18px] text-[12px] text-app-muted">
            <span>Mostrando 1-{pedidosFiltrados.length} de {pedidosPendientesIniciales.length} registros</span>
            <button className="font-bold text-app-text bg-app-surface border border-app-border hover:bg-app-surface-alt px-[18px] py-[6px] rounded-lg transition cursor-pointer">
              Ver todos los pedidos
            </button>
          </div>
        </div>

      </main>

    </div>
  );
}