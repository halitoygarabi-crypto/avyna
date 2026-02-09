import React, { useState } from 'react';
import { CartItem, ViewMode } from '../types';
import { CreditCard, Truck, ShieldCheck, ChevronLeft, Lock } from 'lucide-react';
import { ApiService } from '../services/api';

interface CheckoutProps {
    cart: CartItem[];
    onNavigate: (view: ViewMode) => void;
    onClearCart: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, onNavigate, onClearCart }) => {
    const [isProcessing, setIsProcessing] = useState(false);


    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [street, setStreet] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 50000 ? 0 : 250;
    const total = subtotal + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const fullAddress = `${neighborhood} MAH. ${street} SOK. ${district}/${city}`;

            // 1. Generate a bank-friendly Order ID (No hyphens, max 20 chars)
            const cleanOrderId = `AVN${Date.now()}`;

            // 2. Create the order in Supabase/Local Database first
            const orderData = await ApiService.createOrder({
                id: cleanOrderId, // Force use of clean ID
                customerName: `${firstName} ${lastName}`,
                customerEmail: email,
                customerPhone: phone,
                address: fullAddress,
                total: total
            }, cart);

            const merchant_oid = cleanOrderId;

            // 2. Initiate QNB Payment
            const qnbResponse = await ApiService.initiateQNBPayment({
                email: email,
                payment_amount: total.toFixed(2), // Ensure 2 decimal places for QNB
                merchant_oid: merchant_oid,
                user_name: `${firstName} ${lastName}`,
                user_address: fullAddress,
                user_phone: phone,
                pan: cardNumber.replace(/\s/g, ''),
                expiry: cardExpiry,
                cv2: cardCVC,
                card_holder: cardHolderName
            });

            if (qnbResponse.status === 'success') {
                // 3. Create a hidden form and submit it to QNB VPOS Gateway
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = qnbResponse.paymentUrl;

                Object.keys(qnbResponse.params).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = qnbResponse.params[key];
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error(qnbResponse.message || 'Ödeme başlatılamadı');
            }

        } catch (error: any) {
            console.error("Order error:", error);
            alert("Hata: " + error.message);
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-6">
                <div className="size-24 scale-in bg-green-500/10 flex items-center justify-center rounded-full mb-8">
                    <ShieldCheck size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-4">SİPARİŞİNİZ ALINDI</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-center max-w-xs">Tasarım harikası mobilyalarınız en kısa sürede lojistik ekibimizle yola çıkacak.</p>
                <button
                    onClick={() => onNavigate(ViewMode.HOME)}
                    className="bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-2xl"
                >
                    ANASAYFAYA DÖN
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-black min-h-screen pb-32">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:px-12">
                <button
                    onClick={() => onNavigate(ViewMode.CART)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-12"
                >
                    <ChevronLeft size={16} /> SEPETE DÖN
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className="space-y-16">
                        <section>
                            <h1 className="text-5xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-12">Ödeme</h1>

                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="space-y-8">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-orange-600">
                                        <Truck size={18} /> TESLİMAT BİLGİLERİ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="İSİM"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="SOYİSİM"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="email"
                                                placeholder="E-POSTA"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="TELEFON"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2 grid grid-cols-2 gap-6">
                                            <input
                                                required
                                                type="text"
                                                placeholder="ŞEHİR"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="İLÇE"
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="MAHALLE"
                                                value={neighborhood}
                                                onChange={(e) => setNeighborhood(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="SOKAK / NO"
                                                value={street}
                                                onChange={(e) => setStreet(e.target.value)}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-orange-600">
                                        <CreditCard size={18} /> KART BİLGİLERİ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="KART ÜZERİNDEKİ AD SOYAD"
                                                value={cardHolderName}
                                                onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors uppercase"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                required
                                                type="text"
                                                placeholder="KART NUMARASI"
                                                value={cardNumber}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                    if (val.length <= 19) setCardNumber(val);
                                                }}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="AA/YY"
                                                value={cardExpiry}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    if (val.length <= 5) setCardExpiry(val);
                                                }}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="CVC"
                                                value={cardCVC}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 3) setCardCVC(val);
                                                }}
                                                className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xs font-black tracking-widest outline-none focus:border-orange-600 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isProcessing}
                                    type="submit"
                                    className="w-full bg-black dark:bg-white text-white dark:text-black py-8 text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all flex items-center justify-center gap-4 relative overflow-hidden"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="size-3 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
                                            İŞLENİYOR...
                                        </span>
                                    ) : (
                                        <>ÖDEMEYİ TAMAMLA - ₺{total.toLocaleString()}</>
                                    )}
                                </button>

                                <div className="flex items-center justify-center gap-3 text-gray-400">
                                    <Lock size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Tüm işlemleriniz 3D Secure ile korunmaktadır</span>
                                </div>
                            </form>
                        </section>
                    </div>

                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32 space-y-12">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-black dark:text-white">Siparişiniz</h3>
                            <div className="space-y-8 max-h-[500px] overflow-y-auto no-scrollbar pr-4">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="flex gap-6">
                                        <div className="size-20 bg-gray-50 dark:bg-surface-dark p-1 border border-black/5 dark:border-white/5 shrink-0">
                                            <img src={item.product.images?.[0] || ''} className="w-full h-full object-cover grayscale" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">{item.product.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ADET: {item.quantity}</p>
                                            <p className="text-xs font-black text-orange-600 mt-2">₺{(item.product.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-black/5 dark:border-white/5 space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-400">ARA TOPLAM</span>
                                    <span className="text-black dark:text-white font-black">₺{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-gray-400">LOJİSTİK</span>
                                    <span className="text-black dark:text-white font-black">{shipping === 0 ? 'ÜCRETSİZ' : `₺${shipping} `}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black italic pt-4">
                                    <span className="text-black dark:text-white">TOPLAM</span>
                                    <span className="text-orange-600">₺{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
