
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

async function inspectSchema() {
    console.log('Inspecting "id" column in "products" table...');
    
    // Attempting to get column metadata
    const { data, error } = await supabase.rpc('get_column_default', { 
        table_name: 'products',
        column_name: 'id'
    }).catch(e => ({ error: e }));

    if (error) {
        console.log('RPC check failed (expected if not defined). Trying information_schema query...');
        // We can't query information_schema directly with anon key usually, 
        // but let's try a simple select again.
    }

    const { data: cols, error: colsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
    
    if (colsError) {
        console.error('Select error:', colsError.message);
    } else {
        console.log('Successfully selected a row (or empty).');
    }
}

async function forceIdGen() {
    console.log('\nTesting insert with EXPLICIT UUID generation...');
    const crypto = await import('crypto');
    const newId = crypto.randomUUID();
    const p = {
        id: newId,
        name: 'FORCE_ID_TEST_' + Date.now(),
        price: 1,
        category: 'Test',
        description: 'Test',
        stock: 1,
        images: []
    };
    const { error } = await supabase.from('products').insert([p]);
    if (error) {
        console.error('FORCE ID FAILED:', error.message);
    } else {
        console.log('FORCE ID SUCCESS! Generated ID:', newId);
        await supabase.from('products').delete().eq('id', newId);
    }
}

(async () => {
    await inspectSchema();
    await forceIdGen();
})();
