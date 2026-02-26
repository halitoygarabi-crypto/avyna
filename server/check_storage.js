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

async function checkBuckets() {
    console.log('Checking Supabase Storage buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    console.log(`Found ${data.length} buckets:`);
    data.forEach(b => console.log(`- ${b.name} (${b.public ? 'public' : 'private'})`));
    
    if (data.length === 0) {
        console.log('No buckets found. Attempting to create "product-images" bucket...');
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('product-images', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 5 // 5MB limit
        });
        
        if (createError) {
            console.error('Failed to create bucket (likely permission issue):', createError.message);
        } else {
            console.log('Successfully created "product-images" bucket!');
        }
    }
}

checkBuckets();
