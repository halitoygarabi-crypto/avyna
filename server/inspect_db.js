import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProducts() {
    console.log('Inspecting products in Supabase...');
    const { data, error } = await supabase.from('products').select('id, name');
    
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} products:`);
    data.forEach(p => console.log(`ID: "${p.id}" | Name: ${p.name}`));
}

inspectProducts();
