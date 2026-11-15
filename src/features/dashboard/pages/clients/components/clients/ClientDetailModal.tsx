  import React from 'react';
  import type { Client } from '../../../../../../@types/client';
  import Modal from '../../../../../../shared/components/Modal';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faAddressCard, faPhone, faEnvelope, faLocationDot, faBox, faDollarSign } from '@fortawesome/free-solid-svg-icons';
  import { faCalendar } from '@fortawesome/free-regular-svg-icons';

  interface ClientDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
  }

  export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ isOpen, onClose, client }) => {
    if (!client) return null;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
    };

    const footerButton = (
      <button
        onClick={onClose}
        className="px-5 py-2 bg-[#0E2347] dark:bg-[#52A5E8] text-[#FFFFFF] rounded-xl text-sm font-medium hover:bg-[#2B62D9] dark:hover:bg-[#2B62D9] transition-colors cursor-pointer shadow-sm"
      >
        Cerrar
      </button>
    );

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalle y Perfil del Cliente"
        description="Información general y métricas del historial de compras."
        icon={faAddressCard}
        size="lg"
        footer={footerButton}
      >
        <div className="space-y-6 py-2">
          {/* Resumen Superior */}
          <div className="flex items-start justify-between bg-[#F8FAFC] dark:bg-[#091322] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A8A]">
            <div>
              <h4 className="text-base font-bold text-[#0E2347] dark:text-[#FFFFFF]">
                {client.firstName} {client.lastName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {client.documentType}: {client.documentNumber}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                client.status === 'Activo' 
                  ? 'bg-[#16A34A]/10 text-[#16A34A]' 
                  : 'bg-[#E2E8F0] text-[#0E2347] dark:bg-[#1E3A8A]/40 dark:text-slate-300'
              }`}
            >
              {client.status}
            </span>
          </div>

          {/* Detalles de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 text-[#0E2347] dark:text-slate-200">
              <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-[#2B62D9] dark:text-[#52A5E8] shrink-0" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-[#0E2347] dark:text-slate-200">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-[#2B62D9] dark:text-[#52A5E8] shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-[#0E2347] dark:text-slate-200 md:col-span-2">
              <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#2B62D9] dark:text-[#52A5E8] shrink-0" />
              <span>{client.address}</span>
            </div>
          </div>

          {/* Estadísticas Comerciales */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Historial Comercial Paradise Shoes</h5>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] dark:bg-[#091322] border border-[#E2E8F0] dark:border-[#1E3A8A] p-3 rounded-xl text-center">
                <FontAwesomeIcon icon={faBox} className="w-5 h-5 text-[#2B62D9] dark:text-[#52A5E8] mx-auto mb-1" />
                <span className="block text-lg font-bold text-[#0E2347] dark:text-white">{client.commercialHistory.totalOrders}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pedidos Totales</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#091322] border border-[#E2E8F0] dark:border-[#1E3A8A] p-3 rounded-xl text-center">
                <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-[#16A34A] mx-auto mb-1" />
                <span className="block text-sm font-bold text-[#0E2347] dark:text-white mt-1">
                  {formatCurrency(client.commercialHistory.totalSpent)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Volumen Compras</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#091322] border border-[#E2E8F0] dark:border-[#1E3A8A] p-3 rounded-xl text-center">
                <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
                <span className="block text-xs font-bold text-[#0E2347] dark:text-white mt-1">
                  {client.commercialHistory.lastOrderDate}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Última Compra</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    ); 
  };