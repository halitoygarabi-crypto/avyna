
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing INSERT on products table...');
    
    const dummyProduct = {
        name: 'TEST_INSERT_' + Date.now(),
        price: 100,
        category: 'Oturma Grubu',
        description: 'Test descriptive content',
        stock: 10,
        images: ['https://picsum.photos/200'],
        modelurl: 'https://example.com/test.glb'
    };

    const { data, error } = await supabase
        .from('products')
        .insert([dummyProduct])
        .select();

    if (error) {
        console.error('INSERT FAILED!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('INSERT SUCCESSFUL!');
        console.log('Inserted ID:', data[0].id);
        
        // Clean up
        await supabase.from('products').delete().eq('id', data[0].id);
        console.log('Cleaned up test record.');
    }
}

testInsert();
