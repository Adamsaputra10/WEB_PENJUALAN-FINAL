import React, { useState } from 'react';
import { CartItem, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice, getProductName } from '../lib/formatters';
import { soundFx } from '../lib/sound';

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (appliedDiscountPercent: number) => void;
  onContinueShopping: () => void;
  language: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
  language
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxes = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + taxes;

  const handleApplyPromo = () => {
    soundFx.playClick();
    if (promoCode.trim().toUpperCase() === 'Y2K1999' || promoCode.trim().toUpperCase() === 'RETRO15') {
      soundFx.playSuccess();
      setDiscountPercent(15);
      setPromoMsg({ text: t('promoSuccess'), success: true });
    } else {
      setDiscountPercent(0);
      setPromoMsg({ text: t('promoInvalid'), success: false });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Retro Window Header */}
      <div className="retro-window bg-[#1d1e30]">
        <div className="window-header bg-[#ff7700] p-3 flex justify-between items-center text-black">
          <span className="font-headline text-base font-bold uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_cart
            </span>
            {t('cartTitle')} ({cart.reduce((sum, i) => sum + i.quantity, 0)} ITEMS)
          </span>
          <div className="window-controls flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMinimized((prev) => !prev);
              }}
              className="win-btn bg-[#1d1e30] text-[#ff7700] hover:bg-black hover:text-[#ff7700] cursor-pointer font-bold px-2 py-0.5"
              title={isMinimized ? "Expand Window" : "Minimize Window"}
            >
              {isMinimized ? '+' : '_'}
            </button>
            <button
              onClick={() => {
                soundFx.playClose();
                onContinueShopping();
              }}
              className="win-btn bg-[#00a68d] text-black hover:bg-[#59dbc0] cursor-pointer font-bold px-2 py-0.5"
              title="Close Cart (Return to Products)"
            >
              X
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 sm:p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-4 bg-[#111223] border-2 border-[#584235] p-6 pixel-inset">
              <span className="material-symbols-outlined text-6xl text-[#584235]">remove_shopping_cart</span>
              <h3 className="font-headline text-xl text-[#ffb68d] font-bold uppercase">{t('cartEmpty')}</h3>
              <p className="font-body text-xs text-[#e0c0b0] max-w-md">{t('cartEmptyMsg')}</p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onContinueShopping();
                }}
                className="retro-btn bg-[#ff7700] text-black font-label text-xs font-bold px-6 py-2.5 uppercase mt-2"
              >
                &lt; {t('viewProducts')}
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item) => {
                  const itemTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="bg-[#111223] border-2 border-[#584235] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 retro-shadow"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-[#0b0d1d] border border-[#ff7700] p-1 flex-shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="font-headline text-sm font-bold text-[#e1e0f9] uppercase">
                            {getProductName(item.product, language)}
                          </span>
                          <span className="font-label text-[10px] text-[#ffb68d] font-mono">
                            {item.product.sku || `SKU: ${item.product.id}`}
                          </span>
                          <span className="font-label text-xs text-[#59dbc0]">
                            {formatPrice(item.product.price, language)} each
                          </span>
                          <span className="font-label text-[10px] text-[#e0c0b0] uppercase">
                            {item.product.category} • {item.product.condition}
                          </span>
                        </div>
                      </div>

                      {/* Controls: Qty & Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        {/* Qty Buttons */}
                        <div className="flex items-center border-2 border-[#0b0d1d] bg-[#1d1e30]">
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onUpdateQuantity(item.product.id, -1);
                            }}
                            className="w-8 h-8 hover:bg-[#323346] text-[#ff7700] font-bold font-label flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-headline text-sm font-bold text-[#e1e0f9]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onUpdateQuantity(item.product.id, 1);
                            }}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 hover:bg-[#323346] text-[#ff7700] font-bold font-label flex items-center justify-center disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="font-headline text-base font-bold text-[#ff7700] min-w-[100px] text-right">
                          {formatPrice(itemTotal, language)}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => {
                            soundFx.playClose();
                            onRemoveItem(item.product.id);
                          }}
                          className="w-8 h-8 bg-[#323346] hover:bg-[#93000a] text-[#ffb4ab] hover:text-white border border-[#0b0d1d] flex items-center justify-center font-bold text-xs"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Input & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-[#323346]">
                {/* Promo Code Box */}
                <div className="bg-[#111223] border-2 border-[#584235] p-4 space-y-3 pixel-inset">
                  <label className="font-label text-xs uppercase text-[#ffb68d] font-bold block">
                    PROMO / DISCOUNT KEY
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={t('promoPlaceholder')}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2 font-label text-xs text-[#e1e0f9] focus:border-[#ff7700] outline-none flex-grow uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="retro-btn bg-[#00a68d] text-black font-label text-xs font-bold px-4 uppercase hover:bg-[#59dbc0]"
                    >
                      {t('applyPromo')}
                    </button>
                  </div>

                  {promoMsg && (
                    <p className={`font-label text-xs font-bold ${promoMsg.success ? 'text-[#59dbc0]' : 'text-[#ffb4ab]'}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </div>

                {/* Totals Box */}
                <div className="bg-[#111223] border-2 border-[#584235] p-4 space-y-2 font-label text-xs pixel-inset">
                  <div className="flex justify-between text-[#e0c0b0]">
                    <span>{t('subtotal')}:</span>
                    <span>{formatPrice(subtotal, language)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#59dbc0]">
                      <span>{t('discount')} ({discountPercent}%):</span>
                      <span>-{formatPrice(discountAmount, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#e0c0b0]">
                    <span>{t('taxes')}:</span>
                    <span>{formatPrice(taxes, language)}</span>
                  </div>

                  <div className="flex justify-between text-[#ff7700] font-headline text-xl font-bold pt-2 border-t border-[#323346]">
                    <span>{t('total')}:</span>
                    <span>{formatPrice(total, language)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    soundFx.playClose();
                    onClearCart();
                  }}
                  className="font-label text-xs text-[#ffb4ab] hover:underline uppercase"
                >
                  [ {t('clearCart')} ]
                </button>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onContinueShopping();
                    }}
                    className="retro-btn bg-[#323346] text-[#e1e0f9] font-label text-xs font-bold px-4 py-3 uppercase flex-1 sm:flex-initial"
                  >
                    &lt; {t('navProducts')}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      onProceedToCheckout(discountPercent);
                    }}
                    className="retro-btn-lg bg-[#ff7700] text-black font-headline text-sm font-bold px-6 py-3 uppercase hover:bg-[#ffb68d] flex-1 sm:flex-initial flex items-center justify-center gap-2"
                  >
                    <span>{t('checkout')}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
