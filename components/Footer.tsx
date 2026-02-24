
import React from 'react';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white dark:bg-black border-t border-black/5 dark:border-white/5 py-24 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
          <div className="text-4xl font-black text-black dark:text-white mb-8 tracking-[0.4em] uppercase">Avyna</div>
          <p className="text-gray-400 text-xs max-w-md font-medium uppercase tracking-widest leading-[2.2]">
            Yaşam alanlarınıza değer katan, teknoloji ve zarafeti birleştiren premium mobilya deneyimi.
            Gemini AI desteği ve 3D görselleştirme ile geleceğin dekorasyon anlayışını bugünden yaşayın.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] uppercase font-black tracking-[0.3em] mb-10 text-orange-600">Servisler</h4>
          <ul className="text-gray-400 text-[10px] space-y-6 font-bold uppercase tracking-[0.2em]">
            <li><button onClick={() => onNavigate(ViewMode.INFO_DELIVERY)} className="hover:text-black dark:hover:text-white transition-colors uppercase">Teslimat & İade</button></li>
            <li><button onClick={() => onNavigate(ViewMode.INFO_WARRANTY)} className="hover:text-black dark:hover:text-white transition-colors uppercase">Garanti Şartları</button></li>
            <li><button onClick={() => onNavigate(ViewMode.INFO_DISTANCE_SALES)} className="hover:text-black dark:hover:text-white transition-colors uppercase text-left">Mesafeli Satış Sözleşmesi</button></li>
            <li><button onClick={() => onNavigate(ViewMode.CONTACT)} className="hover:text-black dark:hover:text-white transition-colors uppercase text-left">İletişim & Showroom</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase font-black tracking-[0.3em] mb-10 text-orange-600">Sosyal</h4>
          <div className="flex space-x-6 text-gray-400">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram className="cursor-pointer hover:text-orange-600" size={20} /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook className="cursor-pointer hover:text-orange-600" size={20} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter className="cursor-pointer hover:text-orange-600" size={20} /></a>
            <a href="mailto:theavynaofficial@gmail.com"><Mail className="cursor-pointer hover:text-orange-600" size={20} /></a>
          </div>
          <div className="mt-12">
            <h5 className="text-[9px] uppercase font-black mb-4 tracking-[0.3em] text-gray-400">Koleksiyona Katıl</h5>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Bültene başarıyla kayıt oldunuz!');
                (e.target as HTMLFormElement).reset();
              }}
              className="flex border-b border-black/10 dark:border-white/10 pb-2"
            >
              <input
                type="email"
                required
                placeholder="E-POSTA ADRESİNİZ"
                className="bg-transparent py-2 text-[9px] outline-none flex-grow uppercase font-black tracking-widest"
              />
              <button type="submit" className="text-[9px] uppercase font-black tracking-widest hover:text-orange-600 transition-colors">Kaydol</button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-[9px] text-gray-400 uppercase tracking-[0.3em] font-black">
        <p>© 2024 Avyna Furniture. Tüm Hakları Saklıdır.</p>
        <div className="flex space-x-8 mt-6 md:mt-0">
          <button onClick={() => onNavigate(ViewMode.INFO_PRIVACY)} className="hover:text-black dark:hover:text-white transition-colors uppercase">Gizlilik & KVKK</button>
          <button onClick={() => onNavigate(ViewMode.INFO_DISTANCE_SALES)} className="hover:text-black dark:hover:text-white transition-colors uppercase">Şartlar</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
