
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductsTable() {
    console.log('Testing products table...');
    const testProduct = {
        name: 'TEST_COL_' + Date.now(),
        price: 100,
        discount_price: 80,
        category: 'Oturma Grubu',
        description: 'Test',
        stock: 1,
        images: [],
        modelurl: 'https://example.com/test.glb',
        videourl: 'https://example.com/test.mp4',
        dimensions: {},
        colors: [],
        fabric_properties: {}
    };

    const cols = Object.keys(testProduct);
    const missing = [];
    const exists = [];

    for (const col of cols) {
        const { error } = await supabase.from('products').select(col).limit(1);
        if (error && (error.code === 'PGRST204' || error.message.includes('column'))) {
            missing.push(col);
        } else {
            exists.push(col);
        }
    }

    const { error: insertError } = await supabase.from('products').insert([{
        name: 'TEST_INSERT_' + Date.now(),
        price: 10,
        discount_price: 5
    }]).select();

    let insertMsg = 'INSERT SUCCESS';
    if (insertError) {
        insertMsg = `INSERT FAILED: ${insertError.message} (${insertError.code})`;
    } else {
        await supabase.from('products').delete().eq('price', 10);
    }

    const results = `--- PRODUCTS RESULTS ---
Exists: ${exists.join(', ')}
MISSING: ${missing.length > 0 ? missing.join(', ') : 'None!'}
${insertMsg}
`;
    return results;
}

async function testOrderItemsTable() {
    console.log('Testing order_items table...');
    const orderItemCols = ['order_id', 'product_id', 'product_name', 'quantity', 'price', 'selected_color_name', 'selected_color_hex'];
    const missing = [];
    const exists = [];

    for (const col of orderItemCols) {
        const { error } = await supabase.from('order_items').select(col).limit(1);
        if (error && (error.code === 'PGRST204' || error.message.includes('column'))) {
            missing.push(col);
        } else {
            exists.push(col);
        }
    }

    const results = `--- ORDER_ITEMS RESULTS ---
Exists: ${exists.join(', ')}
MISSING: ${missing.length > 0 ? missing.join(', ') : 'None!'}
`;
    return results;
}


async function testOrdersTable() {
    console.log('Testing orders table...');
    const orderCols = ['id', 'customer_name', 'customer_email', 'customer_phone', 'address', 'total_amount', 'status'];
    const missing = [];
    const exists = [];

    for (const col of orderCols) {
        const { error } = await supabase.from('orders').select(col).limit(1);
        if (error && (error.code === 'PGRST204' || error.message.includes('column'))) {
            missing.push(col);
        } else {
            exists.push(col);
        }
    }

    const results = `--- ORDERS RESULTS ---
Exists: ${exists.join(', ')}
MISSING: ${missing.length > 0 ? missing.join(', ') : 'None!'}
`;
    return results;
}

async function runTests() {
    const r1 = await testProductsTable();
    const r2 = await testOrderItemsTable();
    const r3 = await testOrdersTable();
    const combined = r1 + '\n' + r2 + '\n' + r3;
    console.log(combined);
    const fs = await import('fs');
    fs.writeFileSync('test_results.txt', combined);
}


runTests();
