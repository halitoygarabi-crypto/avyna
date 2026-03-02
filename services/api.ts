
import { SupabaseService } from './supabase';

export const ApiService = {
    // Products - Direct Supabase (single source of truth, no stale data)
    async getProducts() {
        return await SupabaseService.getProducts();
    },

    async addProduct(product: any) {
        return await SupabaseService.addProduct(product);
    },

    async deleteProduct(id: string) {
        // Delete directly via Supabase (more reliable than backend proxy)
        return await SupabaseService.deleteProduct(id);
    },

    async updateProduct(product: any) {
        return await SupabaseService.updateProduct(product);
    },

    // Orders
    async createOrder(order: any, items: any[]) {
        return await SupabaseService.createOrder(order, items);
    },

    async getOrders() {
        return await SupabaseService.getOrders();
    },

    async updateOrderStatus(orderId: string, status: string) {
        return await SupabaseService.updateOrderStatus(orderId, status);
    },


    // AI Tools (Still using n8n for this)
    async generate3DModel(imageUrl: string) {
        const webhookUrl = 'https://n8n.polmarkai.pro/webhook-test/image-to-3d';
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl })
        });
        if (!response.ok) throw new Error('Failed to generate 3D model');
        return await response.json();
    },


    // QNB Finansbank
    async initiateQNBPayment(paymentData: any) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
        const response = await fetch(`${backendUrl}/api/payment/qnb/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Payment could not be initiated');
        }
        return await response.json();
    }
};
