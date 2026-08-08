import React from 'react';
import { Product, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice, getProductName, getProductDescription } from '../lib/formatters';
import { soundFx } from '../lib/sound';

interface ProductCardProps {
  product: Product;
  language: Language;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  onAddToCart,
  onSelectProduct
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    soundFx.playAddToCart();
    onAddToCart(product);
  };

  return (
    <div 
      onClick={() => {
        soundFx.playClick();
        onSelectProduct(product);
      }}
      className="retro-window flex flex-col h-full bg-[#1d1e30] group cursor-pointer hover:border-[#ff7700] transition-colors overflow-hidden"
    >
      {/* Card Content */}
      <div className="p-4 flex-grow flex flex-col gap-3">
        {/* Image Frame */}
        <div className="aspect-square bg-[#0b0d1d] retro-border-sm relative overflow-hidden pixel-inset">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
          />

          {/* SKU Badge */}
          <div className="absolute top-2 left-2 bg-[#111223]/90 text-[#59dbc0] font-label text-[10px] font-bold px-2 py-0.5 border border-[#00a68d]">
            {product.sku || `SKU: ${product.id}`}
          </div>

          {/* Price Tag Badge */}
          <div className="absolute top-3 right-3 bg-[#59dbc0] text-[#00382e] font-headline text-base sm:text-lg font-bold px-3 py-1 retro-border-sm retro-shadow rotate-3 group-hover:rotate-6 transition-transform">
            {formatPrice(product.price, language)}
          </div>

          {/* Condition Badge */}
          <div className="absolute bottom-2 left-2 bg-[#111223]/90 text-[#ffb68d] font-label text-[10px] px-2 py-0.5 border border-[#ffb68d]">
            {product.condition}
          </div>

          {/* Stock Badge */}
          <div className={`absolute bottom-2 right-2 font-label text-[10px] font-bold px-2 py-0.5 border ${
            isOutOfStock 
              ? 'bg-[#2a131a]/95 text-[#ffb4ab] border-[#ffb4ab]' 
              : 'bg-[#111223]/95 text-[#00a68d] border-[#00a68d]'
          }`}>
            {isOutOfStock ? (language === 'ID' ? 'Stok Habis' : 'Out of Stock') : (language === 'ID' ? `Tersedia: ${product.stock} item` : `Stock: ${product.stock}`)}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-headline text-lg font-bold text-[#e1e0f9] group-hover:text-[#ff7700] transition-colors uppercase line-clamp-1">
            {getProductName(product, language)}
          </h3>
          <p className="font-body text-xs text-[#e0c0b0] mt-1 line-clamp-2">
            {getProductDescription(product, language)}
          </p>
        </div>

        {/* Rating Stars & Stock info */}
        <div className="mt-auto flex justify-between items-center pt-3 border-t-2 border-[#323346]">
          {/* Stock Indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-[#ffb4ab]' : 'bg-[#59dbc0] animate-pulse'}`}></span>
            <span className={`font-label text-[11px] ${isOutOfStock ? 'text-[#ffb4ab]' : 'text-[#e0c0b0]'}`}>
              {isOutOfStock ? t('outOfStock') : `${t('liveStock')}: ${product.stock}`}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[#ff7700] text-xs font-label">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playClick();
              onSelectProduct(product);
            }}
            className="retro-btn flex-1 bg-[#1d1e30] text-[#e1e0f9] hover:bg-[#323346] font-label text-xs font-bold py-2 uppercase text-center"
          >
            {t('viewDetails')}
          </button>
          
          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`retro-btn px-4 py-2 font-label text-xs font-bold uppercase ${
              isOutOfStock
                ? 'bg-[#323346] text-[#584235] cursor-not-allowed shadow-none'
                : 'bg-[#ff7700] text-black hover:bg-[#ffb68d]'
            }`}
          >
            {isOutOfStock ? t('noStock') : t('buy')}
          </button>
        </div>
      </div>
    </div>
  );
};
