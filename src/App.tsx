import { useState, useMemo, useEffect } from 'react';
import {
  NavTab,
  Language,
  Theme,
  Product,
  CartItem,
  Order,
  FilterState,
  Review,
  UserProfile
} from './types';
import { INITIAL_PRODUCTS, COURIER_OPTIONS } from './data/products';
import { getTranslation } from './lib/translations';
import { soundFx } from './lib/sound';
import { fetchLiveProducts, fetchLiveOrders, supabase } from './lib/supabase';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutWizard } from './components/CheckoutWizard';
import { OrderTracker } from './components/OrderTracker';
import { AuthModal } from './components/AuthModal';

export function App() {
  // Navigation & Preferences State
  const [currentTab, setCurrentTab] = useState<NavTab>('HOME');
  const [language, setLanguage] = useState<Language>('EN');
  const [theme, setTheme] = useState<Theme>('dark');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // User Auth State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);


  // E-Commerce Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [isLoadingLiveProducts, setIsLoadingLiveProducts] = useState<boolean>(true);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(true);

  // Load products and orders live from Supabase + Listen to Realtime changes
  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseData() {
      setIsLoadingLiveProducts(true);
      try {
        const liveProds = await fetchLiveProducts();
        if (isMounted) {
          setProducts(liveProds);
        }
        const liveOrds = await fetchLiveOrders();
        if (isMounted) {
          setOrders(liveOrds);
        }
        setIsSupabaseOnline(true);
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
        setIsSupabaseOnline(false);
      } finally {
        if (isMounted) setIsLoadingLiveProducts(false);
      }
    }

    loadSupabaseData();

    // Realtime postgres_changes subscription for products table (instant stock update without page refresh)
    const productsChannel = supabase
      .channel('public_products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const liveProds = await fetchLiveProducts();
          if (isMounted) {
            setProducts(liveProds);
          }
        }
      )
      .subscribe();

    // Realtime postgres_changes subscription for orders table
    const ordersChannel = supabase
      .channel('public_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const liveOrds = await fetchLiveOrders();
          if (isMounted) {
            setOrders(liveOrds);
          }
        }
      )
      .subscribe();

    // Realtime postgres_changes subscription for order_items table
    const orderItemsChannel = supabase
      .channel('public_order_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const liveOrds = await fetchLiveOrders();
          if (isMounted) {
            setOrders(liveOrds);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(orderItemsChannel);
    };
  }, []);

  // Orders State loaded from Supabase
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals & Selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    categories: [],
    conditions: [],
    inStockOnly: false,
    maxPrice: 100000000,
    sortBy: 'featured'
  });

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Cart Helpers
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, product.stock);
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(newQty, item.product.stock) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Add Custom Review to Product
  const handleAddReview = (productId: string, newReviewData: Omit<Review, 'id' | 'date'>) => {
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        if (p.id === productId) {
          const newReview: Review = {
            ...newReviewData,
            id: `rev-${Date.now()}`,
            date: new Date().toISOString().split('T')[0]
          };
          const updatedReviews = [newReview, ...p.reviews];
          const newAvgRating =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

          const updatedProduct = {
            ...p,
            reviews: updatedReviews,
            rating: Number(newAvgRating.toFixed(1)),
            reviewCount: updatedReviews.length
          };

          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProduct);
          }

          return updatedProduct;
        }
        return p;
      });
    });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (
        filter.searchQuery &&
        !product.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(filter.searchQuery.toLowerCase()) &&
        !product.filename.toLowerCase().includes(filter.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Categories
      if (filter.categories.length > 0 && !filter.categories.includes(product.category)) {
        return false;
      }

      // Conditions
      if (filter.conditions.length > 0 && !filter.conditions.includes(product.condition)) {
        return false;
      }

      // In stock
      if (filter.inStockOnly && product.stock <= 0) {
        return false;
      }

      // Max price
      if (product.price > filter.maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'price-low') return a.price - b.price;
      if (filter.sortBy === 'price-high') return b.price - a.price;
      if (filter.sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, filter]);

  // Order Complete Handler
  const handleOrderComplete = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Re-fetch products from Supabase to get the single updated stock
    try {
      const updatedProds = await fetchLiveProducts();
      if (updatedProds && updatedProds.length > 0) {
        setProducts(updatedProds);
      }
    } catch (err) {
      console.error('Error refreshing live products after checkout:', err);
    }

    // Clear cart & switch to Track Order tab
    setCart([]);
    setCurrentTab('TRACK_ORDER');
  };

  const handleResetFilter = () => {
    setFilter({
      searchQuery: '',
      categories: [],
      conditions: [],
      inStockOnly: false,
      maxPrice: 100000000,
      sortBy: 'featured'
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-body relative bg-[#111223] text-[#e1e0f9]">
      {/* CRT Scanlines Overlay */}
      {crtEnabled && <div className="scanline-overlay"></div>}

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        cartItemCount={totalCartCount}
        language={language}
        onLanguageToggle={(lang) => {
          setLanguage(lang);
        }}
        theme={theme}
        onThemeToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        crtEnabled={crtEnabled}
        onCrtToggle={() => setCrtEnabled((prev) => !prev)}
        soundEnabled={soundEnabled}
        onSoundToggle={() => {
          const next = !soundEnabled;
          soundFx.soundEnabled = next;
          setSoundEnabled(next);
        }}
        userProfile={userProfile}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={() => setUserProfile(null)}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-10 z-10">
        {/* TAB 1: HOME */}
        {currentTab === 'HOME' && (
          <>
            <HeroSection
              language={language}
              onViewProducts={() => setCurrentTab('PRODUCTS')}
            />

            {/* Featured Section */}
            <section className="space-y-6 py-4">
              <div className="retro-window bg-[#00a68d] px-4 py-2 self-start inline-block text-black">
                <h2 className="font-headline text-lg font-bold uppercase">
                  {t('featuredTitle')}
                </h2>
              </div>

              {products.length === 0 ? (
                <div className="py-12 text-center bg-[#1d1e30] border-2 border-[#584235] p-6 text-[#ffb4ab] font-label text-sm font-bold uppercase retro-shadow">
                  {language === 'ID' ? 'Belum Ada Produk' : 'No Products Available'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(products.filter((p) => p.featured).length > 0 ? products.filter((p) => p.featured) : products).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {currentTab === 'PRODUCTS' && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar Filters */}
            <FilterSidebar
              filter={filter}
              onFilterChange={setFilter}
              onResetFilter={handleResetFilter}
              language={language}
            />

            {/* Catalog Grid */}
            <section className="flex-grow space-y-6 w-full">
              {/* Header Bar */}
              <div className="retro-window bg-[#1d1e30] p-3 flex flex-wrap justify-between items-center gap-3">
                <div className="font-headline text-base font-bold text-[#ff7700] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                  <span>{t('navProducts')} ({filteredProducts.length})</span>
                </div>

                <button
                  onClick={handleResetFilter}
                  className="font-label text-xs text-[#59dbc0] hover:underline uppercase"
                >
                  [ {t('resetFilter')} ]
                </button>
              </div>

              {/* Product Grid */}
              {products.length === 0 ? (
                <div className="py-16 text-center bg-[#1d1e30] border-2 border-[#584235] p-6 text-[#ffb4ab] font-label text-sm font-bold uppercase retro-shadow">
                  {language === 'ID' ? 'Belum Ada Produk' : 'No Products Available'}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-[#1d1e30] border-2 border-[#584235] p-6 text-[#ffb4ab] font-label text-xs uppercase retro-shadow">
                  {language === 'ID' ? 'TIDAK ADA PRODUK YANG SESUAI FILTER.' : 'NO PRODUCTS MATCHED YOUR QUERY PARAMETERS.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 3: CART */}
        {currentTab === 'CART' && (
          <CartDrawer
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={(discountPercent) => {
              setAppliedDiscountPercent(discountPercent);
              setCurrentTab('CHECKOUT' as NavTab);
            }}
            onContinueShopping={() => setCurrentTab('PRODUCTS')}
            language={language}
          />
        )}

        {/* CHECKOUT WIZARD */}
        {(currentTab as string) === 'CHECKOUT' && (
          <CheckoutWizard
            cart={cart}
            appliedDiscountPercent={appliedDiscountPercent}
            onCompleteOrder={handleOrderComplete}
            onCancelCheckout={() => setCurrentTab('CART')}
            language={language}
          />
        )}

        {/* TAB 4: TRACK ORDER */}
        {currentTab === 'TRACK_ORDER' && (
          <OrderTracker orders={orders} language={language} />
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onAddReview={handleAddReview}
          language={language}
        />
      )}

      {/* Customer Login & Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setUserProfile(user);
        }}
        language={language}
      />


      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}

export default App;
