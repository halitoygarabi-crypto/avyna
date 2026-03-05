
import React, { useState } from 'react';
import { Product, ProductColor, FabricProperties, ViewMode } from '../types';
import { Plus, Trash2, Sparkles, Upload, Save, Loader2, Package, Box, Copy, Check, Edit, ShoppingBag, Palette, X, Ruler } from 'lucide-react';
import { generateProductDescription } from '../services/openrouterService';
import { ApiService } from '../services/api';

interface AdminProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNavigate: (view: ViewMode) => void;
}

const Admin: React.FC<AdminProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct, onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [show3DPanel, setShow3DPanel] = useState(false);
  const [n8nImageUrl, setN8nImageUrl] = useState('');
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const PRESET_COLORS: ProductColor[] = [
    { name: 'Krem', hex: '#F5F0E8' },
    { name: 'Bej', hex: '#C8B89A' },
    { name: 'Antrasit', hex: '#3C3C3C' },
    { name: 'Siyah', hex: '#1A1A1A' },
    { name: 'Beyaz', hex: '#FAFAFA' },
    { name: 'Lacivert', hex: '#1B2A4A' },
    { name: 'Bordo', hex: '#6B1D2A' },
    { name: 'Yeşil', hex: '#2D4A3E' },
    { name: 'Gri', hex: '#8C8C8C' },
    { name: 'Kahve', hex: '#5C3D2E' },
    { name: 'Hardal', hex: '#C49B2A' },
    { name: 'Pudra', hex: '#E8C4C4' },
    { name: 'Füme', hex: '#4A4A4A' },
  ];

  const FABRIC_TYPES = ['Kadife', 'Keten', 'Deri', 'Suni Deri', 'Chenille', 'Bouclé', 'Microfiber', 'Pamuklu', 'Polyester', 'Süet', 'Tay Tüyü'];
  const WARRANTY_OPTIONS = ['1 Yıl', '2 Yıl', '3 Yıl', '5 Yıl', '10 Yıl'];
  const CLEANING_OPTIONS = ['Kuru Temizleme', 'Nemli Bez', 'Makinede Yıkanabilir', 'Profesyonel Temizlik', 'Fırçalama'];
  const ORIGIN_OPTIONS = ['Türkiye', 'İtalya', 'Belçika', 'İspanya', 'Almanya', 'Fransa', 'Çin', 'Hindistan'];

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Oturma Grubu',
    description: '',
    stock: '5',
    images: [] as string[],
    modelUrl: '',
    videoUrl: '',
    colors: [] as ProductColor[],
    fabricType: '',
    fabricComposition: '',
    fabricWarranty: '',
    fabricCleaning: '',
    fabricOrigin: '',
    dimWidth: '',
    dimHeight: '',
    dimDepth: '',
    discountPrice: ''
  });

  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [activeColorTab, setActiveColorTab] = useState<string | null>(null); // null = genel görseller

  const modelInputRef = React.useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Using WebP format for better compression/quality ratio
        resolve(canvas.toDataURL('image/webp', 0.6)); 
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      for (const file of fileList) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file as Blob);
        });
        const compressed = await compressImage(base64);

        // Always add to general images by default, user can then assign color
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, compressed]
        }));
      }
    }
  };

  const assignColorToImage = (imageSrc: string, colorName: string | null) => {
    setFormData(prev => {
      // 1. Remove from wherever it currently is
      let newImages = prev.images.filter(img => img !== imageSrc);
      let newColors = prev.colors.map(c => ({
        ...c,
        images: (c.images || []).filter(img => img !== imageSrc)
      }));

      // 2. Add to new location
      if (colorName === null) {
        newImages.push(imageSrc);
      } else {
        newColors = newColors.map(c =>
          c.name === colorName
            ? { ...c, images: [...(c.images || []), imageSrc] }
            : c
        );
      }

      return { ...prev, images: newImages, colors: newColors };
    });
  };

  const removeAnyImage = (imageSrc: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageSrc),
      colors: prev.colors.map(c => ({
        ...c,
        images: (c.images || []).filter(img => img !== imageSrc)
      }))
    }));
  };

  const handleModelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        alert('3D Model dosyası çok büyük (Max 20MB).');
        return;
      }

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setFormData(prev => ({ ...prev, modelUrl: base64 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // For new products, we DON'T send an ID so Supabase generates a UUID
      const fabricProps: FabricProperties | undefined = formData.fabricType ? {
        type: formData.fabricType,
        composition: formData.fabricComposition,
        warrantyPeriod: formData.fabricWarranty,
        cleaningInstructions: formData.fabricCleaning,
        origin: formData.fabricOrigin
      } : undefined;

      const newProduct: any = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        stock: Number(formData.stock),
        images: formData.images,
        modelUrl: formData.modelUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        colors: formData.colors,
        fabricProperties: fabricProps,
        dimensions: {
          width: Number(formData.dimWidth) || 100,
          height: Number(formData.dimHeight) || 80,
          depth: Number(formData.dimDepth) || 90
        },
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined
      };

      await onAddProduct(newProduct as Product);

      setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '', colors: [], fabricType: '', fabricComposition: '', fabricWarranty: '', fabricCleaning: '', fabricOrigin: '', dimWidth: '', dimHeight: '', dimDepth: '', discountPrice: '' });
      setIsAdding(false);
      alert("✅ ÜRÜN BAŞARIYLA KAYDEDİLDİ!");
    } catch (error: any) {
      console.error("Full Submit Error Object:", error);
      const errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
      const errorCode = error.code || error.status || "";
      
      let hint = "Lütfen internet bağlantınızı ve verilerinizi kontrol edin.";
      if (errorCode === '413' || errorMessage.includes('large') || errorMessage.includes('Entity Too Large')) {
        hint = "Görsel boyutları çok büyük. Nginx veya Sunucu limiti aşılmış olabilir. Lütfen daha az veya daha küçük görsel yükleyin.";
      } else if (errorCode === '42501' || errorMessage.includes('permission')) {
        hint = "Supabase RLS izinleri kapalı veya yetki sorunu var.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
        hint = "Sunucu yanıt vermedi (Timeout). İnternet hızınız düşük olabilir veya sunucu meşgul.";
      } else if (errorCode === '23505') {
        hint = "Bu isimde bir ürün zaten mevcut olabilir.";
      }

      alert(`❌ ÜRÜN KAYDEDİLEMEDİ!\n\nHata: ${errorMessage}\nKod: ${errorCode}\n\nİpucu: ${hint}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || 'Oturma Grubu',
      description: product.description || '',
      stock: product.stock.toString(),
      images: product.images || [],
      modelUrl: product.modelUrl || '',
      videoUrl: product.videoUrl || '',
      colors: product.colors || [],
      fabricType: product.fabricProperties?.type || '',
      fabricComposition: product.fabricProperties?.composition || '',
      fabricWarranty: product.fabricProperties?.warrantyPeriod || '',
      fabricCleaning: product.fabricProperties?.cleaningInstructions || '',
      fabricOrigin: product.fabricProperties?.origin || '',
      dimWidth: product.dimensions?.width?.toString() || '',
      dimHeight: product.dimensions?.height?.toString() || '',
      dimDepth: product.dimensions?.depth?.toString() || '',
      discountPrice: product.discountPrice?.toString() || ''
    });
    setIsEditing(true);
    setIsAdding(false);
    setShow3DPanel(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !editingProduct) return;

    setIsSubmitting(true);
    try {
      const fabricProps: FabricProperties | undefined = formData.fabricType ? {
        type: formData.fabricType,
        composition: formData.fabricComposition,
        warrantyPeriod: formData.fabricWarranty,
        cleaningInstructions: formData.fabricCleaning,
        origin: formData.fabricOrigin
      } : undefined;

      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        stock: Number(formData.stock),
        images: formData.images,
        modelUrl: formData.modelUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        colors: formData.colors,
        fabricProperties: fabricProps,
        dimensions: {
          width: Number(formData.dimWidth) || editingProduct.dimensions?.width || 100,
          height: Number(formData.dimHeight) || editingProduct.dimensions?.height || 80,
          depth: Number(formData.dimDepth) || editingProduct.dimensions?.depth || 90
        },
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined
      };

      await onUpdateProduct(updatedProduct);

      setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '', colors: [], fabricType: '', fabricComposition: '', fabricWarranty: '', fabricCleaning: '', fabricOrigin: '', dimWidth: '', dimHeight: '', dimDepth: '', discountPrice: '' });
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Full Update Error Object:", error);
      const errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
      const errorCode = error.code || "";
      alert(`Güncelleme Başarısız!\n\nHata: ${errorMessage}\nKod: ${errorCode}\n\nİpucu: 'Cannot coerce' veya '42501' hatası yetki (RLS) sorununa işaret eder.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Varsayılan şifre
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-surface-dark p-12 border border-black/5 dark:border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <div className="text-3xl font-black tracking-[0.4em] uppercase mb-4">Avyna</div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yönetim Paneli Girişi</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Giriş Şifresi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border-b-2 bg-transparent py-4 outline-none transition-all font-bold text-center tracking-[0.5em] ${loginError ? 'border-red-600' : 'border-black/10 dark:border-white/10 focus:border-orange-600'}`}
                placeholder="••••••"
                autoFocus
              />
              {loginError && (
                <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest text-center mt-2">Hatalı Şifre!</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-xl"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (


    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Yönetim Paneli</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 font-light text-sm uppercase tracking-[0.2em]">Koleksiyon & Envanter Kontrolü</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate(ViewMode.ORDERS)}
            className="bg-blue-600 text-white px-8 py-4 flex items-center gap-3 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all uppercase text-[10px] tracking-[0.3em] font-black"
          >
            <ShoppingBag size={16} />
            Siparişler
          </button>
          <button
            onClick={() => {
              setShow3DPanel(!show3DPanel);
              setIsAdding(false);
              setIsEditing(false);
            }}
            className={`px-8 py-4 flex items-center gap-3 transition-all uppercase text-[10px] tracking-[0.3em] font-black ${show3DPanel
              ? 'bg-orange-600 text-white'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white'
              }`}
          >
            <Box size={16} />
            {show3DPanel ? 'Paneli Kapat' : 'AI 3D Üret'}
          </button>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setShow3DPanel(false);
              setIsEditing(false);
            }}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 flex items-center gap-3 hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all uppercase text-[10px] tracking-[0.3em] font-black"
          >
            {isAdding ? 'İptal Et' : 'Yeni Ürün Ekle'}
          </button>
        </div>
      </div>

      {show3DPanel && (
        <div className="bg-white dark:bg-surface-dark p-8 mb-12 border-l-8 border-blue-600 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
            <Box className="text-blue-600" size={24} />
            <h2 className="text-xl font-black uppercase tracking-widest">AI 3D Model Üretimi</h2>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Görsel URL</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={n8nImageUrl}
                  onChange={e => setN8nImageUrl(e.target.value)}
                  className="flex-grow border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold text-sm"
                  placeholder="https://example.com/item-image.jpg"
                />
                <button
                  onClick={async () => {
                    if (!n8nImageUrl) return alert('Lütfen bir görsel URL girin.');
                    setIsGenerating3D(true);
                    setGenerationError(null);
                    setGenerationInfo(null);
                    setGeneratedModelUrl(null);

                    const result = await ApiService.generate3DModel(n8nImageUrl);


                    // Robust parsing of the result
                    let foundUrl = null;
                    const data = Array.isArray(result) ? result[0] : result;

                    if (data) {
                      foundUrl = data.modelUrl || data.url || data.model_url || data.output ||
                        (data.model_urls && data.model_urls.glb) ||
                        (data.data && (data.data.modelUrl || data.data.url || data.data.model_url || (data.data.model_urls && data.data.model_urls.glb)));
                    }

                    if (foundUrl) {
                      setGeneratedModelUrl(foundUrl);
                      setGenerationInfo('Model başarıyla alındı.');
                    } else if (result.success || (data && (data.success || data.message))) {
                      setGenerationInfo('Otomasyon başarıyla tetiklendi. İşlem tamamlandığında model burada görünecektir (n8n yapılandırmanıza bağlıdır).');
                    } else {
                      setGenerationError('Beklenen model URL\'si alınamadı. n8n çıktısını kontrol edin.');
                    }
                    setIsGenerating3D(false);
                  }}
                  disabled={isGenerating3D}
                  className="bg-blue-600 text-white px-8 py-3 text-[10px] uppercase tracking-widest font-black hover:bg-black transition-all flex items-center gap-2"
                >
                  {isGenerating3D ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGenerating3D ? 'ÜRETİLİYOR...' : '3D ÜRET'}
                </button>
              </div>
            </div>

            {generationError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                HATA: {generationError}
              </div>
            )}

            {generationInfo && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                {generationInfo}
              </div>
            )}

            {generatedModelUrl && (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-widest">Model başarıyla üretildi!</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedModelUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[10px] font-black uppercase bg-white dark:bg-black text-black dark:text-white border border-black/10 px-4 py-2 hover:bg-black hover:text-white transition-all flex items-center gap-2"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Kopyalandı!' : 'URL\'yi Kopyala'}
                    </button>
                    <button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          images: [n8nImageUrl],
                          modelUrl: generatedModelUrl
                        }));
                        setFormData(prev => ({
                          ...prev,
                          images: [n8nImageUrl],
                          modelUrl: generatedModelUrl
                        }));
                        setIsAdding(true);
                        setShow3DPanel(false);
                      }}
                      className="text-[10px] font-black uppercase bg-green-600 text-white px-4 py-2 hover:bg-black transition-all"
                    >
                      Ürün Olarak Ekle
                    </button>
                  </div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded break-all font-mono text-[10px] text-gray-500 flex justify-between items-center gap-4">
                  <span className="truncate">{generatedModelUrl}</span>
                </div>
              </div>
            )}

            <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
              * Bu işlem n8n üzerinden Meshy.ai / Replicate otomasyonunu tetikler. İşlem süresi 1-3 dakika sürebilir.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-surface-dark p-8 mb-12 border-l-8 border-orange-600 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-4 italic">Yeni Ürün Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Essential Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Ürün İsmi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold uppercase tracking-tight text-xl"
                  placeholder="ORN: LUNA LOUNGE CHAIR"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Kategori</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 py-3 focus:border-orange-600 outline-none transition-colors bg-white dark:bg-black font-bold uppercase text-sm"
                >
                  <option>Oturma Grubu</option>
                  <option>Yemek Odası</option>
                  <option>Yatak Odası</option>
                  <option>Aksesuar</option>
                  <option>Aydınlatma</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Fiyat (₺)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-orange-600 tracking-[0.2em]">İNDİRİMLİ FİYAT (₺)</label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                  className="w-full border-b-2 border-orange-600/20 bg-orange-50/5 dark:bg-orange-950/5 py-3 focus:border-red-600 outline-none transition-colors font-bold text-lg text-orange-600"
                  placeholder="KAMPANYA VARSA GİRİN"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Stok Miktarı</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold text-sm"
                />
              </div>
            </div>

            {/* Colors and Images Combined - UX IMPROVEMENT */}
            <div className="space-y-6 bg-gray-50/50 dark:bg-white/5 p-8 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                <Palette className="text-orange-600" size={18} />
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Renk Seçenekleri & Görseller</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Add/Select Colors */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. Renkleri Belirleyin</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_COLORS.map(color => {
                      const isSelected = formData.colors.some(c => c.hex === color.hex);
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c.hex !== color.hex) }));
                            } else {
                              setFormData(prev => ({ ...prev, colors: [...prev.colors, { ...color, images: [] }] }));
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 border-2 transition-all text-[9px] font-bold uppercase ${isSelected ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/10' : 'border-black/5 dark:border-white/5 hover:border-black/20'}`}
                        >
                          <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customColorName}
                      onChange={e => setCustomColorName(e.target.value)}
                      className="flex-1 border-b border-black/10 bg-transparent py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-orange-600"
                      placeholder="ÖZEL RENK ADI"
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={e => setCustomColorHex(e.target.value)}
                      className="size-8 cursor-pointer border-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customColorName.trim()) {
                          setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex, images: [] }] }));
                          setCustomColorName('');
                        }
                      }}
                      className="px-4 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* 2. Image Selection & Direct Pairing */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Görselleri Yönetin</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/10 p-6 flex flex-col items-center justify-center text-gray-400 hover:border-orange-600 transition-all cursor-pointer group rounded-lg"
                  >
                    <Upload size={24} className="group-hover:text-orange-600 mb-2 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Tüm Görselleri Buraya Yükleyin</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />
                  </div>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest italic">* Önce tüm fotoğrafları yükleyip, sonra aşağıdaki listeden renklerle eşleştirebilirsiniz.</p>
                </div>
              </div>

              {/* Advanced Image List with Color Pairing */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
                {[
                  ...formData.images.map(img => ({ url: img, color: null })),
                  ...formData.colors.flatMap(c => (c.images || []).map(img => ({ url: img, color: c.name })))
                ].map((item, idx) => (
                  <div key={idx} className="relative group bg-white dark:bg-black border border-black/5 p-2 rounded shadow-sm">
                    <img src={item.url} alt="Variant" className="w-full h-32 object-cover mb-2 grayscale group-hover:grayscale-0 transition-all rounded" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Eşleşen Renk:</p>
                      <select
                        value={item.color || ''}
                        onChange={(e) => assignColorToImage(item.url, e.target.value || null)}
                        className="w-full text-[9px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-surface-dark border-none p-2 outline-none focus:ring-1 ring-orange-600 flex items-center gap-2"
                      >
                        <option value="">Genel Görsel</option>
                        {formData.colors.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAnyImage(item.url)}
                      className="absolute top-1 right-1 bg-white/90 dark:bg-black/90 text-gray-400 hover:text-red-600 size-6 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Props Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 border border-black/5 p-6 bg-gray-50/20">
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <Ruler size={16} className="text-orange-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Boyutlar & Teknik</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Gen. (cm)</label>
                    <input type="number" value={formData.dimWidth} onChange={e => setFormData({ ...formData, dimWidth: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Yük. (cm)</label>
                    <input type="number" value={formData.dimHeight} onChange={e => setFormData({ ...formData, dimHeight: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Der. (cm)</label>
                    <input type="number" value={formData.dimDepth} onChange={e => setFormData({ ...formData, dimDepth: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-orange-600" />
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">3D Model URL (.glb)</label>
                    <input type="text" value={formData.modelUrl} onChange={e => setFormData({ ...formData, modelUrl: e.target.value })} className="w-full border-b border-black/10 bg-transparent py-2 focus:border-orange-600 font-bold text-[10px]" placeholder="https://...model.glb" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Tanıtım Videosu URL</label>
                    <input type="text" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full border-b border-black/10 bg-transparent py-2 focus:border-orange-600 font-bold text-[10px]" placeholder="https://...video.mp4" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 border border-black/5 p-6 bg-gray-50/20">
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <Box size={16} className="text-orange-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Kumaş & Malzeme</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Kumaş Türü</label>
                    <select value={formData.fabricType} onChange={e => setFormData({ ...formData, fabricType: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-[10px] outline-none">
                      <option value="">Seçiniz...</option>
                      {FABRIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Garanti</label>
                    <select value={formData.fabricWarranty} onChange={e => setFormData({ ...formData, fabricWarranty: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-[10px] outline-none">
                      <option value="">Seçiniz...</option>
                      {WARRANTY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Kumaş İçeriği</label>
                    <input type="text" value={formData.fabricComposition} onChange={e => setFormData({ ...formData, fabricComposition: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-xs bg-transparent outline-none focus:border-orange-600" placeholder="örn: 80% Polyester, 20% Pamuk" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description / Story */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.3em]">Hikaye & Ürün Tanıtımı</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-black/10 p-8 h-56 outline-none focus:border-orange-600 bg-transparent transition-colors font-light text-sm leading-relaxed"
                placeholder="Bu ürünü özel kılan detayları, zanaat hikayesini ve yaşam alanına katacağı ruhu anlatın..."
              />
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-black/5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 text-white px-20 py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all flex items-center gap-4 group"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {isSubmitting ? 'KAYDEDİLİYOR...' : 'KATALOGA EKLE'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isEditing && editingProduct && (
        <div className="bg-white dark:bg-surface-dark p-8 mb-12 border-l-8 border-blue-600 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
          <div className="flex justify-between items-center mb-8 border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-widest italic">Ürün Düzenle: <span className="text-blue-600 font-black">{editingProduct.name}</span></h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingProduct(null);
                setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '', colors: [], fabricType: '', fabricComposition: '', fabricWarranty: '', fabricCleaning: '', fabricOrigin: '', dimWidth: '', dimHeight: '', dimDepth: '', discountPrice: '' });
              }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              Vazgeç
            </button>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-10">
            {/* Essential Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Ürün İsmi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold uppercase tracking-tight text-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Kategori</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 py-3 focus:border-blue-600 outline-none transition-colors bg-white dark:bg-black font-bold uppercase text-sm"
                >
                  <option>Oturma Grubu</option>
                  <option>Yemek Odası</option>
                  <option>Yatak Odası</option>
                  <option>Aksesuar</option>
                  <option>Aydınlatma</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Fiyat (₺)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-blue-600 tracking-[0.2em]">İNDİRİMLİ FİYAT (₺)</label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                  className="w-full border-b-2 border-blue-600/20 bg-blue-50/5 dark:bg-blue-950/5 py-3 focus:border-red-600 outline-none transition-colors font-bold text-lg text-blue-600"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Stok Miktarı</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold text-sm"
                />
              </div>
            </div>

            {/* Colors and Images Combined */}
            <div className="space-y-6 bg-gray-50/50 dark:bg-white/5 p-8 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 border-b border-black/5 pb-4">
                <Palette className="text-blue-600" size={18} />
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Renk Seçenekleri & Görseller</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. Renkleri Belirleyin</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_COLORS.map(color => {
                      const isSelected = formData.colors.some(c => c.hex === color.hex);
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c.hex !== color.hex) }));
                            } else {
                              setFormData(prev => ({ ...prev, colors: [...prev.colors, { ...color, images: [] }] }));
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 border-2 transition-all text-[9px] font-bold uppercase ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-black/5 dark:border-white/5 hover:border-black/20'}`}
                        >
                          <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customColorName}
                      onChange={e => setCustomColorName(e.target.value)}
                      className="flex-1 border-b border-black/10 bg-transparent py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-600"
                      placeholder="ÖZEL RENK ADI"
                    />
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={e => setCustomColorHex(e.target.value)}
                      className="size-8 cursor-pointer border-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customColorName.trim()) {
                          setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex, images: [] }] }));
                          setCustomColorName('');
                        }
                      }}
                      className="px-4 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. Görselleri Yönetin</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/10 p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-600 transition-all cursor-pointer group rounded-lg"
                  >
                    <Upload size={24} className="group-hover:text-blue-600 mb-2 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Görsel Ekle</span>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" multiple />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
                {[
                  ...formData.images.map(img => ({ url: img, color: null })),
                  ...formData.colors.flatMap(c => (c.images || []).map(img => ({ url: img, color: c.name })))
                ].map((item, idx) => (
                  <div key={idx} className="relative group bg-white dark:bg-black border border-black/5 p-2 rounded shadow-sm">
                    <img src={item.url} alt="Variant" className="w-full h-32 object-cover mb-2 grayscale group-hover:grayscale-0 transition-all rounded" />
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Eşleşen Renk:</p>
                      <select
                        value={item.color || ''}
                        onChange={(e) => assignColorToImage(item.url, e.target.value || null)}
                        className="w-full text-[9px] font-bold uppercase tracking-widest bg-gray-50 dark:bg-surface-dark border-none p-2 outline-none focus:ring-1 ring-blue-600"
                      >
                        <option value="">Genel Görsel</option>
                        {formData.colors.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAnyImage(item.url)}
                      className="absolute top-1 right-1 bg-white/90 dark:bg-black/90 text-gray-400 hover:text-red-600 size-6 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Props Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 border border-black/5 p-6 bg-gray-50/20">
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <Ruler size={16} className="text-blue-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Boyutlar & Teknik</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Gen. (cm)</label>
                    <input type="number" value={formData.dimWidth} onChange={e => setFormData({ ...formData, dimWidth: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Yük. (cm)</label>
                    <input type="number" value={formData.dimHeight} onChange={e => setFormData({ ...formData, dimHeight: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400 tracking-tighter">Der. (cm)</label>
                    <input type="number" value={formData.dimDepth} onChange={e => setFormData({ ...formData, dimDepth: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-sm bg-transparent outline-none focus:border-blue-600" />
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">3D Model URL (.glb)</label>
                    <input type="text" value={formData.modelUrl} onChange={e => setFormData({ ...formData, modelUrl: e.target.value })} className="w-full border-b border-black/10 bg-transparent py-2 focus:border-blue-600 font-bold text-[10px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">Video URL</label>
                    <input type="text" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full border-b border-black/10 bg-transparent py-2 focus:border-blue-600 font-bold text-[10px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 border border-black/5 p-6 bg-gray-50/20">
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <Box size={16} className="text-blue-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Kumaş & Malzeme</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Kumaş Türü</label>
                    <select value={formData.fabricType} onChange={e => setFormData({ ...formData, fabricType: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-[10px] outline-none">
                      <option value="">Seçiniz...</option>
                      {FABRIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Garanti</label>
                    <select value={formData.fabricWarranty} onChange={e => setFormData({ ...formData, fabricWarranty: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-[10px] outline-none">
                      <option value="">Seçiniz...</option>
                      {WARRANTY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Kumaş İçeriği</label>
                    <input type="text" value={formData.fabricComposition} onChange={e => setFormData({ ...formData, fabricComposition: e.target.value })} className="w-full border-b border-black/10 py-2 font-bold text-xs bg-transparent outline-none focus:border-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description / Story */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-[0.3em]">Hikaye & Ürün Tanıtımı</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-black/10 p-8 h-56 outline-none focus:border-blue-600 bg-transparent transition-colors font-light text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-6 pt-8 border-t border-black/5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-16 py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all flex items-center gap-4 group"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                {isSubmitting ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-black border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-surface-dark border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="px-8 py-6 text-[10px] uppercase font-black tracking-widest text-gray-400">Ürün Tanımı</th>
                <th className="px-8 py-6 text-[10px] uppercase font-black tracking-widest text-gray-400">Kategori</th>
                <th className="px-8 py-6 text-[10px] uppercase font-black tracking-widest text-gray-400">Fiyat</th>
                <th className="px-8 py-6 text-[10px] uppercase font-black tracking-widest text-gray-400">Durum</th>
                <th className="px-8 py-6 text-[10px] uppercase font-black tracking-widest text-gray-400 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {products.map(p => (
                <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 overflow-hidden border border-black/5 relative">
                        <img src={p.images?.[0] || 'https://picsum.photos/seed/placeholder/800/600'} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        {p.modelUrl && (
                          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1">
                            <Box size={8} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black uppercase tracking-tight text-sm">{p.name}</span>
                        {p.modelUrl && <span className="text-[8px] text-blue-600 font-bold uppercase tracking-widest">3D AKTİF</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</td>
                  <td className="px-8 py-6 text-sm font-black text-orange-600">₺{p.price.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black px-3 py-1 uppercase tracking-widest ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock > 0 ? 'Mevcut' : 'Tükendi'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-gray-400 hover:text-orange-600 transition-colors p-2"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
