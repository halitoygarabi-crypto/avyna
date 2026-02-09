
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SupabaseService = {
    // Products
    async getProducts() {
        const { data: rawData, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Map database lowercase keys to frontend camelCase keys
        return rawData.map((p: any) => ({
            ...p,
            images: p.images || [],
            modelUrl: p.modelurl
        }));
    },


    async addProduct(product: any) {
        // Explicitly map only the columns that exist in the Supabase schema
        const dbProduct = {
            id: product.id || undefined,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.images || [],
            modelurl: product.modelUrl,
            videourl: product.videoUrl,
            dimensions: product.dimensions
        };

        const { data, error } = await supabase
            .from('products')
            .insert([dbProduct])
            .select()
            .single();

        if (error) {
            console.error('Supabase Add Product Error:', error);
            // Provide a cleaner error message for common issues
            if (error.code === '42703') { // Undefined column
                throw new Error("Veritabanı şeması güncel değil (videourl sütunu eksik olabilir).");
            }
            throw error;
        }

        return {
            ...data,
            images: data.images || [],
            modelUrl: data.modelurl,
            videoUrl: data.videourl
        };
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase Delete Product Error:', error);
            throw error;
        }
    },

    async updateProduct(product: any) {
        // Explicitly map only the columns that exist in the Supabase schema
        const dbProduct = {
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.images || [],
            modelurl: product.modelUrl,
            videourl: product.videoUrl,
            dimensions: product.dimensions
        };

        const { data, error } = await supabase
            .from('products')
            .update(dbProduct)
            .eq('id', product.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase Update Product Error:', error);
            if (error.code === '42703') { // Undefined column
                throw new Error("Veritabanı şeması güncel değil (videourl sütunu eksik olabilir).");
            }
            throw error;
        }

        return {
            ...data,
            images: data.images || [],
            modelUrl: data.modelurl,
            videoUrl: data.videourl
        };
    },


    // Orders
    async createOrder(order: any, items: any[]) {
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                id: order.id, // Support custom order ID
                customer_name: order.customerName,
                customer_email: order.customerEmail,
                customer_phone: order.customerPhone,
                address: order.address,
                total_amount: order.total,
                status: 'pending'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return orderData;
    },

    async getOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateOrderStatus(orderId: string, status: string) {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
