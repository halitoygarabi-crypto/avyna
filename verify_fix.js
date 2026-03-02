
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

async function verifyFix() {
    console.log('Verifying database fix...');
    
    // Check products
    const { error: pError } = await supabase.from('products').select('discount_price').limit(1);
    const pOk = !pError;

    // Check order_items
    const { error: oiError1 } = await supabase.from('order_items').select('selected_color_name').limit(1);
    const { error: oiError2 } = await supabase.from('order_items').select('selected_color_hex').limit(1);
    const oiOk = !oiError1 && !oiError2;

    if (pOk && oiOk) {
        console.log('SUCCESS: All columns are now present and visible!');
    } else {
        if (!pOk) console.log('STILL MISSING: products.discount_price');
        if (!oiOk) console.log('STILL MISSING: order_items color columns');
        console.log('Please ensure you ran the SQL in the Supabase Dashboard.');
    }
}

verifyFix();
