
import React from 'react';
import { Product, ProductColor } from '../types';
import { ChevronLeft, ShoppingBag, Share2, Ruler, Star, ShieldCheck, Truck, Link2, Check } from 'lucide-react';
import { slugify } from '../utils/slug';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  const [added, setAdded] = React.useState(false);
  const [activeImage, setActiveImage] = React.useState(product.images?.[0] || '');
  const [selectedColor, setSelectedColor] = React.useState<ProductColor | null>(null);
  const [linkCopied, setLinkCopied] = React.useState(false);

  // URL'den renk parametresini oku (ilk yükleme)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const renkParam = params.get('renk');
    if (renkParam && product.colors) {
      const foundColor = product.colors.find(
        c => slugify(c.name) === renkParam || c.name.toLowerCase() === renkParam.toLowerCase()
      );
      if (foundColor) {
        setSelectedColor(foundColor);
        if (foundColor.images && foundColor.images.length > 0) {
          setActiveImage(foundColor.images[0]);
        }
      }
    }
  }, [product]);

  // Ürün URL'sini oluştur
  const getProductUrl = (color?: ProductColor | null): string => {
    const base = `${window.location.origin}/urun/${slugify(product.name)}`;
    if (color) {
      return `${base}?renk=${slugify(color.name)}`;
    }
    return base;
  };

  // Renk seçildiğinde URL'yi güncelle
  const updateUrlForColor = (color: ProductColor | null) => {
    const url = getProductUrl(color);
    window.history.replaceState(
      { view: 'detail', slug: slugify(product.name), color: color?.name },
      '',
      url
    );
  };

  const handleShare = async () => {
    const shareUrl = getProductUrl(selectedColor);
    const shareTitle = selectedColor 
      ? `${product.name} - ${selectedColor.name}` 
      : product.name;
    const shareText = `${shareTitle} - ${product.price.toLocaleString('tr-TR')} ₺`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // Kullanıcı paylaşımı iptal etti — ses çıkarma
      }
    } else {
      // Paylaşım API yok → Linki kopyala
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      } catch {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-32">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <button
          onClick={onBack}
          className="size-10 md:size-12 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all"
        >
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400">Ürün Tanımı / {product.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`size-10 md:size-12 flex items-center justify-center border transition-all ${
              linkCopied 
                ? 'border-green-500 bg-green-500 text-white' 
                : 'border-black/5 dark:border-white/5 hover:border-orange-600'
            }`}
            title={linkCopied ? 'Link kopyalandı!' : 'Paylaş'}
          >
            {linkCopied ? <Check size={18} className="md:w-5 md:h-5" /> : <Share2 size={18} className="md:w-5 md:h-5" />}
          </button>
        </div>
      </div>
      {/* URL Bar - Shareable Link */}
      <div className="bg-gray-50 dark:bg-surface-dark border-b border-black/5 dark:border-white/5 px-4 md:px-6 py-2 flex items-center gap-3">
        <Link2 size={14} className="text-gray-400 flex-shrink-0" />
        <span className="text-[8px] md:text-[9px] font-mono text-gray-500 truncate flex-1">
          {getProductUrl(selectedColor)}
        </span>
        <button
          onClick={handleShare}
          className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 transition-all flex-shrink-0 ${
            linkCopied 
              ? 'text-green-600 bg-green-50' 
              : 'text-orange-600 hover:bg-orange-50'
          }`}
        >
          {linkCopied ? '✓ Kopyalandı' : 'Kopyala'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">

          {/* Image Gallery Section */}
          <div className="flex flex-col gap-6 md:gap-8">
            {/* Main Image/Video Display */}
            <div className="relative bg-gray-50 dark:bg-surface-dark border border-black/5 dark:border-white/5 overflow-hidden aspect-square">
              {activeImage === 'VIDEO' && product.videoUrl ? (
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Product Thumbnails */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 border-t border-black/5 pt-6 md:pt-8">
              {(() => {
                const displayImages = selectedColor?.images && selectedColor.images.length > 0
                  ? selectedColor.images
                  : product.images || [];
                return displayImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square bg-gray-50 dark:bg-surface-dark border transition-colors p-1 cursor-pointer ${activeImage === img ? 'border-orange-600' : 'border-black/5 dark:border-white/5'}`}
                  >
                    <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt={`${product.name} ${i + 1}`} />
                  </div>
                ));
              })()}
              {product.videoUrl && (
                <div
                  onClick={() => setActiveImage('VIDEO')}
                  className={`aspect-square bg-gray-50 dark:bg-surface-dark border transition-colors p-1 cursor-pointer relative ${activeImage === 'VIDEO' ? 'border-orange-600' : 'border-black/5 dark:border-white/5'}`}
                >
                  <div className="w-full h-full flex items-center justify-center bg-black/5">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 text-center text-[7px] md:text-[8px] font-black uppercase bg-orange-600 text-white py-0.5">Video</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Description Section */}
          <div className="flex flex-col pt-4">
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="space-y-2">
                  <p className="text-orange-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">{product.category}</p>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className="md:w-4 md:h-4 fill-orange-600 text-orange-600" />
                      ))}
                    </div>
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">(5.0/5 - 128 Analiz)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-black text-orange-600 italic">₺{product.price.toLocaleString()}</p>
                  <span className="text-[9px] md:text-[10px] text-green-600 font-black uppercase tracking-widest">● Stokta Mevcut</span>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6 md:mb-8 font-light">
                {product.description}
              </p>

              {/* Technical Specifications */}
              <div className="bg-gray-50 dark:bg-surface-dark p-4 md:p-6 mb-6 md:mb-8 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler size={16} className="md:w-5 md:h-5 text-orange-600" />
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest">Teknik Spesifikasyonlar</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Genişlik</p>
                    <p className="text-lg md:text-2xl font-black">{product.dimensions?.width || 200} CM</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Yükseklik</p>
                    <p className="text-lg md:text-2xl font-black">{product.dimensions?.height || 90} CM</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Derinlik</p>
                    <p className="text-lg md:text-2xl font-black">{product.dimensions?.depth || 100} CM</p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6 md:mb-8 border-t border-black/5 pt-6 md:pt-8">
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-4">Öne Çıkan Özellikler</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-1.5 size-1 md:size-1.5 bg-orange-600 shrink-0"></div>
                        <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Options Display */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6 md:mb-8 border-t border-black/5 pt-6 md:pt-8">
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-4">Mevcut Renk Seçenekleri</h3>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className={`flex flex-col items-center gap-2 group cursor-pointer transition-all ${
                          selectedColor?.name === color.name ? 'scale-110' : ''
                        }`}
                        onClick={() => {
                          if (selectedColor?.name === color.name) {
                            setSelectedColor(null);
                            setActiveImage(product.images?.[0] || '');
                            updateUrlForColor(null);
                          } else {
                            setSelectedColor(color);
                            if (color.images && color.images.length > 0) {
                              setActiveImage(color.images[0]);
                            }
                            updateUrlForColor(color);
                          }
                        }}
                      >
                        <div 
                          className={`size-8 md:size-10 rounded-full border-2 shadow-sm p-0.5 transition-all group-hover:scale-110 ${
                            selectedColor?.name === color.name 
                              ? 'border-orange-600 ring-2 ring-orange-600/30' 
                              : 'border-black/5'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-colors ${
                          selectedColor?.name === color.name ? 'text-orange-600' : 'text-gray-400 group-hover:text-black'
                        }`}>{color.name}</span>
                        {color.images && color.images.length > 0 && (
                          <span className="text-[6px] uppercase tracking-widest text-orange-600 font-bold">
                            {color.images.length} Görsel
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedColor && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-orange-600">
                        {selectedColor.name} seçili
                      </span>
                      <button
                        onClick={() => {
                          setSelectedColor(null);
                          setActiveImage(product.images?.[0] || '');
                          updateUrlForColor(null);
                        }}
                        className="ml-auto text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
                      >
                        Temizle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Fabric Properties Display */}
              {product.fabricProperties && (
                <div className="mb-6 md:mb-8 border-t border-black/5 pt-6 md:pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M3 6c3-1 7-1 9 0s6 1 9 0"/><path d="M3 12c3-1 7-1 9 0s6 1 9 0"/><path d="M3 18c3-1 7-1 9 0s6 1 9 0"/><path d="M3 6v12"/><path d="M21 6v12"/></svg>
                    <h3 className="text-[11px] md:text-xs font-black uppercase tracking-widest">Materyal & Bakım Detayları</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 dark:bg-surface-dark p-4 md:p-6 border border-black/5 dark:border-white/5">
                    {product.fabricProperties.type && (
                      <div>
                        <p className="text-[7px] md:text-[8px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-1">Kumaş Türü</p>
                        <p className="text-[10px] md:text-xs font-black uppercase">{product.fabricProperties.type}</p>
                      </div>
                    )}
                    {product.fabricProperties.composition && (
                      <div>
                        <p className="text-[7px] md:text-[8px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-1">Kompozisyon</p>
                        <p className="text-[10px] md:text-xs font-black uppercase">{product.fabricProperties.composition}</p>
                      </div>
                    )}
                    {product.fabricProperties.warrantyPeriod && (
                      <div>
                        <p className="text-[7px] md:text-[8px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-1">Garanti</p>
                        <p className="text-[10px] md:text-xs font-black uppercase text-orange-600">{product.fabricProperties.warrantyPeriod}</p>
                      </div>
                    )}
                    {product.fabricProperties.cleaningInstructions && (
                      <div>
                        <p className="text-[7px] md:text-[8px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-1">Bakım</p>
                        <p className="text-[10px] md:text-xs font-black uppercase">{product.fabricProperties.cleaningInstructions}</p>
                      </div>
                    )}
                    {product.fabricProperties.origin && (
                      <div className="col-span-2">
                        <p className="text-[7px] md:text-[8px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-1">Menşei</p>
                        <p className="text-[10px] md:text-xs font-black uppercase text-orange-600">{product.fabricProperties.origin}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 md:py-5 text-sm md:text-base font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 mb-4 md:mb-6 ${added
                  ? 'bg-green-600 text-white'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white'
                  }`}
              >
                <ShoppingBag size={18} className="md:w-5 md:h-5" />
                {added ? 'Sepete Eklendi!' : 'Sepete Ekle'}
              </button>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-surface-dark border border-black/5 dark:border-white/5">
                  <div className="size-8 md:size-10 bg-orange-600/10 flex items-center justify-center">
                    <ShieldCheck size={16} className="md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Ücretsiz Lojistik</p>
                    <p className="text-[7px] md:text-[8px] text-gray-400 uppercase tracking-widest">7 Gün Kargo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-50 dark:bg-surface-dark border border-black/5 dark:border-white/5">
                  <div className="size-8 md:size-10 bg-orange-600/10 flex items-center justify-center">
                    <Truck size={16} className="md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Garantili Teslimat</p>
                    <p className="text-[7px] md:text-[8px] text-gray-400 uppercase tracking-widest">14 Gün İade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
