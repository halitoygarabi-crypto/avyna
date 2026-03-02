
import React from 'react';
import { Product, ViewMode } from '../types';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface FavoritesProps {
  products: Product[];
  favoriteIds: string[];
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: ViewMode) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ products, favoriteIds, onToggleFavorite, onSelectProduct, onNavigate }) => {
  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="size-24 bg-gray-50 dark:bg-surface-dark flex items-center justify-center mb-8">
          <Heart size={48} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-4">Favorileriniz Boş</h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-center max-w-xs">
          Beğendiğiniz ürünleri favorilere ekleyerek kolayca ulaşabilirsiniz.
        </p>
        <button
          onClick={() => onNavigate(ViewMode.HOME)}
          className="bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-2xl"
        >
          KEŞİF YAP
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:px-12">
        <div className="flex items-end justify-between mb-16 border-b border-black/5 dark:border-white/5 pb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter italic">Favorilerim</h1>
            <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
              {favoriteProducts.length} ÜRÜN FAVORİLERDE
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="group relative">
              {/* Remove from favorites */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                className="absolute top-4 right-4 z-10 size-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center border border-black/5 dark:border-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title="Favorilerden Kaldır"
              >
                <Heart size={18} className="fill-orange-600 text-orange-600" />
              </button>

              {/* Product Card */}
              <div
                className="cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <div className="relative aspect-[4/5] w-full p-1 bg-orange-600 shadow-sm transition-all overflow-hidden mb-4">
                  <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden border-2 border-white dark:border-black">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute bottom-3 left-3 bg-orange-600 px-4 py-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <span className="text-[10px] font-black text-white tracking-[0.2em]">DETAY GÖR</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <h4 className="text-black dark:text-white text-base font-black leading-tight uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="text-right">
                      {product.discountPrice ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 line-through font-bold">₺{product.price.toLocaleString()}</span>
                          <p className="text-orange-600 font-black text-sm italic tracking-tighter">₺{product.discountPrice.toLocaleString()}</p>
                        </div>
                      ) : (
                        <p className="text-orange-600 font-black text-sm italic tracking-tighter">₺{product.price.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-1.5">
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.2em]">{product.category}</p>
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1">
                        {product.colors.slice(0, 4).map((color, i) => (
                          <div key={i} className="size-2 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-[7px] text-gray-400 font-bold">+{product.colors.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
