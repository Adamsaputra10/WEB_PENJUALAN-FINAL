import React, { useState } from 'react';
import { CartItem, Courier, PaymentMethod, ShippingDetails, Order, Language } from '../types';
import { COURIER_OPTIONS } from '../data/products';
import { getTranslation } from '../lib/translations';
import { formatPrice, getProductName } from '../lib/formatters';
import { soundFx } from '../lib/sound';
import { saveOrderToSupabase } from '../lib/supabase';

interface CheckoutWizardProps {
  cart: CartItem[];
  appliedDiscountPercent: number;
  onCompleteOrder: (order: Order) => void;
  onCancelCheckout: () => void;
  language: Language;
}

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  cart,
  appliedDiscountPercent,
  onCompleteOrder,
  onCancelCheckout,
  language
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [step, setStep] = useState<number>(1);
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: 'Player One',
    email: 'player1@retroshop.net',
    phone: '555-0199',
    address: '128 Bit Lane, Apt 404',
    city: 'Neo Tokyo',
    zipCode: '90210'
  });

  const [selectedCourier, setSelectedCourier] = useState<Courier>(COURIER_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * appliedDiscountPercent) / 100;
  const shippingFee = selectedCourier.price;
  const taxes = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shippingFee + taxes;

  const handleNextStep = () => {
    soundFx.playClick();
    if (step < 3) {
      setStep((s) => s + 1);
    }
  };

  const handleBackStep = () => {
    soundFx.playClick();
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onCancelCheckout();
    }
  };

  const handleFinalSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    soundFx.playSuccess();

    try {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const newOrder: Order = {
        id: `RETRO-${randomNum}`,
        date: new Date().toISOString().split('T')[0],
        items: cart,
        shipping,
        courier: selectedCourier,
        paymentMethod,
        subtotal,
        shippingFee,
        discount,
        total,
        status: 'ORDER PLACED',
        trackingNumber: `RES-${Math.floor(10000000 + Math.random() * 90000000)}`,
        vaNumber: paymentMethod === 'VA' ? `8830199${Math.floor(100000 + Math.random() * 900000)}` : undefined
      };

      // Save to Supabase database (orders & order_items tables) + reduce stock in products table exactly 1 time
      await saveOrderToSupabase(newOrder);

      // Immediately navigate to order track screen and clear cart without hanging
      onCompleteOrder(newOrder);
    } catch (err) {
      console.error('[Checkout] Error submitting order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Processing Loader Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="retro-window w-full max-w-md bg-[#1d1e30] p-6 text-center space-y-6">
            <div className="window-header bg-[#ff7700] p-2 text-black font-bold font-headline text-sm">
              SYSTEM_BUSY.EXE
            </div>
            <div className="space-y-4 py-4">
              <span className="material-symbols-outlined text-6xl text-[#ff7700] animate-spin">
                sync
              </span>
              <p className="font-pixel text-xs text-[#59dbc0] animate-pulse">
                {t('orderProcessing')}
              </p>
              <div className="w-full bg-[#111223] h-4 border-2 border-[#0b0d1d] overflow-hidden">
                <div className="bg-[#ff7700] h-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Installation Wizard Window */}
        <div className="lg:col-span-8 retro-window bg-[#1d1e30] flex flex-col">
          {/* Title Bar */}
          <div className="window-header bg-[#00a68d] px-4 py-2.5 flex justify-between items-center text-black">
            <h1 className="font-headline text-base font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                package_2
              </span>
              {t('checkoutTitle')}
            </h1>
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
                  onCancelCheckout();
                }}
                className="win-btn bg-[#ff7700] text-black hover:bg-[#ffb68d] cursor-pointer font-bold px-2 py-0.5"
                title="Cancel Checkout (Close)"
              >
                X
              </button>
            </div>
          </div>

          {/* Wizard Content Body */}
          {!isMinimized && (
            <>
              <div className="p-6 bg-[#191a2b] flex flex-col gap-8 flex-grow">
            {/* Steps Progress Indicator */}
            <div className="border-b-2 border-[#584235] border-dashed pb-4">
              <div className="flex justify-between items-center font-label text-xs font-bold text-[#ffb68d] uppercase mb-2">
                <span>
                  {step === 1 && t('step1')}
                  {step === 2 && t('step2')}
                  {step === 3 && t('step3')}
                </span>
                <span>STEP {step} OF 3</span>
              </div>
              <div className="w-full bg-[#111223] border-2 border-[#0b0d1d] h-3">
                <div
                  className="bg-[#00a68d] h-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* STEP 1: Shipping Coordinates */}
            {step === 1 && (
              <section className="space-y-4">
                <h2 className="font-headline text-lg text-[#ff7700] uppercase font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">map</span>
                  {t('step1')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-label text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#e1e0f9] font-bold">{t('fullName')}</label>
                    <input
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#e1e0f9] font-bold">{t('email')}</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#e1e0f9] font-bold">{t('phone')}</label>
                    <input
                      type="text"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[#e1e0f9] font-bold">{t('streetAddress')}</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#e1e0f9] font-bold">{t('cityNode')}</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#e1e0f9] font-bold">{t('zipCode')}</label>
                    <input
                      type="text"
                      value={shipping.zipCode}
                      onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2.5 text-[#e1e0f9] focus:border-[#ff7700] outline-none pixel-inset"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: Courier Protocol */}
            {step === 2 && (
              <section className="space-y-4">
                <h2 className="font-headline text-lg text-[#ff7700] uppercase font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">local_shipping</span>
                  {t('selectCourier')}
                </h2>

                <div className="space-y-3 font-label text-xs">
                  {COURIER_OPTIONS.map((c) => (
                    <label
                      key={c.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedCourier(c);
                      }}
                      className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        selectedCourier.id === c.id
                          ? 'border-[#ff7700] bg-[#1d1e30] retro-shadow'
                          : 'border-[#584235] bg-[#111223] hover:border-[#59dbc0]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourier.id === c.id}
                          onChange={() => setSelectedCourier(c)}
                          className="accent-[#ff7700] w-4 h-4 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#e1e0f9]">{c.name}</span>
                          <span className="text-[#e0c0b0] font-normal">{c.estimatedDays}</span>
                        </div>
                      </div>
                      <span className="font-headline text-sm font-bold text-[#ff7700]">{formatPrice(c.price, language)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3: Payment Protocol */}
            {step === 3 && (
              <section className="space-y-5">
                <h2 className="font-headline text-lg text-[#ff7700] uppercase font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                  {t('paymentProtocol')}
                </h2>

                {/* Radio Payment Options */}
                <div className="space-y-3 font-label text-xs">
                  {/* Virtual Account */}
                  <label
                    onClick={() => {
                      soundFx.playClick();
                      setPaymentMethod('VA');
                    }}
                    className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'VA'
                        ? 'border-[#ff7700] bg-[#1d1e30] retro-shadow'
                        : 'border-[#584235] bg-[#111223] hover:border-[#59dbc0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'VA'}
                        onChange={() => setPaymentMethod('VA')}
                        className="accent-[#ff7700] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-[#e1e0f9]">{t('virtualAccount')}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#59dbc0]">account_balance</span>
                  </label>

                  {/* QRIS Scan */}
                  <label
                    onClick={() => {
                      soundFx.playClick();
                      setPaymentMethod('QRIS');
                    }}
                    className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'QRIS'
                        ? 'border-[#ff7700] bg-[#1d1e30] retro-shadow'
                        : 'border-[#584235] bg-[#111223] hover:border-[#59dbc0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'QRIS'}
                        onChange={() => setPaymentMethod('QRIS')}
                        className="accent-[#ff7700] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-[#e1e0f9]">{t('qrisScan')}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#ff7700]">qr_code_2</span>
                  </label>

                  {/* COD */}
                  <label
                    onClick={() => {
                      soundFx.playClick();
                      setPaymentMethod('COD');
                    }}
                    className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'COD'
                        ? 'border-[#ff7700] bg-[#1d1e30] retro-shadow'
                        : 'border-[#584235] bg-[#111223] hover:border-[#59dbc0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-[#ff7700] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-[#e1e0f9]">{t('cod')}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#e0c0b0]">local_shipping</span>
                  </label>
                </div>

                {/* QRIS Preview graphics if selected */}
                {paymentMethod === 'QRIS' && (
                  <div className="bg-[#111223] border-2 border-[#00a68d] p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left pixel-inset">
                    <div className="w-28 h-28 bg-[#1d1e30] border-4 border-[#0b0d1d] p-2 flex items-center justify-center retro-shadow">
                      {/* Pixelated QR Graphic */}
                      <div className="w-full h-full bg-[#0b0d1d] p-1 grid grid-cols-5 gap-0.5">
                        <div className="bg-[#ff7700] col-span-2 row-span-2"></div>
                        <div className="bg-[#59dbc0]"></div>
                        <div className="bg-[#ff7700] col-span-2 row-span-2"></div>
                        <div className="bg-[#59dbc0]"></div>
                        <div className="bg-[#ff7700]"></div>
                        <div className="bg-[#59dbc0]"></div>
                        <div className="bg-[#ff7700]"></div>
                        <div className="bg-[#59dbc0]"></div>
                        <div className="bg-[#ff7700] col-span-2 row-span-2"></div>
                        <div className="bg-[#59dbc0]"></div>
                        <div className="bg-[#ff7700]"></div>
                      </div>
                    </div>
                    <div className="font-label text-xs space-y-1 text-[#e1e0f9]">
                      <span className="text-[#59dbc0] font-bold block">[DYNAMIC RETRO QRIS READY]</span>
                      <p className="text-[#e0c0b0]">
                        Scan with any banking app or e-wallet to complete protocol authentication.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Footer Wizard Controls */}
          <div className="p-4 bg-[#0b0d1d] border-t-4 border-[#584235] flex justify-between items-center">
            <button
              onClick={handleBackStep}
              className="retro-btn bg-[#323346] text-[#e1e0f9] font-label text-xs font-bold px-6 py-2.5 uppercase"
            >
              {t('back')}
            </button>

            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="retro-btn bg-[#ff7700] text-black font-label text-xs font-bold px-6 py-2.5 uppercase hover:bg-[#ffb68d]"
              >
                {t('next')}
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={isProcessing}
                className="retro-btn-lg bg-[#00a68d] text-black font-headline text-xs font-bold px-8 py-3 uppercase hover:bg-[#59dbc0] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                {t('completeOrder')}
              </button>
            )}
          </div>
            </>
          )}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-4 retro-window bg-[#1d1e30] flex flex-col sticky top-[90px]">
          <div className="window-header bg-[#ff7700] text-black px-4 py-2 border-b-4 border-[#0b0d1d] flex justify-between items-center">
            <h2 className="font-headline text-sm font-bold uppercase tracking-tight">{t('orderSummary')}</h2>
            <span className="font-pixel text-[10px] bg-black text-[#ff7700] px-1.5 py-0.5">{cart.length} ITEMS</span>
          </div>

          <div className="p-4 bg-[#191a2b] space-y-5">
            {/* Items List */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center border-b border-[#323346] pb-2">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 bg-[#0b0d1d] border border-[#0b0d1d] object-contain p-0.5 flex-shrink-0"
                  />
                  <div className="flex flex-col flex-grow font-label text-xs">
                    <span className="text-[#e1e0f9] font-bold line-clamp-1">{getProductName(item.product, language)}</span>
                    <span className="text-[#e0c0b0]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-headline text-xs font-bold text-[#ff7700]">
                    {formatPrice(item.product.price * item.quantity, language)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 font-label text-xs text-[#e0c0b0]">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span>{formatPrice(subtotal, language)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#59dbc0]">
                  <span>{t('discount')}:</span>
                  <span>-{formatPrice(discount, language)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('shippingFee')}:</span>
                <span>{formatPrice(shippingFee, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('taxes')}:</span>
                <span>{formatPrice(taxes, language)}</span>
              </div>

              <div className="flex justify-between text-[#ff7700] font-headline text-lg font-bold pt-2 border-t border-[#323346]">
                <span>{t('total')}:</span>
                <span>{formatPrice(total, language)}</span>
              </div>
            </div>

            {/* Ilyasvielshop POS Queue Indicator */}
            <div className="bg-[#111223] border-2 border-[#00a68d] p-3 text-center space-y-1 retro-border-sm">
              <div className="flex items-center justify-center gap-1.5 text-[#00a68d] font-label text-[11px] font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00a68d] animate-ping"></span>
                <span>ILYASVIELSHOP POS QUEUE ACTIVE</span>
              </div>
              <p className="font-body text-[10px] text-[#e0c0b0]">
                {language === 'ID' 
                  ? 'Transaksi ini akan otomatis diteruskan ke antrean kasir sistem Ilyasvielshop POS.' 
                  : 'This transaction will be automatically forwarded to the Ilyasvielshop POS system queue.'}
              </p>
            </div>

            <div className="text-center font-label text-[10px] text-[#59dbc0] border-t border-[#323346] pt-2">
              {t('secureEncryption')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
