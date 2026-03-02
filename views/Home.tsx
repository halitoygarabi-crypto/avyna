
import React from 'react';
import { Product } from '../types';
import { Plus, Heart } from 'lucide-react';

interface HomeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (productId: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, onSelectProduct, favoriteIds = [], onToggleFavorite }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('HEPSİ');
  const categories = ['HEPSİ', 'OTURMA GRUBU', 'YEMEK ODASI', 'AKSESUAR', 'AYDINLATMA'];

  const filteredProducts = selectedCategory === 'HEPSİ'
    ? products
    : products.filter(p => p.category.toUpperCase() === selectedCategory);

  return (
    <div className="flex flex-col bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="px-4 md:px-4 pt-4 pb-4 md:pb-6">
        <div
          onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative flex flex-col justify-end overflow-hidden min-h-[490px] md:min-h-[610px] group cursor-pointer transition-all duration-1000"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out grayscale group-hover:grayscale-0"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMWqPTE9A4uNGA6XnUUdkg0yNNd0721BKIhk0cdU-th5yPnZoxI4kSPPf4G--FpRBcdi8Hsc9rXPOzqr5GNGoKCsk4Ml6fjQoYb4HiYDl3wLEA0hrDRZMMY6m-MxR3xOc2HGfh83FSgqlND-g7oR_ruG3JF2Pm-HcOdMwYeWikkD9-KFjQDWwWaEhaKhcub8QRRngVuqy8UhnhCk9gf4uxTy_gjzAtKKx055X-mLTcFvXQaRAD7WhvNRvU8SWY9FmQbLNlgnjaNfc")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
          <div className="relative flex flex-col p-6 md:p-8 z-10 pointer-events-none">
            <span className="inline-block border border-white px-3 md:px-4 py-1 mb-3 md:mb-4 text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-white uppercase bg-transparent w-fit">2026 Koleksiyonu</span>
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight mb-2 md:mb-3 uppercase tracking-tighter">Monokrom<br />Ruh</h1>
            <p className="text-gray-400 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase">Renklerin dünyasına dokunun.</p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="sticky top-[65px] z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 pb-2">
        <div className="flex gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 overflow-x-auto no-scrollbar items-center md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex h-9 md:h-10 shrink-0 items-center justify-center px-4 md:px-6 transition-all border-b-2 ${selectedCategory === cat ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              <p className="text-[9px] md:text-[10px] font-black leading-normal tracking-[0.2em] whitespace-nowrap">{cat}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div id="catalog-section" className="px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto w-full perspective-container">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h3 className="text-xl md:text-2xl font-black text-black dark:text-white uppercase tracking-widest">Katalog</h3>
          <span className="text-[9px] md:text-[10px] font-black text-white bg-black dark:bg-white dark:text-black px-3 md:px-4 py-1 tracking-widest uppercase">{products.length} PARÇA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col gap-4 md:gap-6 cursor-pointer relative"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Card with Orange Frame & 3D Lift */}
              <div className="card-3d relative aspect-[4/5] w-full p-1 bg-orange-600 shadow-sm transition-all overflow-visible">
                <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden border-2 md:border-4 border-white dark:border-black">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover grayscale-img"
                  />

                  {/* Overlay elements */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
                    className={`absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 backdrop-blur-sm transition-all z-10 ${favoriteIds.includes(product.id) ? 'bg-orange-600/20 opacity-100' : 'bg-black/10 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`${favoriteIds.includes(product.id) ? 'text-orange-600 fill-orange-600' : 'text-white'}`} size={16} />
                  </button>
                  <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-orange-600 px-3 py-1.5 md:px-4 md:py-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    <span className="text-[9px] md:text-[10px] font-black text-white tracking-[0.2em]">KEŞFİT</span>
                  </div>
                </div>
              </div>

              {/* Text Info - Strictly B&W except price */}
              <div className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex justify-between items-end">
                  <h4 className="text-black dark:text-white text-base md:text-lg font-black leading-tight uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h4>
                  <div className="text-right">
                    {product.discountPrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 line-through font-bold">₺{product.price.toLocaleString()}</span>
                        <p className="text-orange-600 font-black text-sm md:text-base italic tracking-tighter">₺{product.discountPrice.toLocaleString()}</p>
                      </div>
                    ) : (
                      <p className="text-orange-600 font-black text-sm md:text-base italic tracking-tighter">₺{product.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-1.5 md:pt-2">
                  <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">{product.category}</p>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black dark:bg-white"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* About Us Section */}
      <div className="bg-orange-600 py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-white/80 text-[10px] font-black tracking-[0.4em] uppercase mb-6 block">Hakkımızda</span>
          <h2 className="text-white text-3xl md:text-5xl font-black mb-10 tracking-tighter uppercase leading-tight">
            Doğayla Uyumlu,<br />Modern ve Şık Tasarımlar
          </h2>
          <div className="space-y-6 text-white/90 text-sm md:text-base font-medium leading-relaxed">
            <p>
              Avyna®, İzmir’de bahçe ve dış mekân mobilyaları sektöründe; doğayla uyumlu tasarımları,
              çağdaş bakış açısı ve yüksek kalite anlayışıyla hizmet vermenin gururunu yaşamaktadır.
            </p>
            <p>
              Her yıl Türkiye’nin ve dünyanın dört bir yanına ulaşan güçlü üretim ve lojistik altyapımız sayesinde;
              dayanıklılığı, estetiği ve konforu bir arada sunan güvenilir bir marka olarak istikrarlı büyümemizi sürdürüyoruz.
            </p>
            <p className="hidden md:block">
              Fonksiyonelliği modern tasarımla buluşturan geniş ürün yelpazemizle; bahçelerden teraslara,
              otellerden sosyal yaşam alanlarına kadar her mekâna değer katan çözümler üretiyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Home;
