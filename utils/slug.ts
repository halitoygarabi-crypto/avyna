/**
 * Türkçe karakterler dahil ürün adından SEO-uyumlu slug oluşturur
 * Örnek: "Bhusra Koltuk" → "bhusra-koltuk"
 * Örnek: "Özel Çalışma Masası" → "ozel-calisma-masasi"
 */

const turkishMap: Record<string, string> = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'I': 'I',
  'İ': 'i',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
};

export function slugify(text: string): string {
  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-')     // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')         // Collapse multiple hyphens
    .replace(/^-|-$/g, '');      // Trim hyphens from start/end
}

/**
 * Slug'dan ürün bul (büyük/küçük harf duyarsız karşılaştırma)
 */
export function findProductBySlug(products: { name: string; id: string }[], slug: string) {
  return products.find(p => slugify(p.name) === slug) || 
         products.find(p => p.id === slug); // Fallback: id ile de dene
}
