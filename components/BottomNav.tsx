
import React from 'react';
import { Home, LayoutGrid, Heart, User } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  activeView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 pb-safe">
      <div className="flex justify-around items-center h-20">
        <button
          onClick={() => onNavigate(ViewMode.HOME)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeView === ViewMode.HOME ? 'text-orange-600' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
        >
          <Home size={24} strokeWidth={activeView === ViewMode.HOME ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Home</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.TRIAL_ROOM)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeView === ViewMode.TRIAL_ROOM ? 'text-orange-600' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
        >
          <LayoutGrid size={24} strokeWidth={activeView === ViewMode.TRIAL_ROOM ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Deneme</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.HOME)}
          className="flex flex-col items-center justify-center w-full h-full text-gray-400 space-y-1 hover:text-black dark:hover:text-white transition-all"
        >
          <Heart size={24} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Favori</span>
        </button>

        <button
          onClick={() => onNavigate(ViewMode.ADMIN)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeView === ViewMode.ADMIN ? 'text-orange-600' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
        >
          <User size={24} strokeWidth={activeView === ViewMode.ADMIN ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Yönetim</span>
        </button>
      </div>
      <div className="h-4 w-full md:hidden"></div>
    </div>
  );
};

export default BottomNav;
