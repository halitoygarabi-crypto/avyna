import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mdxsasiabwronqkegkuo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const productData = {
    'Bhusra': { category: 'Koltuk', price: 24500, description: 'Modern tasarım, yüksek konfor' },
    'Denise': { category: 'Koltuk', price: 22800, description: 'Şık ve zarif tasarım' },
    'Floki': { category: 'Koltuk', price: 26900, description: 'Premium konfor ve stil' },
    'Gudrun': { category: 'Koltuk', price: 23500, description: 'Ergonomik ve modern' },
    'Harpy': { category: 'Koltuk', price: 25200, description: 'Lüks ve rahat' },
    'Lich': { category: 'Koltuk', price: 21900, description: 'Minimalist tasarım' },
    'Napper': { category: 'Koltuk', price: 27500, description: 'Ekstra konforlu dinlenme koltuğu' },
    'Pergamon': { category: 'Koltuk', price: 28900, description: 'Premium deri kaplama' },
    'Smile': { category: 'Koltuk', price: 24200, description: 'Neşeli ve rahat' },
    'Storm': { category: 'Koltuk', price: 26500, description: 'Güçlü ve dayanıklı' },
    'Thor': { category: 'Koltuk', price: 29900, description: 'En üst segment konfor' }
};

async function loadY1Products() {
    console.log('\n🚀 Y1 Ürünlerini Supabase\'e Yükleme Başlıyor...\n');
    console.log('━'.repeat(60));

    const y1Path = path.join(__dirname, '..', 'y1');

    if (!fs.existsSync(y1Path)) {
        console.error('❌ y1 klasörü bulunamadı:', y1Path);
        return;
    }

    const folders = fs.readdirSync(y1Path).filter(item => {
        const fullPath = path.join(y1Path, item);
        return fs.statSync(fullPath).isDirectory();
    });

    console.log(`📦 Toplam ${folders.length} ürün klasörü bulundu\n`);

    const products = [];
    let successCount = 0;
    let errorCount = 0;

    for (const folderName of folders) {
        const folderPath = path.join(y1Path, folderName);

        // Get all JPG images in the folder
        const images = fs.readdirSync(folderPath)
            .filter(file => file.toLowerCase().endsWith('.jpg'))
            .map(file => `/y1/${folderName}/${file}`);

        if (images.length === 0) {
            console.log(`⚠️  ${folderName}: Görsel bulunamadı, atlanıyor...`);
            continue;
        }

        const productInfo = productData[folderName] || {
            category: 'Koltuk',
            price: 25000,
            description: 'Premium mobilya'
        };

        const product = {
            id: `y1-${folderName.toLowerCase()}`,
            name: folderName,
            price: productInfo.price,
            category: productInfo.category,
            description: productInfo.description,
            images: images,
            modelurl: null,
            stock: 10,
            dimensions: null
        };

        products.push(product);
        console.log(`✅ ${folderName.padEnd(15)} - ${images.length} görsel - ${productInfo.price}₺`);
    }

    console.log('\n' + '━'.repeat(60));
    console.log(`\n📊 Toplam ${products.length} ürün hazırlandı\n`);
    console.log('🔄 Supabase\'e yükleniyor...\n');

    // Insert products into Supabase
    try {
        // First, delete existing y1 products to avoid duplicates
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .like('id', 'y1-%');

        if (deleteError) {
            console.log('⚠️  Eski ürünler silinirken uyarı:', deleteError.message);
        } else {
            console.log('🗑️  Eski y1 ürünleri temizlendi\n');
        }

        // Insert new products
        const { data, error } = await supabase
            .from('products')
            .insert(products)
            .select();

        if (error) {
            console.error('❌ Hata:', error.message);
            console.error('   Detay:', error.details);
            console.error('   Hint:', error.hint);
            errorCount = products.length;
        } else {
            successCount = data.length;
            console.log('✅ Başarıyla yüklendi!\n');
            console.log('━'.repeat(60));
            console.log('\n📋 Yüklenen Ürünler:\n');

            data.forEach((p, index) => {
                console.log(`   ${(index + 1).toString().padStart(2)}. ${p.name.padEnd(15)} - ${p.price}₺ - ${p.images.length} görsel`);
            });
        }

    } catch (err) {
        console.error('❌ Beklenmeyen hata:', err.message);
        errorCount = products.length;
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 Özet:');
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log(`   📦 Toplam: ${products.length}\n`);

    if (successCount > 0) {
        console.log('🎉 Ürünler başarıyla yüklendi!');
        console.log('🌐 Şimdi siteyi kontrol edebilirsin: https://avynafurniture.com/\n');
    }
}

// Run the script
loadY1Products().catch(console.error);
