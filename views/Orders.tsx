
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ApiService } from '../services/api';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface OrdersProps {
    onNavigate: (view: any) => void;
}

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await ApiService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            await ApiService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus as any } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Sipariş durumu güncellenirken bir hata oluştu.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-600" size={20} />;
            case 'confirmed':
                return <Package className="text-blue-600" size={20} />;
            case 'shipped':
                return <Truck className="text-purple-600" size={20} />;
            case 'delivered':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <Clock className="text-gray-600" size={20} />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Beklemede';
            case 'confirmed':
                return 'Onaylandı';
            case 'shipped':
                return 'Kargoda';
            case 'delivered':
                return 'Teslim Edildi';
            case 'cancelled':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'confirmed':
                return 'bg-blue-100 text-blue-700';
            case 'shipped':
                return 'bg-purple-100 text-purple-700';
            case 'delivered':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Sipariş Yönetimi</h1>
                <p className="text-gray-500 font-light text-sm uppercase tracking-[0.2em]">Tüm Siparişler & Durum Takibi</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-surface-dark p-12 text-center border border-black/5 dark:border-white/5">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-400 uppercase tracking-widest text-sm">Henüz sipariş bulunmuyor</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:shadow-lg"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(order.status)}
                                        <div>
                                            <h3 className="font-black uppercase tracking-tight text-lg">{order.customer_name}</h3>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                                Sipariş #{order.id.substring(0, 8)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-black/20 rounded transition-colors"
                                    >
                                        {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Toplam Tutar</p>
                                        <p className="text-lg font-black text-orange-600">₺{order.total_amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Telefon</p>
                                        <p className="text-sm font-bold">{order.customer_phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">E-posta</p>
                                        <p className="text-sm font-bold truncate">{order.customer_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Tarih</p>
                                        <p className="text-sm font-bold">
                                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-6">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-2">Teslimat Adresi</p>
                                            <p className="text-sm font-light leading-relaxed">{order.address}</p>
                                        </div>

                                        {/* Order Items with Color Info */}
                                        {(order as any).order_items && (order as any).order_items.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">Sipariş Kalemleri</p>
                                                <div className="space-y-3">
                                                    {(order as any).order_items.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-black/20 border border-black/5 dark:border-white/5">
                                                            {/* Color Swatch */}
                                                            {item.selected_color_hex ? (
                                                                <div 
                                                                    className="size-8 rounded-full border-2 border-white shadow-md shrink-0"
                                                                    style={{ backgroundColor: item.selected_color_hex }}
                                                                    title={item.selected_color_name}
                                                                />
                                                            ) : (
                                                                <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                                                                    <span className="text-[7px] font-black text-gray-400">—</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex-grow min-w-0">
                                                                <p className="text-[10px] font-black uppercase tracking-widest truncate">
                                                                    {item.product_name || `Ürün #${item.product_id.substring(0, 8)}`}
                                                                </p>
                                                                {item.selected_color_name ? (
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-orange-600 mt-0.5">
                                                                        Renk: {item.selected_color_name}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                                                                        Renk seçilmedi
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="text-right shrink-0">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.quantity} Adet</p>
                                                                <p className="text-sm font-black text-orange-600">₺{(item.price * item.quantity).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">Sipariş Durumu</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusUpdate(order.id, status)}
                                                        disabled={updatingStatus === order.id || order.status === status}
                                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-black transition-all ${order.status === status
                                                                ? getStatusColor(status)
                                                                : 'bg-gray-100 dark:bg-black/20 text-gray-600 hover:bg-gray-200 dark:hover:bg-black/40'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {updatingStatus === order.id && order.status !== status ? (
                                                            <span className="inline-block animate-spin">⏳</span>
                                                        ) : (
                                                            getStatusText(status)
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <span className={`inline-block px-4 py-2 text-[10px] uppercase tracking-widest font-black ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
