
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
import { Product, ViewMode, CartItem } from './types';
import { INITIAL_PRODUCTS } from './services/mockData';
import { ApiService } from './services/api';
import WhatsAppButton from './components/WhatsAppButton';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.HOME);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const backendProducts = await ApiService.getProducts();
        setProducts(backendProducts as Product[]);
      } catch (error) {
        console.error("Backend fetch error, falling back to mock:", error);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const savedCart = localStorage.getItem('avyna_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check for payment redirects
    const path = window.location.pathname;
    if (path === '/payment-success') {
      setView(ViewMode.PAYMENT_SUCCESS);
      clearCart();
    } else if (path === '/payment-fail') {
      const params = new URLSearchParams(window.location.search);
      const errorMsg = params.get('error');
      const errorCode = params.get('code');
      if (errorMsg) setPaymentError(errorMsg);
      if (errorCode) setPaymentCode(errorCode);
      setView(ViewMode.PAYMENT_FAIL);
    }
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
    try {
      await ApiService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting product:", e);
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


  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { product, quantity: 1 }];
      }
      localStorage.setItem('avyna_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem('avyna_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
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
    window.scrollTo(0, 0);
  };

  const handleNavigate = (v: ViewMode) => {
    setView(v);
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Navbar
        activeView={view}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />

      <main className="flex-grow pb-24">
        {view === ViewMode.HOME && (
          <Home products={products} onSelectProduct={navigateToDetail} />
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
      </main>

      {view !== ViewMode.DETAIL && view !== ViewMode.CHECKOUT && view !== ViewMode.TRIAL_ROOM && <Footer />}
      <BottomNav activeView={view} onNavigate={handleNavigate} />
      <WhatsAppButton />
    </div>
  );
};

export default App;
