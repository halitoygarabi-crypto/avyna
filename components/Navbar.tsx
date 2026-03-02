
import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, X, Home, LayoutGrid, Heart, User, ChevronRight } from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewMode) => void;
  activeView: ViewMode;
  cartCount: number;
  favoritesCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView, cartCount, favoritesCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Anasayfa', view: ViewMode.HOME, icon: <Home size={18} /> },
    { label: 'Yapay Zeka Deneme', view: ViewMode.TRIAL_ROOM, icon: <LayoutGrid size={18} /> },
    { label: 'Favorilerim', view: ViewMode.FAVORITES, icon: <Heart size={18} />, count: favoritesCount },
    { label: 'Yönetim Paneli', view: ViewMode.ADMIN, icon: <User size={18} /> },
    { label: 'Sepetim', view: ViewMode.CART, icon: <ShoppingBag size={18} />, count: cartCount },
  ];

  const handleNavigate = (view: ViewMode) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 border-b border-black/5 dark:border-white/5">
        <div
          onClick={() => setIsMenuOpen(true)}
          className="flex size-9 md:size-10 shrink-0 items-center justify-center text-black dark:text-white hover:text-orange-600 transition-all cursor-pointer"
        >
          <Menu size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
        </div>

        <h2
          className="text-black dark:text-white text-xl md:text-3xl font-black uppercase tracking-[0.3em] md:tracking-[0.4em] flex-1 text-center cursor-pointer hover:text-orange-600 transition-colors ml-8 md:ml-10"
          onClick={() => handleNavigate(ViewMode.HOME)}
        >
          Avyna
        </h2>

        <div className="flex items-center justify-end gap-1 md:gap-3">
          <button
            onClick={() => handleNavigate(ViewMode.TRIAL_ROOM)}
            className={`hidden sm:flex size-9 md:size-10 shrink-0 items-center justify-center transition-all cursor-pointer ${activeView === ViewMode.TRIAL_ROOM ? 'text-orange-600' : 'text-black dark:text-white hover:text-orange-600'}`}
            title="YZ Deneme"
          >
            <LayoutGrid size={18} className="md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => handleNavigate(ViewMode.FAVORITES)}
            className={`hidden sm:flex size-9 md:size-10 shrink-0 items-center justify-center transition-all cursor-pointer relative ${activeView === ViewMode.FAVORITES ? 'text-orange-600' : 'text-black dark:text-white hover:text-orange-600'}`}
            title="Favorilerim"
          >
            <Heart size={18} className={`md:w-[20px] md:h-[20px] ${activeView === ViewMode.FAVORITES ? 'fill-orange-600' : ''}`} strokeWidth={2.5} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-orange-600 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => alert('Arama özelliği yakında aktif edilecektir.')}
            className="flex size-9 md:size-10 shrink-0 items-center justify-center text-black dark:text-white hover:text-orange-600 transition-all cursor-pointer"
          >
            <Search size={18} className="md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => handleNavigate(ViewMode.CART)}
            className={`flex size-9 md:size-10 shrink-0 items-center justify-center relative transition-all cursor-pointer ${activeView === ViewMode.CART ? 'text-orange-600' : 'text-black dark:text-white hover:text-orange-600'}`}
          >
            <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-orange-600 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Hamburger Menu Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[300px] md:w-[400px] bg-white dark:bg-black z-[101] shadow-2xl transition-transform duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-black/5 dark:border-white/5">
            <h3 className="text-xl font-black uppercase tracking-widest italic">Avyna</h3>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow py-8">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(item.view)}
                className={`group w-full flex items-center justify-between px-8 py-5 transition-all hover:bg-black dark:hover:bg-white ${activeView === item.view ? 'bg-orange-600/5' : ''}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`text-gray-400 group-hover:text-orange-600 transition-colors ${activeView === item.view ? 'text-orange-600' : ''}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-[0.3em] group-hover:text-white dark:group-hover:text-black transition-colors ${activeView === item.view ? 'text-orange-600' : 'text-black dark:text-white'}`}>
                    {item.label}
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </div>
                <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>
            ))}
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-8 border-t border-black/5 dark:border-white/5">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 text-center">Luxury Furniture Design</p>
            <div className="flex justify-center gap-4 text-[10px] font-bold text-black dark:text-gray-500">
               <span>TR</span>
               <span className="opacity-20">|</span>
               <span className="opacity-50 hover:opacity-100 cursor-pointer">EN</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
