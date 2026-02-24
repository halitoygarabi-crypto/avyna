
import React from 'react';
import { Truck, RotateCcw, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface InfoPagesProps {
    type: 'delivery' | 'warranty' | 'contact' | 'privacy' | 'distance_sales';
    onBack: () => void;
}

const InfoPages: React.FC<InfoPagesProps> = ({ type, onBack }) => {
    const renderDelivery = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">TESLİMAT & İADE POLİTİKASI</h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">Avyna Lojistik ve Satış Sonrası Hizmetler</p>
            </header>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-loose">
                <section>
                    <h3 className="text-orange-600 text-sm mb-4">Teslimat Şartları</h3>
                    <p>• Teslimatlar belirtilen süre içerisinde anlaşmalı lojistik firmaları aracılığıyla yapılır.</p>
                    <p>• Teslim süresi ürün sayfasında belirtilen süre kadardır. Özel üretim ürünlerde üretim süresi ayrıca belirtilir.</p>
                    <p>• Teslim sırasında ürün mutlaka kontrol edilmeli, hasar varsa tutanak tutulmalıdır.</p>
                    <p>• Hasarlı teslimlerde tutanak tutulması durumunda ücretsiz değişim süreci anında başlatılır.</p>
                </section>

                <section>
                    <h3 className="text-orange-600 text-sm mb-4">İade Koşulları</h3>
                    <p>• İade talepleri yazılı olarak (theavynaofficial@gmail.com) yapılmalıdır.</p>
                    <p>• Ürün kullanılmamış olmalıdır ve orijinal ambalajı zarar görmemelidir.</p>
                    <p>• Özel üretim ürünlerde (renk/kumaş/ölçü değişikliği) iade sınırlamaları geçerlidir.</p>
                    <p>• Ayıplı ürünlerde kargo bedeli AVYNA tarafından karşılanır.</p>
                </section>
            </div>
        </div>
    );

    const renderWarranty = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">GARANTİ ŞARTLARI</h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">AVYNA Ürün Güvencesi</p>
            </header>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-loose">
                <p>• AVYNA ürünleri 2 yıl üretici garantisi kapsamındadır.</p>
                <p>• Garanti süresi fatura tarihi ile başlar.</p>
                <p>• Her bir Avyna parçası, malzeme ve üretim hatalarına karşı koruma altındadır.</p>
                <p>• Kullanım hataları (yanlış temizlik, aşırı güneş maruziyeti vb.) garanti kapsamı dışındadır.</p>
                <p>• Teknik servis talepleriniz için faturanızla birlikte bize ulaşabilirsiniz.</p>
            </div>
        </div>
    );

    const renderPrivacy = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">GİZLİLİK & KVKK</h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">Veri Güvenliği ve Aydınlatma Metni</p>
            </header>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-12 text-gray-400 font-bold uppercase tracking-widest text-[9px] leading-relaxed">
                <section>
                    <h2 className="text-orange-600 text-sm mb-6 underline">GİZLİLİK POLİTİKASI</h2>
                    <p>AVYNA olarak müşterilerimizin kişisel verilerinin güvenliği önceliğimizdir.</p>
                    <div className="mt-4 space-y-2">
                        <p>TOPLANAN VERİLER: Ad – Soyad, Telefon, E-posta, Teslimat Adresi, Fatura Bilgileri.</p>
                        <p>AMAÇ: Sipariş oluşturma, teslimat, faturalandırma ve yasal yükümlülükler.</p>
                        <p>PAYLAŞIM: Kişisel veriler, açık rıza olmaksızın üçüncü kişilerle paylaşılmaz; yalnızca hizmet sağlayıcılar ve yasal zorunluluklar kapsamında aktarılır.</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-6 underline">KVKK AYDINLATMA METNİ</h2>
                    <p>Veri Sorumlusu: AVYNA [ŞİRKET UNVANI]</p>
                    <p>Kişisel verileriniz; sözleşmenin kurulması, ifası ve müşteri memnuniyeti süreçleri amacıyla işlenmektedir.</p>
                    <p className="mt-4">KVKK 11. MADDE KAPSAMINDA HAKLARINIZ: Veri işlenip işlenmediğini öğrenme, düzeltme talep etme, silinmesini isteme, aktarıldığı kişileri öğrenme ve itiraz etme haklarına sahipsiniz.</p>
                    <p className="mt-2 text-white italic">Başvurular: theavynaofficial@gmail.com</p>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-6 underline">ÇEREZ (COOKIE) POLİTİKASI</h2>
                    <p>AVYNA web sitesinde kullanıcı deneyimini geliştirmek amacıyla zorunlu, performans ve pazarlama çerezleri kullanılmaktadır. Tercihlerinizi site girişinde düzenleyebilirsiniz.</p>
                </section>
            </div>
        </div>
    );

    const renderDistanceSales = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">Yasal Hak ve Yükümlülükler</p>
            </header>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-10 text-gray-400 font-bold uppercase tracking-widest text-[9px] leading-loose h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-orange-600">
                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">MADDE 1 – TARAFLAR</h2>
                    <p>SATICI: AVYNA | alperen@avynamobilya.com - theavynaofficial@gmail.com</p>
                    <p>ALICI: www.avyna.com.tr üzerinden sipariş oluşturan kişi.</p>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">MADDE 2 – KONU</h2>
                    <p>İşbu sözleşme, elektronik ortamda verilen mobilya ürününün satışı ve teslimine ilişkin hak ve yükümlülükleri düzenler.</p>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">MADDE 3 – ÜRÜN BİLGİLERİ</h2>
                    <p>Model, ölçü, kumaş, fiyat ve teslim süresi ürün sayfasında belirtildiği gibidir. ALICI bunları kabul ettiğini beyan eder.</p>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">MADDE 5 – CAYMA HAKKI İSTİSNALARI</h2>
                    <p>Ölçüye göre üretilen, renk/kumaş tercihi ile kişiye özel hazırlanan veya montajı yapılmış ürünlerde cayma hakkı KULLANILAMAZ.</p>
                </section>
                
                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">ÖN BİLGİLENDİRME FORMU</h2>
                    <p>Siparişin tamamlanması; temel özellikler, satış bedeli, teslimat ve cayma koşullarının kabulü anlamına gelir.</p>
                </section>

                <section>
                    <h2 className="text-orange-600 text-sm mb-4 italic font-black underline">ŞARTLAR VE KOŞULLAR</h2>
                    <p>Web sitesini kullanan herkes bu şartları kabul etmiş sayılır. AVYNA içerikleri güncelleme hakkını saklı tutar.</p>
                </section>
            </div>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-16">
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">İLETİŞİM</h1>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em]">Sizi Avyna Dünyasına Bekliyoruz</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-surface-dark p-10 border border-black/5 dark:border-white/5 shadow-lg text-center group hover:border-orange-600 transition-all">
                    <MapPin className="mx-auto mb-6 text-orange-600 group-hover:scale-110 transition-transform" size={32} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">Adres</h4>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                        Uzundere, 3962/30. Sk. No: 62,<br />
                        35370 Karabağlar / İzmir
                    </p>
                </div>
                
                <div className="bg-white dark:bg-surface-dark p-10 border border-black/5 dark:border-white/5 shadow-lg text-center group hover:border-orange-600 transition-all">
                    <Phone className="mx-auto mb-6 text-orange-600 group-hover:scale-110 transition-transform" size={32} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">Telefon</h4>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                        0 (541) 885 40 60
                    </p>
                </div>

                <div className="bg-white dark:bg-surface-dark p-10 border border-black/5 dark:border-white/5 shadow-lg text-center group hover:border-orange-600 transition-all">
                    <Mail className="mx-auto mb-6 text-orange-600 group-hover:scale-110 transition-transform" size={32} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">E-posta</h4>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                        alperen@avynamobilya.com<br />
                        theavynaofficial@gmail.com
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <div className="bg-black text-white p-12">
                   <Clock className="mb-6 text-orange-600" size={24} />
                   <h4 className="text-[11px] font-black uppercase tracking-widest mb-6">Showroom Çalışma Saatleri</h4>
                   <div className="space-y-4 text-xs font-light text-gray-400">
                       <div className="flex justify-between border-b border-white/10 pb-2 italic">
                           <span>Pazartesi - Cumartesi</span>
                           <span>09:00 - 20:00</span>
                       </div>
                       <div className="flex justify-between border-b border-white/10 pb-2 italic">
                           <span>Pazar</span>
                           <span>11:00 - 18:30</span>
                       </div>
                   </div>
                </div>

                <div className="bg-orange-600 p-12 flex flex-col justify-center">
                   <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 text-white">Acil Destek Hattı</h4>
                   <p className="text-white text-2xl font-black italic mb-6">WhatsApp: 0 (541) 885 40 60</p>
                   <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">7/24 Stil Danışmanlığı ve Satış Sonrası Destek</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-20 min-h-[70vh]">
            <button 
                onClick={onBack}
                className="mb-12 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 hover:text-orange-600 transition-colors"
            >
                ← Geri Dön
            </button>
            
            {type === 'delivery' && renderDelivery()}
            {type === 'warranty' && renderWarranty()}
            {type === 'contact' && renderContact()}
            {type === 'privacy' && renderPrivacy()}
            {type === 'distance_sales' && renderDistanceSales()}
        </div>
    );
};

export default InfoPages;
