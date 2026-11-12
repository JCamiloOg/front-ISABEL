import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSackDollar, faArrowTrendUp, faBoxOpen, 
  faFileInvoice, faUsers, faCrown, 
  faCircleExclamation, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  BarChart, Bar, LineChart, Line, XAxis, 
  YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- Datos Mock para Gráficos ---
const dataVentasGastos = [
  { day: 'Lun', ventas: 2000000, gastos: 800000 },
  { day: 'Mar', ventas: 2100000, gastos: 900000 },
  { day: 'Mie', ventas: 1500000, gastos: 600000 },
  { day: 'Jue', ventas: 2400000, gastos: 1100000 },
  { day: 'Vie', ventas: 3000000, gastos: 1400000 },
  { day: 'Sab', ventas: 2800000, gastos: 1200000 },
  { day: 'Dom', ventas: 1800000, gastos: 700000 },
];

const dataClientes = [
  { mes: 'Ene', acumulados: 45, nuevos: 45 },
  { mes: 'Feb', acumulados: 52, nuevos: 7 },
  { mes: 'Mar', acumulados: 68, nuevos: 16 },
  { mes: 'Abr', acumulados: 90, nuevos: 22 },
  { mes: 'May', acumulados: 125, nuevos: 35 },
  { mes: 'Jun', acumulados: 140, nuevos: 15 },
  { mes: 'Jul', acumulados: 162, nuevos: 22 },
  { mes: 'Ago', acumulados: 180, nuevos: 18 },
];

export default function DashboardPage() {
  const [periodoVentas, setPeriodoVentas] = useState<'Día' | 'Mes' | 'Año'>('Mes');

  const datosVentas = {
    'Día': { valor: '$850K', porcentaje: '5.2%', comparativa: 'ayer' },
    'Mes': { valor: '$9.4M', porcentaje: '21.1%', comparativa: 'mes anterior' },
    'Año': { valor: '$112.5M', porcentaje: '14.3%', comparativa: 'año anterior' },
  };
  const ventaActual = datosVentas[periodoVentas];

  return (
    <div className="p-[24px] bg-[#F8FAFC] min-h-screen space-y-[24px]" style={{ fontFamily: '"Nunito", sans-serif' }}>
      
      {/* --- HEADER --- */}
      <div>
        <p className="text-[12px] text-[#2B62D9] font-bold uppercase tracking-wider">Dashboard</p>
        <h1 className="text-[24px] font-bold text-[#0E2347]">Panel Principal</h1>
      </div>

      {/* --- 1. KPIs SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-[18px]">
        
        {/* Ventas Totales (Ahora en Modo Claro) */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Ventas Totales</p>
            <FontAwesomeIcon icon={faSackDollar} className="text-[#F59E0B]" />
          </div>
          
          <h2 className="text-[28px] font-bold text-[#0E2347] mt-[12px] transition-all duration-300">
            {ventaActual.valor}
          </h2>
          <p className="text-[12px] text-[#16A34A] mt-[6px] flex items-center gap-[6px]">
            <FontAwesomeIcon icon={faArrowTrendUp} /> {ventaActual.porcentaje} vs {ventaActual.comparativa}
          </p>
          
          {/* Botones Interactivos - Modo Claro */}
          <div className="flex gap-[6px] mt-[12px] text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] w-fit p-[6px] rounded-md">
            <span 
              onClick={() => setPeriodoVentas('Día')}
              className={`px-[12px] py-[6px] rounded cursor-pointer font-bold transition-colors ${periodoVentas === 'Día' ? 'bg-[#2B62D9] text-white shadow-sm' : 'hover:bg-white text-gray-500 hover:text-[#0E2347]'}`}
            >
              Día
            </span>
            <span 
              onClick={() => setPeriodoVentas('Mes')}
              className={`px-[12px] py-[6px] rounded cursor-pointer font-bold transition-colors ${periodoVentas === 'Mes' ? 'bg-[#2B62D9] text-white shadow-sm' : 'hover:bg-white text-gray-500 hover:text-[#0E2347]'}`}
            >
              Mes
            </span>
            <span 
              onClick={() => setPeriodoVentas('Año')}
              className={`px-[12px] py-[6px] rounded cursor-pointer font-bold transition-colors ${periodoVentas === 'Año' ? 'bg-[#2B62D9] text-white shadow-sm' : 'hover:bg-white text-gray-500 hover:text-[#0E2347]'}`}
            >
              Año
            </span>
          </div>
        </div>

        {/* Gastos */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between">
          <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Gastos del Período</p>
          <h2 className="text-[24px] font-bold text-[#DC2626] mt-[12px]">$4.600.000</h2>
          <p className="text-[12px] text-gray-500 mt-[6px]">Compras + operación este mes</p>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between">
          <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Ganancia Neta</p>
          <h2 className="text-[24px] font-bold text-[#16A34A] mt-[12px]">$3.800.000</h2>
          <p className="text-[12px] text-gray-500 mt-[6px]">Margen 45.2% sobre ventas</p>
        </div>

        {/* Clientes */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Clientes del Mes</p>
            <FontAwesomeIcon icon={faUsers} className="text-[#0E2347]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#0E2347] mt-[12px]">27</h2>
          <p className="text-[12px] text-gray-500 mt-[6px]">162 acumulados · <span className="text-[#16A34A] font-bold">▲ 18% vs jul</span></p>
        </div>

        {/* Pedidos Pendientes */}
        <div className="bg-[#FEF3C7] p-[18px] rounded-xl shadow-sm border border-[#F59E0B]/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[12px] text-[#B45309] font-bold uppercase tracking-wider">Pedidos Pendientes</p>
            <FontAwesomeIcon icon={faBoxOpen} className="text-[#F59E0B]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#F59E0B] mt-[12px]">1</h2>
          <button className="text-[12px] text-[#B45309] mt-[6px] font-bold hover:underline text-left">
            ⚠️ Toca para gestionar →
          </button>
        </div>

        {/* Comprobantes */}
        <div className="bg-[#EFF6FF] p-[18px] rounded-xl shadow-sm border border-[#2563EB]/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[12px] text-[#1E40AF] font-bold uppercase tracking-wider">Comprobantes Pago</p>
            <FontAwesomeIcon icon={faFileInvoice} className="text-[#2563EB]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#2563EB] mt-[12px]">2</h2>
          <button className="text-[12px] text-[#1E40AF] mt-[6px] font-bold hover:underline text-left">
            Por comprobar - Toca →
          </button>
        </div>

      </div>

      {/* --- 2. GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        
        {/* Gráfico Barras */}
        <div className="bg-white p-[24px] rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#0E2347] mb-[24px]">Ventas & Gastos — Esta Semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataVentasGastos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `$${val/1000000}M`} />
                <Tooltip cursor={{fill: '#F8FAFC'}} />
                <Bar dataKey="ventas" fill="#0E2347" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="gastos" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Líneas */}
        <div className="bg-white p-[24px] rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#0E2347] mb-[24px]">Clientes Registrados por Mes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataClientes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} />
                <Line type="monotone" dataKey="acumulados" name="Acumulado" stroke="#74A5EB" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#74A5EB', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="nuevos" name="Nuevos" stroke="#0E2347" strokeWidth={2} dot={{ r: 4, fill: '#0E2347', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-[18px] mt-[12px] text-[12px] text-gray-500">
            <div className="flex items-center gap-[6px]"><span className="w-2 h-2 rounded-full bg-[#74A5EB]"></span> Acumulado</div>
            <div className="flex items-center gap-[6px]"><span className="w-2 h-2 rounded-full bg-[#0E2347]"></span> Nuevos</div>
          </div>
        </div>

      </div>

      {/* --- 3. ALERTAS OPERATIVAS --- */}
      <div>
        <h3 className="text-[14px] font-bold text-[#0E2347] mb-[12px] flex items-center gap-[6px]">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-[#F59E0B]" /> Alertas Operativas
        </h3>
        <div className="flex gap-[18px] overflow-x-auto pb-[12px]">
          <div className="flex items-center gap-[12px] bg-white border border-[#E2E8F0] p-[12px] rounded-lg shadow-sm min-w-[280px]">
            <div className="w-8 h-8 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex justify-center items-center font-bold">!</div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#0E2347]">Adidas Ultraboost 24</p>
              <p className="text-[12px] text-gray-500">Stock: 0 · Adidas · Talla 44</p>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-[#F8FAFC] px-[12px] py-[6px] rounded">Inventario</span>
          </div>

          <div className="flex items-center gap-[12px] bg-white border border-[#E2E8F0] p-[12px] rounded-lg shadow-sm min-w-[280px]">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex justify-center items-center font-bold">!</div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#0E2347]">1 Pedidos sin despachar</p>
              <p className="text-[12px] text-gray-500">Requieren gestión inmediata</p>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-[#F8FAFC] px-[12px] py-[6px] rounded">Pedidos</span>
          </div>
        </div>
      </div>

      {/* --- 4. RANKINGS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* Ranking Productos */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#0E2347] mb-[18px]">🏆 Ranking Productos</h3>
          <div className="space-y-[12px]">
            <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 p-[12px] rounded-lg">
              <p className="text-[10px] font-bold text-[#16A34A] mb-[6px] tracking-widest">▲ MÁS VENDIDO</p>
              <p className="text-[14px] font-bold text-[#0E2347]">Nike Air Force 1 '07 White</p>
              <p className="text-[12px] text-gray-500">47 pares · Nike</p>
            </div>
            <div className="bg-[#DC2626]/5 border border-[#DC2626]/20 p-[12px] rounded-lg">
              <p className="text-[10px] font-bold text-[#DC2626] mb-[6px] tracking-widest">▼ MENOS VENDIDO</p>
              <p className="text-[14px] font-bold text-[#0E2347]">Jordan 4 Retro Military Olive</p>
              <p className="text-[12px] text-gray-500">2 pares · Jordan</p>
            </div>
            <div className="pt-[6px] space-y-[12px]">
              <div className="flex justify-between text-[12px] border-b border-[#F8FAFC] pb-[6px]">
                <span className="text-gray-600">Jordan 1 Mid SE Red</span><span className="font-bold text-[#0E2347]">38 prs</span>
              </div>
              <div className="flex justify-between text-[12px] pb-[6px]">
                <span className="text-gray-600">Adidas Ultraboost 24</span><span className="font-bold text-[#0E2347]">29 prs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Proveedores */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#0E2347] mb-[18px]">📦 Top Proveedores</h3>
          <div className="space-y-[18px]">
            <div className="flex justify-between items-center border-b border-[#F8FAFC] pb-[12px]">
              <div>
                <p className="text-[14px] font-bold text-[#0E2347]">Nike Colombia S.A.S.</p>
                <p className="text-[10px] text-gray-500">NIT: 800.123.456-1</p>
              </div>
              <span className="text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A] px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                <FontAwesomeIcon icon={faCheckCircle} /> Activo
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F8FAFC] pb-[12px]">
              <div>
                <p className="text-[14px] font-bold text-[#0E2347]">Adidas Distribuciones</p>
                <p className="text-[10px] text-gray-500">NIT: 900.654.321-8</p>
              </div>
              <span className="text-[10px] font-bold bg-[#16A34A]/10 text-[#16A34A] px-[12px] py-[6px] rounded-full flex items-center gap-[6px]">
                <FontAwesomeIcon icon={faCheckCircle} /> Activo
              </span>
            </div>
            <button className="w-full text-[12px] text-[#2B62D9] font-bold hover:underline mt-[6px]">Ver todos los proveedores →</button>
          </div>
        </div>

        {/* Cliente Top (Ahora en Modo Claro) */}
        <div className="bg-white p-[18px] rounded-xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-[14px] font-bold text-[#0E2347] mb-[18px] flex items-center gap-[6px]"><FontAwesomeIcon icon={faCrown} className="text-[#F59E0B]"/> Cliente Top</h3>
          
          <div className="bg-[#F8FAFC] text-[#0E2347] p-[18px] rounded-xl border border-[#E2E8F0] relative overflow-hidden">
            <span className="absolute top-[18px] right-[18px] text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] font-bold px-[12px] py-[6px] rounded-full">VIP</span>
            <h4 className="font-bold text-[18px]">Valentina Cruz</h4>
            <p className="text-[12px] text-gray-500">CLI-004 · Medellín</p>
            
            <div className="grid grid-cols-2 gap-[12px] mt-[18px]">
              <div className="bg-white border border-[#E2E8F0] p-[12px] rounded shadow-sm">
                <p className="text-[10px] text-gray-500">Total Compras</p>
                <p className="font-bold text-[14px] text-[#0E2347]">$4.280.000</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] p-[12px] rounded shadow-sm">
                <p className="text-[10px] text-gray-500">Pedidos</p>
                <p className="font-bold text-[14px] text-[#0E2347]">9</p>
              </div>
            </div>
          </div>
          <button className="w-full text-[12px] text-[#0E2347] font-bold bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#E2E8F0] py-[12px] rounded-lg mt-[18px] transition">Ver todos los clientes →</button>
        </div>

      </div>

      {/* --- 5. TABLA ÚLTIMOS PEDIDOS --- */}
      <div className="bg-white p-[24px] rounded-xl shadow-sm border border-[#E2E8F0]">
        <div className="flex justify-between items-center mb-[18px]">
          <h3 className="text-[14px] font-bold text-[#0E2347]">Últimos Pedidos</h3>
          <button className="text-[12px] font-bold text-[#2B62D9] border border-[#2B62D9]/30 px-[12px] py-[6px] rounded bg-[#EFF6FF] hover:bg-[#2B62D9] hover:text-white transition">Ver todos →</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-gray-600">
            <thead className="text-[12px] text-gray-500 uppercase bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-[18px] py-[12px] font-bold">ID Pedido</th>
                <th className="px-[18px] py-[12px] font-bold">Cliente</th>
                <th className="px-[18px] py-[12px] font-bold">Productos</th>
                <th className="px-[18px] py-[12px] font-bold">Total</th>
                <th className="px-[18px] py-[12px] font-bold">Estado</th>
                <th className="px-[18px] py-[12px] font-bold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                <td className="px-[18px] py-[12px] font-bold text-[#0E2347]">PED-0481</td>
                <td className="px-[18px] py-[12px]">Alejandro Ríos</td>
                <td className="px-[18px] py-[12px]">Nike Air Force 1 '07 Whi...</td>
                <td className="px-[18px] py-[12px] font-bold text-[#0E2347]">$389.000</td>
                <td className="px-[18px] py-[12px]"><span className="bg-[#16A34A]/10 text-[#16A34A] px-[12px] py-[6px] text-[10px] rounded-full font-bold">Despachado</span></td>
                <td className="px-[18px] py-[12px] text-gray-500">06 Ago 2026</td>
              </tr>
              <tr className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                <td className="px-[18px] py-[12px] font-bold text-[#0E2347]">PED-0480</td>
                <td className="px-[18px] py-[12px]">María Fernández</td>
                <td className="px-[18px] py-[12px]">Jordan 1 Mid SE Red</td>
                <td className="px-[18px] py-[12px] font-bold text-[#0E2347]">$520.000</td>
                <td className="px-[18px] py-[12px]"><span className="bg-[#F59E0B]/10 text-[#F59E0B] px-[12px] py-[6px] text-[10px] rounded-full font-bold">Pendiente</span></td>
                <td className="px-[18px] py-[12px] text-gray-500">06 Ago 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}