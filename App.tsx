
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Home from './views/Home';
import Admin from './views/Admin';
import Consultant from './views/Consultant';
import ProductDetail from './views/ProductDetail';
import Cart from './views/Cart';
import Checkout from './views/Checkout';
import TrialRoom from './views/TrialRoom';
import Orders from './views/Orders';
import InfoPages from './views/InfoPages';
import Favorites from './views/Favorites';
import { Product, ViewMode, CartItem, ProductColor } from './types';
import { INITIAL_PRODUCTS } from './services/mockData';
import { ApiService } from './services/api';
import WhatsAppButton from './components/WhatsAppButton';
import { slugify, findProductBySlug } from './utils/slug';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('avyna_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (productId: string) => {
    setFavoriteIds(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('avyna_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // URL → ViewMode mapping
  const viewModeFromPath = (path: string): ViewMode | null => {
    if (path === '/' || path === '') return ViewMode.HOME;
    if (path === '/admin') return ViewMode.ADMIN;
    if (path === '/danismanlik') return ViewMode.CONSULTANT;
    if (path === '/sepet') return ViewMode.CART;
    if (path === '/odeme') return ViewMode.CHECKOUT;
    if (path === '/deneme-odasi') return ViewMode.TRIAL_ROOM;
    if (path === '/siparisler') return ViewMode.ORDERS;
    if (path === '/payment-success') return ViewMode.PAYMENT_SUCCESS;
    if (path === '/payment-fail') return ViewMode.PAYMENT_FAIL;
    if (path === '/teslimat') return ViewMode.INFO_DELIVERY;
    if (path === '/garanti') return ViewMode.INFO_WARRANTY;
    if (path === '/iletisim') return ViewMode.CONTACT;
    if (path === '/gizlilik') return ViewMode.INFO_PRIVACY;
    if (path === '/mesafeli-satis') return ViewMode.INFO_DISTANCE_SALES;
    if (path === '/favorilerim') return ViewMode.FAVORITES;
    if (path.startsWith('/urun/')) return ViewMode.DETAIL;
    return null;
  };

  // ViewMode → URL mapping
  const pathFromViewMode = (v: ViewMode): string => {
    switch (v) {
      case ViewMode.HOME: return '/';
      case ViewMode.ADMIN: return '/admin';
      case ViewMode.CONSULTANT: return '/danismanlik';
      case ViewMode.CART: return '/sepet';
      case ViewMode.CHECKOUT: return '/odeme';
      case ViewMode.TRIAL_ROOM: return '/deneme-odasi';
      case ViewMode.ORDERS: return '/siparisler';
      case ViewMode.FAVORITES: return '/favorilerim';
      case ViewMode.PAYMENT_SUCCESS: return '/payment-success';
      case ViewMode.PAYMENT_FAIL: return '/payment-fail';
      case ViewMode.INFO_DELIVERY: return '/teslimat';
      case ViewMode.INFO_WARRANTY: return '/garanti';
      case ViewMode.CONTACT: return '/iletisim';
      case ViewMode.INFO_PRIVACY: return '/gizlilik';
      case ViewMode.INFO_DISTANCE_SALES: return '/mesafeli-satis';
      default: return '/';
    }
  };

  // Ürün slug'ını URL'den çıkar
  const getSlugFromPath = (path: string): string | null => {
    const match = path.match(/^\/urun\/([^/?]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const backendProducts = await ApiService.getProducts();
        setProducts(backendProducts as Product[]);
        return backendProducts as Product[];
      } catch (error) {
        console.error("Backend fetch error, falling back to mock:", error);
        setProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      } finally {
        setLoading(false);
      }
    };

    fetchProducts().then((loadedProducts) => {
      // URL'yi analiz et
      const path = window.location.pathname;
      const slug = getSlugFromPath(path);

      if (slug && loadedProducts) {
        // URL'de ürün slug'ı var → ürünü bul ve göster
        const found = findProductBySlug(loadedProducts, slug);
        if (found) {
          setSelectedProduct(found as Product);
          setView(ViewMode.DETAIL);
        }
      } else {
        // URL'ye göre view belirle
        const viewFromUrl = viewModeFromPath(path);
        if (viewFromUrl) {
          setView(viewFromUrl);

          if (viewFromUrl === ViewMode.PAYMENT_SUCCESS) {
            clearCart();
          } else if (viewFromUrl === ViewMode.PAYMENT_FAIL) {
            const params = new URLSearchParams(window.location.search);
            const errorMsg = params.get('error');
            const errorCode = params.get('code');
            if (errorMsg) setPaymentError(errorMsg);
            if (errorCode) setPaymentCode(errorCode);
          }
        }
      }
    });

    const savedCart = localStorage.getItem('avyna_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Tarayıcı geri/ileri butonları
    const handlePopState = () => {
      const path = window.location.pathname;
      const slug = getSlugFromPath(path);

      if (slug) {
        const found = findProductBySlug(products, slug);
        if (found) {
          setSelectedProduct(found as Product);
          setView(ViewMode.DETAIL);
        } else {
          setView(ViewMode.HOME);
        }
      } else {
        const viewFromUrl = viewModeFromPath(path);
        if (viewFromUrl) {
          setView(viewFromUrl);
          setSelectedProduct(null);
        }
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAddProduct = async (p: Product) => {
    try {
      const result = await ApiService.addProduct(p);
      if (result.success) {
        // Use the returned product data which contains the correct database ID
        const { success, ...savedProduct } = result as any;
        setProducts([savedProduct as Product, ...products]);
      }
    } catch (e) {
      console.error("Error adding product:", e);
      throw e;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bu ürünü tamamen silmek istediğinize emin misiniz?")) return;

    try {
      console.log("Silme isteği başlatıldı:", id);
      await ApiService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      alert("Ürün başarıyla silindi.");
    } catch (e: any) {
      console.error("Error deleting product:", e);
      alert("Ürün silinemedi: " + (e.message || "Bilinmeyen hata"));
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const result = await ApiService.updateProduct(updatedProduct);
      if (result.success) {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      }
    } catch (e) {
      console.error("Error updating product:", e);
      throw e;
    }
  };


  const addToCart = (product: Product, selectedColor?: ProductColor) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        (selectedColor ? item.selectedColor?.name === selectedColor.name : !item.selectedColor)
      );
      let updated;
      if (existing) {
        updated = prev.map(item =>
          (item.product.id === product.id && 
           (selectedColor ? item.selectedColor?.name === selectedColor.name : !item.selectedColor))
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        updated = [...prev, { product, quantity: 1, selectedColor }];
      }
      localStorage.setItem('avyna_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (productId: string, delta: number, colorName?: string) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.product.id === productId && 
            (colorName ? item.selectedColor?.name === colorName : !item.selectedColor)) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem('avyna_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string, colorName?: string) => {
    setCart(prev => {
      const updated = prev.filter(item => 
        !(item.product.id === productId && 
          (colorName ? item.selectedColor?.name === colorName : !item.selectedColor))
      );
      localStorage.setItem('avyna_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('avyna_cart');
  };

  const navigateToDetail = (p: Product) => {
    setSelectedProduct(p);
    setView(ViewMode.DETAIL);
    const productSlug = slugify(p.name);
    window.history.pushState({ view: 'detail', slug: productSlug }, '', `/urun/${productSlug}`);
    window.scrollTo(0, 0);
  };

  const handleNavigate = (v: ViewMode) => {
    setView(v);
    setSelectedProduct(null);
    const newPath = pathFromViewMode(v);
    window.history.pushState({ view: v }, '', newPath);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Navbar
        activeView={view}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favoriteIds.length}
      />

      <main className="flex-grow pb-24">
        {view === ViewMode.HOME && (
          <Home products={products} onSelectProduct={navigateToDetail} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />
        )}

        {view === ViewMode.ADMIN && (
          <Admin
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={handleNavigate}
          />
        )}

        {view === ViewMode.CONSULTANT && (
          <Consultant products={products} />
        )}

        {view === ViewMode.DETAIL && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setView(ViewMode.HOME)}
            onAddToCart={addToCart}
            onNavigate={handleNavigate}
            isFavorite={favoriteIds.includes(selectedProduct.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {view === ViewMode.CART && (
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onNavigate={handleNavigate}
            onBack={() => setView(ViewMode.HOME)}
          />
        )}

        {view === ViewMode.FAVORITES && (
          <Favorites
            products={products}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelectProduct={navigateToDetail}
            onNavigate={handleNavigate}
          />
        )}

        {view === ViewMode.CHECKOUT && (
          <Checkout
            cart={cart}
            onNavigate={handleNavigate}
            onClearCart={clearCart}
          />
        )}

        {view === ViewMode.TRIAL_ROOM && (
          <TrialRoom
            products={products}
            onNavigate={handleNavigate}
          />
        )}

        {view === ViewMode.ORDERS && (
          <Orders onNavigate={handleNavigate} />
        )}

        {view === ViewMode.PAYMENT_SUCCESS && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-6">
            <div className="size-24 bg-green-500/10 flex items-center justify-center rounded-full mb-8">
              <div className="text-green-500 text-4xl mt-[-5px]">✓</div>
            </div>
            <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-4">ÖDEME BAŞARILI</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-center max-w-xs">Siparişiniz başarıyla alındı. Teşekkür ederiz!</p>
            <button
              onClick={() => handleNavigate(ViewMode.HOME)}
              className="bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-2xl"
            >
              ANASAYFAYA DÖN
            </button>
          </div>
        )}

        {view === ViewMode.PAYMENT_FAIL && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-6">
            <div className="size-24 bg-red-500/10 flex items-center justify-center rounded-full mb-8">
              <div className="text-red-500 text-4xl mt-[-5px]">✕</div>
            </div>
            <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-4">ÖDEME BAŞARISIZ</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center max-w-xs">
              {paymentError || "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."}
            </p>
            {paymentCode && (
              <p className="text-red-500 text-[8px] font-black uppercase tracking-[0.2em] mb-12 text-center">
                HATA KODU: {paymentCode}
              </p>
            )}
            {!paymentCode && <div className="mb-12"></div>}
            <button
              onClick={() => handleNavigate(ViewMode.CHECKOUT)}
              className="bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-2xl"
            >
              ÖDEMEYE DÖN
            </button>
          </div>
        )}

        {view === ViewMode.INFO_DELIVERY && (
          <InfoPages type="delivery" onBack={() => setView(ViewMode.HOME)} />
        )}

        {view === ViewMode.INFO_WARRANTY && (
          <InfoPages type="warranty" onBack={() => setView(ViewMode.HOME)} />
        )}

        {view === ViewMode.CONTACT && (
          <InfoPages type="contact" onBack={() => setView(ViewMode.HOME)} />
        )}

        {view === ViewMode.INFO_PRIVACY && (
          <InfoPages type="privacy" onBack={() => setView(ViewMode.HOME)} />
        )}

        {view === ViewMode.INFO_DISTANCE_SALES && (
          <InfoPages type="distance_sales" onBack={() => setView(ViewMode.HOME)} />
        )}
      </main>

      {view !== ViewMode.DETAIL && view !== ViewMode.CHECKOUT && view !== ViewMode.TRIAL_ROOM && <Footer onNavigate={handleNavigate} />}
      <BottomNav 
        activeView={view} 
        onNavigate={handleNavigate} 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
      />
      <WhatsAppButton />
    </div>
  );
};

export default App;
