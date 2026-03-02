
import React from 'react';
import { Product, CartItem, ViewMode } from '../types';
import { Trash2, Plus, Minus, ArrowRight, ChevronLeft, ShoppingBag } from 'lucide-react';

interface CartProps {
    cart: CartItem[];
    onUpdateQuantity: (productId: string, delta: number, colorName?: string) => void;
    onRemoveItem: (productId: string, colorName?: string) => void;
    onNavigate: (view: ViewMode) => void;
    onBack: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemoveItem, onNavigate, onBack }) => {
    const subtotal = cart.reduce((sum, item) => {
        const actualPrice = item.product.discountPrice || item.product.price;
        return sum + actualPrice * item.quantity;
    }, 0);
    const total = subtotal; // No shipping fee

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
                <div className="size-24 bg-gray-50 dark:bg-surface-dark flex items-center justify-center mb-8">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter italic mb-4">Sepetiniz Boş</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Henüz koleksiyonunuza bir parça eklemediniz.</p>
                <button
                    onClick={onBack}
                    className="bg-black dark:bg-white text-white dark:text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-2xl"
                >
                    ALIŞVERİŞE BAŞLA
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-black min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:px-12">
                <div className="flex items-end justify-between mb-16 border-b border-black/5 dark:border-white/5 pb-8">
                    <div>
                        <h1 className="text-6xl font-black text-black dark:text-white uppercase tracking-tighter italic">Sepetim</h1>
                        <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mt-4">{cart.length} PARÇA SEÇİLDİ</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={16} /> ALIŞVERİŞE DEVAM ET
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        {cart.map((item) => (
                            <div key={`${item.product.id}-${item.selectedColor?.name || 'default'}`} className="flex gap-8 group">
                                <div className="w-40 aspect-[4/5] bg-gray-50 dark:bg-surface-dark relative overflow-hidden p-1 border border-black/5 dark:border-white/5">
                                    <img
                                        src={item.selectedColor?.images?.[0] || item.product.images?.[0] || ''}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>

                                <div className="flex-grow flex flex-col justify-between py-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-orange-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">{item.product.category}</p>
                                            <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight italic">{item.product.name}</h3>
                                            {item.selectedColor && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="size-3 rounded-full border border-black/10" style={{ backgroundColor: item.selectedColor.hex }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.selectedColor.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onRemoveItem(item.product.id, item.selectedColor?.name)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center bg-gray-50 dark:bg-surface-dark border border-black/5 dark:border-white/5">
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, -1, item.selectedColor?.name)}
                                                className="p-3 hover:text-orange-600 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-12 text-center text-xs font-black">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.product.id, 1, item.selectedColor?.name)}
                                                className="p-3 hover:text-orange-600 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            {item.product.discountPrice ? (
                                                <div className="mb-1">
                                                    <span className="text-[9px] text-gray-400 line-through mr-2">₺{item.product.price.toLocaleString()}</span>
                                                    <span className="text-[10px] text-orange-600 font-black">₺{item.product.discountPrice.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">₺{item.product.price.toLocaleString()}</p>
                                            )}
                                            <p className="text-xl font-black text-black dark:text-white italic">₺{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-32 p-10 bg-gray-50 dark:bg-surface-dark border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-black dark:text-white border-b border-black/5 dark:border-white/5 pb-6">Sipariş Özeti</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    <span>Ara Toplam</span>
                                    <span className="text-black dark:text-white">₺{subtotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-between items-end">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Toplam</span>
                                <span className="text-3xl font-black text-orange-600 italic">₺{total.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={() => onNavigate(ViewMode.CHECKOUT)}
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all flex items-center justify-center gap-4 group"
                            >
                                ÖDEMEYE GEÇ <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </button>

                            <div className="pt-4 text-center">
                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">GÜVENLİ ÖDEME ALTYAPISI & 256-BIT SSL</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
