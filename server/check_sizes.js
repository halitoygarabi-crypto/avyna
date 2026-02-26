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

async function checkImageSizes() {
    console.log('Fetching products to check image sizes...');
    const { data, error } = await supabase.from('products').select('id, name, images');
    
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${data.length} products.\n`);
    
    data.forEach(p => {
        const images = p.images || [];
        const jsonStr = JSON.stringify(images);
        const sizeInKB = (jsonStr.length / 1024).toFixed(2);
        
        console.log(`- ${p.name.padEnd(20)}: ${images.length} images, Total size: ${sizeInKB} KB`);
        
        if (images.length > 0) {
            const firstImage = images[0];
            if (firstImage.startsWith('data:image')) {
                console.log(`  [BASE64 DETECTED]`);
            } else {
                console.log(`  [URL DETECTED: ${firstImage.substring(0, 30)}...]`);
            }
        }
    });
}

checkImageSizes();
