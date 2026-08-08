import React, { useState, useEffect } from 'react';
import { Product, Review, Language } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice, getProductName, getProductDescription } from '../lib/formatters';
import { soundFx } from '../lib/sound';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
  language: Language;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddReview,
  language
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewToast, setReviewToast] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        soundFx.playClose();
        onClose();
      }
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-bounce">
        <div className="retro-window bg-[#1d1e30] border-2 border-[#00a68d] shadow-lg p-2.5 flex items-center gap-3">
          <span className="font-pixel text-xs text-[#00a68d] font-bold uppercase truncate max-w-[200px]">
            {getProductName(product, language)}
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setIsMinimized(false);
            }}
            className="retro-btn bg-[#00a68d] text-black px-2 py-1 text-xs font-bold cursor-pointer"
            title="Expand Window"
          >
            [ + ] EXPAND
          </button>
          <button
            onClick={() => {
              soundFx.playClose();
              setIsMinimized(false);
              onClose();
            }}
            className="retro-btn bg-[#ff7700] text-black px-2 py-1 text-xs font-bold cursor-pointer"
            title="Close Window"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleQuantityChange = (delta: number) => {
    soundFx.playClick();
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    soundFx.playAddToCart();
    onAddToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    soundFx.playSuccess();
    onAddReview(product.id, {
      username: reviewerName.startsWith('@') ? reviewerName : `@${reviewerName}`,
      rating: reviewRating,
      comment: reviewComment,
      verified: true
    });

    setReviewerName('');
    setReviewComment('');
    setReviewRating(5);
    setReviewToast(true);
    setTimeout(() => setReviewToast(false), 3000);
  };

  return (
    <div 
      onClick={() => {
        soundFx.playClose();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div 
        className="retro-window w-full max-w-4xl bg-[#1d1e30] max-h-[90vh] flex flex-col my-auto relative overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="window-header bg-[#00a68d] p-3 flex justify-between items-center text-black">
          <span className="font-headline text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-base">desktop_windows</span>
            {getProductName(product, language)}
          </span>
          <div className="window-controls flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setIsMinimized(true);
              }}
              className="win-btn bg-[#1d1e30] text-[#00a68d] hover:bg-[#00a68d] hover:text-black cursor-pointer font-bold px-1.5"
              title="Minimize window"
            >
              _
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClose();
                onClose();
              }}
              className="win-btn bg-[#ff7700] text-black hover:bg-[#ffb68d] cursor-pointer font-bold px-1.5"
              title="Close window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-grow">
          {/* Top Section: Split Layout Image Gallery & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Product Image & Gallery */}
            <div className="flex flex-col gap-4">
              <div className="aspect-square bg-[#0b0d1d] retro-border-sm overflow-hidden relative p-2 flex items-center justify-center pixel-inset">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedImageIndex(idx);
                      }}
                      className={`w-16 h-16 border-2 bg-[#0b0d1d] p-1 flex-shrink-0 ${
                        selectedImageIndex === idx ? 'border-[#ff7700] retro-shadow' : 'border-[#584235] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 border-2 border-[#ff7700] bg-[#111223] px-2.5 py-1">
                    <span className="text-[#ff7700] font-label text-xs uppercase font-bold">
                      {product.sku || `SKU: ${product.id}`}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 border-2 border-[#00a68d] bg-[#111223] px-2.5 py-1">
                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-[#ffb4ab]' : 'bg-[#59dbc0] animate-pulse'}`}></span>
                    <span className="text-[#59dbc0] font-label text-xs uppercase font-bold">
                      {isOutOfStock ? (language === 'ID' ? 'Stok Habis' : 'Out of Stock') : (language === 'ID' ? `Tersedia: ${product.stock} item` : `In Stock: ${product.stock}`)}
                    </span>
                  </div>
                </div>

                <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#e1e0f9] tracking-tight uppercase">
                  {getProductName(product, language)}
                </h1>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex text-[#ff7700]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className="material-symbols-outlined text-base"
                        style={{ fontVariationSettings: star <= Math.round(product.rating) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[#e0c0b0] font-label text-xs">
                    ({product.reviews.length} {t('testimonialsTitle')})
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#111223] border-2 border-[#584235] p-3.5 pixel-inset">
                <p className="font-body text-sm text-[#e0c0b0] leading-relaxed">
                  {getProductDescription(product, language)}
                </p>
              </div>

              {/* Price Tag */}
              <div className="flex items-center gap-4 py-2">
                <div className="bg-[#ff7700] text-black border-4 border-[#0b0d1d] px-5 py-2.5 retro-shadow rotate-[-1deg]">
                  <span className="font-label text-xs block opacity-80 uppercase font-bold">{t('price')}</span>
                  <span className="font-headline text-2xl sm:text-3xl font-bold">{formatPrice(product.price, language)}</span>
                </div>

                <div className="flex flex-col text-xs font-label text-[#59dbc0] gap-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">local_shipping</span> {t('freeShipping')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span> {t('warranty')}
                  </span>
                </div>
              </div>

              {/* Quantity & Add to Cart Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex items-center border-4 border-[#0b0d1d] bg-[#111223] h-12 w-32 retro-shadow">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-10 h-full hover:bg-[#323346] text-[#ff7700] font-bold font-label text-lg flex items-center justify-center disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-headline text-lg font-bold text-[#e1e0f9]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-10 h-full hover:bg-[#323346] text-[#ff7700] font-bold font-label text-lg flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 retro-btn-lg h-12 flex items-center justify-center gap-2 font-headline text-sm font-bold uppercase ${
                    isOutOfStock
                      ? 'bg-[#323346] text-[#584235] cursor-not-allowed'
                      : 'bg-[#ff7700] text-black hover:bg-[#ffb68d]'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    shopping_cart
                  </span>
                  <span>{isOutOfStock ? t('noStock') : t('addToCart')}</span>
                </button>
              </div>

              {/* Toast Feedback */}
              {addedToast && (
                <div className="bg-[#00a68d] text-black font-label text-xs font-bold p-2 retro-border-sm text-center animate-bounce">
                  ✓ ADDED {quantity} ITEM(S) TO MEMORY CART!
                </div>
              )}
            </div>
          </div>

          {/* Specs Table Window */}
          {product.specs && product.specs.length > 0 && (
            <div className="retro-window bg-[#111223]">
              <div className="window-header bg-[#59dbc0] p-2 text-[#00382e] font-bold text-xs uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-base">description</span>
                {t('specsTitle')}
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-label text-xs">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-[#323346] pb-1.5">
                    <span className="font-bold text-[#ffb68d] uppercase">{spec.label}:</span>
                    <span className="text-[#e1e0f9]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="space-y-4">
            <h3 className="font-headline text-xl text-[#ff7700] uppercase border-b-4 border-[#ff7700] pb-1.5 inline-block">
              {t('testimonialsTitle')} ({product.reviews.length})
            </h3>

            {/* Existing Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.length === 0 ? (
                <div className="p-4 bg-[#111223] border-2 border-[#584235] text-[#e0c0b0] font-label text-xs col-span-2 text-center">
                  {t('noReviewsYet')}
                </div>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="retro-window bg-[#111223] flex flex-col">
                    <div className="bg-[#323346] px-3 py-1.5 flex justify-between items-center text-xs font-label">
                      <span className="text-[#59dbc0] font-bold">{rev.username}</span>
                      <span className="text-[#e0c0b0]">{rev.date}</span>
                    </div>
                    <div className="p-3 flex-grow flex flex-col gap-2">
                      <div className="flex text-[#ff7700]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: s <= rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className="font-body text-xs text-[#e1e0f9]">"{rev.comment}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Interactive Review Form */}
            <div className="retro-window bg-[#111223] p-4 space-y-3 mt-6">
              <h4 className="font-headline text-base text-[#59dbc0] uppercase font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">rate_review</span>
                {t('writeReview')}
              </h4>

              {reviewToast && (
                <div className="bg-[#00a68d] text-black font-label text-xs font-bold p-2 text-center retro-border-sm">
                  ✓ {t('reviewSubmitted')}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 font-label text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#ffb68d] font-bold">{t('yourName')}</label>
                    <input
                      type="text"
                      required
                      placeholder="@handle"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2 text-[#e1e0f9] focus:border-[#ff7700] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#ffb68d] font-bold">{t('ratingLabel')}</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-[#1d1e30] border-2 border-[#584235] p-2 text-[#e1e0f9] focus:border-[#ff7700] outline-none rounded-none cursor-pointer"
                    >
                      <option value={5}>★★★★★ (5 Stars)</option>
                      <option value={4}>★★★★☆ (4 Stars)</option>
                      <option value={3}>★★★☆☆ (3 Stars)</option>
                      <option value={2}>★★☆☆☆ (2 Stars)</option>
                      <option value={1}>★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#ffb68d] font-bold">{t('yourComment')}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter retro performance log..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="bg-[#1d1e30] border-2 border-[#584235] p-2 text-[#e1e0f9] focus:border-[#ff7700] outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="retro-btn bg-[#ff7700] text-black font-bold px-4 py-2 uppercase hover:bg-[#ffb68d]"
                >
                  {t('submitReview')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
