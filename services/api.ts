
import { SupabaseService } from './supabase';

export const ApiService = {
    // Products
    async getProducts() {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
        const response = await fetch(`${backendUrl}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    },

    async addProduct(product: any) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
        const response = await fetch(`${backendUrl}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add product');
        }
        return await response.json();
    },

    async deleteProduct(id: string) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
        const response = await fetch(`${backendUrl}/api/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return { success: true };
    },

    async updateProduct(product: any) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
        const response = await fetch(`${backendUrl}/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update product');
        }
        return await response.json();
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
