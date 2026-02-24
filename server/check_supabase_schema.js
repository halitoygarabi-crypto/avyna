
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('Checking products table schema...');
    
    // Get one product to see current columns
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching schema:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    } else {
        console.log('No products found in the table. Attempting dummy insert...');
        
        const dummyProduct = {
            name: 'SCHEMA_CHECK_' + Date.now(),
            price: 99,
            category: 'Oturma Grubu',
            description: 'Schema check dummy product',
            stock: 1,
            images: [],
            modelurl: 'https://example.com/test.glb'
        };

        const { error: insertError } = await supabase
            .from('products')
            .insert([dummyProduct]);
        
        if (insertError) {
            console.error('Insert failed:', insertError);
            console.log('Raw error body:', JSON.stringify(insertError, null, 2));
        } else {
            console.log('Insert succeeded! Table exists and columns are compatible.');
            await supabase.from('products').delete().eq('name', dummyProduct.name);
        }
    }
}

checkSchema();
