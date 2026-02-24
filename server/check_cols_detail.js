
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

async function checkSchemaDetail() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('--- PRODUCT COLUMNS ---');
        Object.keys(data[0]).forEach(key => {
            console.log(`- ${key} (${typeof data[0][key]})`);
        });
        console.log('--- END COLUMNS ---');
    } else {
        console.log('Table is empty.');
    }
}

checkSchemaDetail();
