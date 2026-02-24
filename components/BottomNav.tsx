
import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingBag } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  activeView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  cartCount: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, cartCount }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 pb-safe sm:hidden">
      <div className="flex justify-around items-center h-20">
        <button
          onClick={() => onNavigate(ViewMode.HOME)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeView === ViewMode.HOME ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <Home size={22} strokeWidth={activeView === ViewMode.HOME ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Home</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.TRIAL_ROOM)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeView === ViewMode.TRIAL_ROOM ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <LayoutGrid size={22} strokeWidth={activeView === ViewMode.TRIAL_ROOM ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Deneme</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.HOME)}
          className="flex flex-col items-center justify-center w-full h-full text-gray-400 space-y-1"
        >
          <Heart size={22} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Favori</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.CART)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all relative ${activeView === ViewMode.CART ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <div className="relative">
            <ShoppingBag size={22} strokeWidth={activeView === ViewMode.CART ? 3 : 2} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-black">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sepetim</span>
        </button>
      </div>
      <div className="h-4 w-full md:hidden"></div>
    </div>
  );
};

export default BottomNav;
