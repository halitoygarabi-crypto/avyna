
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
            modelUrl: p.modelurl,
            videoUrl: p.videourl,
            colors: p.colors || [],
            fabricProperties: p.fabric_properties || undefined,
            discountPrice: p.discount_price || undefined
        }));
    },


    async addProduct(product: any) {
        // Explicitly map only the columns that exist in the Supabase schema
        const dbProduct: any = {
            id: product.id || undefined,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.images || [],
            modelurl: product.modelUrl,
            dimensions: product.dimensions,
            colors: product.colors || [],
            fabric_properties: product.fabricProperties || null,
            discount_price: product.discountPrice || null
        };

        // Only add videourl if it's provided
        if (product.videoUrl) {
            dbProduct.videourl = product.videoUrl;
        }

        const { data, error } = await supabase
            .from('products')
            .insert([dbProduct])
            .select();

        if (error) {
            console.error('Supabase Add Product Error:', error);
            // If videourl column is missing (code 42703), try again without it
            if (error.code === '42703' && dbProduct.videourl) {
                const { videourl, ...cleanProduct } = dbProduct;
                const { data: retryData, error: retryError } = await supabase
                    .from('products')
                    .insert([cleanProduct])
                    .select();
                
                if (retryError) throw retryError;
                const returned = retryData[0];
                return {
                    ...returned,
                    images: returned.images || [],
                    modelUrl: returned.modelurl,
                    videoUrl: returned.videourl,
                    colors: returned.colors || [],
                    fabricProperties: returned.fabric_properties || undefined
                };
            }
            throw error;
        }

        const returned = data[0];
        return {
            ...returned,
            images: returned.images || [],
            modelUrl: returned.modelurl,
            videoUrl: returned.videourl,
            colors: returned.colors || [],
            fabricProperties: returned.fabric_properties || undefined
        };
    },

    async deleteProduct(id: string) {
        console.log('[Supabase] Deleting product:', id);
        const { error, count } = await supabase
            .from('products')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) {
            console.error('Supabase Delete Product Error:', error);
            throw new Error(`Ürün silinemedi: ${error.message}`);
        }

        console.log('[Supabase] Delete result - rows affected:', count);
        
        // Verify the product is actually gone
        const { data: checkData } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .maybeSingle();
        
        if (checkData) {
            console.error('[Supabase] Product still exists after delete! RLS may be blocking.');
            throw new Error('Ürün silinemedi. RLS politikası izin vermiyor olabilir. Supabase Dashboard\'dan kontrol edin.');
        }

        console.log('[Supabase] Product successfully deleted:', id);
    },

    async updateProduct(product: any) {
        // Explicitly map only the columns that exist in the Supabase schema
        const dbProduct: any = {
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description,
            stock: product.stock,
            images: product.images || [],
            modelurl: product.modelUrl,
            dimensions: product.dimensions,
            colors: product.colors || [],
            fabric_properties: product.fabricProperties || null,
            discount_price: product.discountPrice || null
        };

        // Only add videourl if it's provided
        if (product.videoUrl) {
            dbProduct.videourl = product.videoUrl;
        }

        const { data, error } = await supabase
            .from('products')
            .update(dbProduct)
            .eq('id', product.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase Update Product Error:', error);
            
            // If videourl column is missing, try again without it
            if (error.code === '42703' && dbProduct.videourl) {
                delete dbProduct.videourl;
                const { data: retryData, error: retryError } = await supabase
                    .from('products')
                    .update(dbProduct)
                    .eq('id', product.id)
                    .select()
                    .single();
                
                if (retryError) throw retryError;
                return {
                    ...retryData,
                    images: retryData.images || [],
                    modelUrl: retryData.modelurl,
                    videoUrl: retryData.videourl,
                    colors: retryData.colors || [],
                    fabricProperties: retryData.fabric_properties || undefined
                };
            }
            
            // Better handling for 'Cannot coerce' error which usually means 0 rows matched
            if (error.message && error.message.includes('Cannot coerce')) {
                throw new Error("Ürün güncellenemedi. ID eşleşmiyor olabilir veya RLS politikaları izin vermiyor olabilir.");
            }

            throw error;
        }

        return {
            ...data,
            images: data.images || [],
            modelUrl: data.modelurl,
            videoUrl: data.videourl,
            colors: data.colors || [],
            fabricProperties: data.fabric_properties || undefined
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
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.discountPrice || item.product.price,
            selected_color_name: item.selectedColor?.name || null,
            selected_color_hex: item.selectedColor?.hex || null
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
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    product_name,
                    quantity,
                    price,
                    selected_color_name,
                    selected_color_hex
                )
            `)
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
