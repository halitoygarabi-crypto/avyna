
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing insert into "products" table...');
    const testProduct = {
        id: 'test-' + Date.now(),
        name: 'Test Product ' + new Date().toISOString(),
        price: 999,
        category: 'Oturma Grubu',
        description: 'Test description',
        stock: 1,
        images: ['https://via.placeholder.com/150'],
        modelurl: null,
        dimensions: null
    };

    const { data, error } = await supabase.from('products').insert([testProduct]).select();
    
    if (error) {
        console.error('INSERT ERROR:', error);
    } else {
        console.log('INSERT SUCCESS:', data);
        // Clean up
        await supabase.from('products').delete().eq('id', testProduct.id);
        console.log('Cleanup successful.');
    }
}

testInsert();
