
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

async function checkSchema() {
    console.log('Checking columns for "products" table...');
    // We can't use standard SQL queries easily with anon key on some projects, 
    // but we can try to insert a dummy row or select any row and check keys.
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
        console.error('Error fetching product:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Columns found in database:', Object.keys(data[0]));
    } else {
        console.log('No products found to determine columns.');
    }
}

checkSchema();
