import React, { useState, useEffect } from 'react';
import { Order, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice, getProductName } from '../lib/formatters';
import { soundFx } from '../lib/sound';

interface OrderTrackerProps {
  orders: Order[];
  language: Language;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, language }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [searchId, setSearchId] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    orders.length > 0 ? orders[0] : null
  );
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Sync selectedOrder with incoming realtime updates in orders prop
  useEffect(() => {
    if (orders.length > 0) {
      if (selectedOrder) {
        const updated = orders.find(
          (o) =>
            o.id.toUpperCase() === selectedOrder.id.toUpperCase() ||
            (o.trackingNumber && selectedOrder.trackingNumber && o.trackingNumber.toUpperCase() === selectedOrder.trackingNumber.toUpperCase())
        );
        if (updated) {
          setSelectedOrder(updated);
        } else {
          setSelectedOrder(orders[0]);
        }
      } else {
        setSelectedOrder(orders[0]);
      }
    }
  }, [orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    const query = searchId.trim().toUpperCase();
    if (!query) return;

    const found = orders.find(
      (o) => o.id.toUpperCase() === query || o.trackingNumber.toUpperCase() === query
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      setSelectedOrder(null);
    }
  };

  const statusSteps = [
    'ORDER PLACED',
    'PACKING IN ANTI-STATIC',
    'DISPATCHED',
    'IN TRANSIT',
    'DELIVERED'
  ];

  const getStepIndex = (status: string) => {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PENDING' || s === 'ORDER PLACED' || s === 'DRAFT') return 0;
    if (s === 'PROCESSING' || s === 'PACKING IN ANTI-STATIC' || s === 'PACKING' || s === 'PAID') return 1;
    if (s === 'SHIPPED' || s === 'DISPATCHED' || s === 'SENDING') return 2;
    if (s === 'IN TRANSIT' || s === 'TRANSIT') return 3;
    if (s === 'COMPLETED' || s === 'DELIVERED' || s === 'DONE' || s === 'SUCCESS') return 4;

    const foundIdx = statusSteps.indexOf(s);
    return foundIdx >= 0 ? foundIdx : 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Window */}
      <div className="retro-window bg-[#1d1e30]">
        <div className="window-header bg-[#00a68d] p-3 flex justify-between items-center text-black">
          <span className="font-headline text-base font-bold uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">radar</span>
            {t('trackOrderTitle')}
          </span>
          <div className="window-controls flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMinimized((prev) => !prev);
              }}
              className="win-btn bg-[#1d1e30] text-[#00a68d] hover:bg-black hover:text-[#00a68d] cursor-pointer font-bold px-2 py-0.5"
              title={isMinimized ? "Expand Window" : "Minimize Window"}
            >
              {isMinimized ? '+' : '_'}
            </button>
            <button
              onClick={() => {
                soundFx.playClose();
                setSearchId('');
                setSelectedOrder(null);
              }}
              className="win-btn bg-[#ff7700] text-black hover:bg-[#ffb68d] cursor-pointer font-bold px-2 py-0.5"
              title="Close / Reset Search"
            >
              X
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 sm:p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t('enterOrderId')}
              className="flex-grow bg-[#111223] border-2 border-[#584235] p-3 font-label text-xs text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset uppercase"
            />
            <button
              type="submit"
              className="retro-btn bg-[#ff7700] text-black font-label text-xs font-bold px-6 py-3 uppercase hover:bg-[#ffb68d] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>{t('searchOrder')}</span>
            </button>
          </form>

          {/* Preset Order Quick Switches */}
          {orders.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 font-label text-xs text-[#e0c0b0]">
              <span className="text-[#ffb68d]">SAMPLE ORDERS:</span>
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedOrder(ord);
                    setSearchId(ord.id);
                  }}
                  className={`px-2.5 py-1 border text-xs font-bold ${
                    selectedOrder?.id === ord.id
                      ? 'bg-[#ff7700] text-black border-[#ff7700]'
                      : 'bg-[#111223] text-[#59dbc0] border-[#584235] hover:border-[#59dbc0]'
                  }`}
                >
                  {ord.id}
                </button>
              ))}
            </div>
          )}

          {/* Order Found Details */}
          {selectedOrder ? (
            <div className="bg-[#111223] border-2 border-[#584235] p-4 sm:p-6 space-y-6 retro-shadow">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#323346] pb-4">
                <div>
                  <span className="font-label text-xs text-[#59dbc0] block font-bold">
                    {t('orderIdLabel')} {selectedOrder.id}
                  </span>
                  <h3 className="font-headline text-lg font-bold text-[#e1e0f9]">
                    DATE: {selectedOrder.date}
                  </h3>
                </div>

                <div className="bg-[#1d1e30] border-2 border-[#ff7700] p-2 text-right font-label text-xs">
                  <span className="text-[#e0c0b0] block">{t('trackingNumLabel')}</span>
                  <span className="text-[#ff7700] font-bold">{selectedOrder.trackingNumber}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <span className="font-label text-xs text-[#ffb68d] font-bold uppercase block">
                  {t('orderStatus')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-label text-[11px] text-center">
                  {statusSteps.map((stepName, idx) => {
                    const currentIdx = getStepIndex(selectedOrder.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={stepName}
                        className={`p-2.5 border-2 flex flex-col items-center justify-center gap-1.5 transition-colors ${
                          isCurrent
                            ? 'bg-[#ff7700] text-black border-[#ff7700] font-bold retro-shadow animate-pulse'
                            : isCompleted
                            ? 'bg-[#00a68d] text-black border-[#00a68d] font-bold'
                            : 'bg-[#1d1e30] text-[#584235] border-[#584235]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className="leading-tight uppercase">{stepName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* POS Terminal Sync Badge */}
              <div className="bg-[#111223] border-2 border-[#00a68d] p-3 flex justify-between items-center text-xs font-label">
                <div className="flex items-center gap-2 text-[#00a68d] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00a68d] animate-ping"></span>
                  <span>ILYASVIELSHOP POS STORE RECORDED</span>
                </div>
                <span className="text-[#ff7700] font-pixel text-[10px]">[TERMINAL #01]</span>
              </div>

              {/* Shipping & Payment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-label text-xs">
                <div className="bg-[#1d1e30] border border-[#584235] p-3 space-y-1">
                  <span className="text-[#ffb68d] font-bold block uppercase">
                    {language === 'ID' ? 'ALAMAT PENGIRIMAN:' : 'DESTINATION ADDRESS:'}
                  </span>
                  <p className="text-[#e1e0f9]">{selectedOrder.shipping.fullName}</p>
                  <p className="text-[#e0c0b0]">{selectedOrder.shipping.address}</p>
                  <p className="text-[#e0c0b0]">
                    {selectedOrder.shipping.city}, {selectedOrder.shipping.zipCode}
                  </p>
                  <p className="text-[#59dbc0]">Phone: {selectedOrder.shipping.phone}</p>
                </div>

                <div className="bg-[#1d1e30] border border-[#584235] p-3 space-y-1">
                  <span className="text-[#ffb68d] font-bold block uppercase">
                    {language === 'ID' ? 'KURIR & PEMBAYARAN:' : 'COURIER & PAYMENT:'}
                  </span>
                  <p className="text-[#e1e0f9] font-bold">{selectedOrder.courier.name}</p>
                  <p className="text-[#e0c0b0]">
                    {language === 'ID' ? 'Ongkir (Shipping Fee):' : 'Shipping Fee:'}{' '}
                    <span className="text-[#ff7700] font-bold">{formatPrice(selectedOrder.shippingFee, language)}</span>
                  </p>
                  <p className="text-[#59dbc0]">Payment: {selectedOrder.paymentMethod}</p>
                  <p className="text-[#ffb68d] font-mono">
                    {language === 'ID' ? 'No. Resi:' : 'Tracking #:'}{' '}
                    <strong className="text-[#ff7700]">{selectedOrder.trackingNumber}</strong>
                  </p>
                  {selectedOrder.vaNumber && (
                    <p className="text-[#ff7700] font-bold">VA: {selectedOrder.vaNumber}</p>
                  )}
                  <p className="text-[#e1e0f9] font-bold pt-1 border-t border-[#323346]">
                    Total Paid: {formatPrice(selectedOrder.total, language)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-label text-xs text-[#ffb68d] font-bold uppercase block">
                  {language === 'ID' ? 'RINCIAN BARANG (ORDER ITEMS):' : 'ORDER ITEMS:'}
                </span>
                <div className="space-y-2">
                  {selectedOrder.items.length === 0 ? (
                    <div className="bg-[#1d1e30] border border-[#323346] p-3 text-center text-[#ffb4ab] font-label text-xs">
                      {language === 'ID' ? 'Tidak ada rincian barang.' : 'No items detail available.'}
                    </div>
                  ) : (
                    selectedOrder.items.map((it, idx) => (
                      <div
                        key={it.product.id + '-' + idx}
                        className="bg-[#1d1e30] border border-[#323346] p-3 flex justify-between items-center font-label text-xs retro-shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={it.product.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231d1e30"/><text x="50%" y="50%" fill="%23ffb68d" font-family="monospace" font-size="10" text-anchor="middle">NO IMG</text></svg>'}
                            alt={it.product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded bg-[#0b0d1d] p-0.5 border border-[#584235]"
                          />
                          <div>
                            <span className="text-[#59dbc0] font-bold block text-sm">
                              {it.quantity}x {getProductName(it.product, language)}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#e0c0b0] mt-0.5">
                              <span className="text-[#ffb68d] font-mono">{it.product.sku || `SKU: ${it.product.id}`}</span>
                              <span>•</span>
                              <span>Qty: <strong className="text-white font-bold">{it.quantity}</strong></span>
                              <span>•</span>
                              <span>@ {formatPrice(it.product.price, language)}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[#ff7700] font-bold text-sm">
                          {formatPrice(it.product.price * it.quantity, language)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center bg-[#111223] border-2 border-[#584235] p-6 text-[#ffb4ab] font-label text-xs">
              {t('orderNotFound')}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
