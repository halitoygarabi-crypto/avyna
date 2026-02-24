
import React, { useState } from 'react';
import { Product, ViewMode } from '../types';
import { Plus, Trash2, Sparkles, Upload, Save, Loader2, Package, Box, Copy, Check, Edit, ShoppingBag } from 'lucide-react';
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [n8nImageUrl, setN8nImageUrl] = useState('');
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationInfo, setGenerationInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Oturma Grubu',
    description: '',
    stock: '5',
    images: [] as string[],
    modelUrl: '',
    videoUrl: ''
  });

  const modelInputRef = React.useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string, maxWidth = 600, maxHeight = 600): Promise<string> => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.5)); // Lower quality for better payload speed
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

        setImagePreviews(prev => [...prev, compressed]);
        setFormData(prev => ({ ...prev, images: [...prev.images, compressed] }));
      }
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);

    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: updatedImages }));
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
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        stock: Number(formData.stock),
        images: formData.images.length > 0 ? formData.images : ['https://picsum.photos/seed/' + formData.name + '/800/600'],
        modelUrl: formData.modelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
        videoUrl: formData.videoUrl || undefined,
        dimensions: { width: 100, height: 100, depth: 100 }
      };

      await onAddProduct(newProduct);

      setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '' });
      setImagePreviews([]);
      setIsAdding(false);
    } catch (error: any) {
      console.error("Full Submit Error Object:", error);
      const errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
      const errorCode = error.code || "";
      alert(`Ürün Eklenemedi!\n\nHata: ${errorMessage}\nKod: ${errorCode}\n\nİpucu: Eğer kod '42501' ise Supabase'de RLS izinlerini vermeniz gerekir. Eğer kod '413' ise görseller çok büyüktür.`);
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
      videoUrl: product.videoUrl || ''
    });
    setImagePreviews(product.images || []);
    setIsEditing(true);
    setIsAdding(false);
    setShow3DPanel(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !editingProduct) return;

    setIsSubmitting(true);
    try {
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        stock: Number(formData.stock),
        images: formData.images.length > 0 ? formData.images : editingProduct.images,
        modelUrl: formData.modelUrl || editingProduct.modelUrl,
        videoUrl: formData.videoUrl || undefined,
      };

      await onUpdateProduct(updatedProduct);

      setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '' });
      setImagePreviews([]);
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
          <p className="text-gray-500 font-light text-sm uppercase tracking-[0.2em]">Koleksiyon & Envanter Kontrolü</p>
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
                    console.log("3D Generation Result:", result);

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
                        setImagePreviews([n8nImageUrl]);
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
        <div className="bg-white dark:bg-surface-dark p-8 mb-12 border-l-8 border-orange-600 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-black mb-8 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-4">Ürün Kaydı</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Ürün İsmi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold uppercase tracking-tight text-lg"
                  placeholder="örn: LUNA LOUNGE"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Fiyat (₺)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Kategori</label>
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
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Stok Miktarı</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-orange-600 outline-none transition-colors font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Dosya & Medya (Görseiler)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-black/10 dark:border-white/10 p-4 min-h-[120px] flex flex-wrap gap-4 items-center justify-center text-gray-400 hover:border-orange-600 transition-all cursor-pointer group"
                  >
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative w-20 h-20 border border-black/5">
                          <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-black transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={20} className="group-hover:text-orange-600 transition-colors" />
                        <span className="text-[9px] font-black uppercase mt-2 tracking-widest">GÖRSELLERİ YÜKLE</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">3D Model (.GLB)</label>
                  <div className="flex flex-col gap-3">
                    <div
                      onClick={() => modelInputRef.current?.click()}
                      className={`relative border-2 border-dashed ${formData.modelUrl ? 'border-blue-600/50 bg-blue-50/5' : 'border-black/10 dark:border-white/10'} p-4 min-h-[100px] flex flex-col items-center justify-center text-gray-400 hover:border-blue-600 transition-all cursor-pointer group`}
                    >
                      {formData.modelUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <Box size={20} className="text-blue-600" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">MODEL HAZIR</span>
                          <div className="text-[8px] font-mono opacity-50 truncate max-w-[150px]">
                            {formData.modelUrl.startsWith('data:') ? 'Lokal Dosya' : formData.modelUrl}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Box size={20} className="group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-black uppercase mt-2 tracking-widest">MODEL YÜKLE</span>
                        </>
                      )}
                      <input
                        type="file"
                        ref={modelInputRef}
                        onChange={handleModelSelect}
                        className="hidden"
                        accept=".glb,.gltf"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.modelUrl.startsWith('data:') ? '' : formData.modelUrl}
                      onChange={e => setFormData({ ...formData, modelUrl: e.target.value })}
                      className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-blue-600 outline-none transition-colors font-bold text-[8px] uppercase tracking-widest placeholder:text-gray-300"
                      placeholder="VEYA MODEL URL'Sİ YAPIŞTIRIN"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Video URL (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-orange-600 outline-none transition-colors font-bold text-[10px] uppercase tracking-widest placeholder:text-gray-300"
                    placeholder="ÜRÜN VİDEOSU URL'Sİ (MP4, WEBM)"
                  />
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                    * Video, ürün detay sayfasında gösterilecektir
                  </p>
                </div>
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Hikaye & Detay</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-black/10 dark:border-white/10 p-6 h-40 outline-none focus:border-orange-600 bg-transparent transition-colors font-light text-sm leading-relaxed"
                placeholder="Ürünün ruhunu anlatın..."
              />
            </div>

            <div className="flex justify-end gap-6 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                {isSubmitting ? 'Kaydediliyor...' : "Katalog'a Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isEditing && (
        <div className="bg-white dark:bg-surface-dark p-8 mb-12 border-l-8 border-blue-600 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-8 border-b border-black/5 dark:border-white/5 pb-4">
            <h2 className="text-xl font-black uppercase tracking-widest">Ürün Düzenle</h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingProduct(null);
                setFormData({ name: '', price: '', category: 'Oturma Grubu', description: '', stock: '5', images: [], modelUrl: '', videoUrl: '' });
                setImagePreviews([]);
              }}
              className="text-gray-400 hover:text-red-600 text-sm uppercase tracking-widest font-bold"
            >
              İptal
            </button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Ürün İsmi</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold uppercase tracking-tight text-lg"
                  placeholder="örn: LUNA LOUNGE"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Fiyat (₺)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold text-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Kategori</label>
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
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Stok Miktarı</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border-b-2 border-black/10 dark:border-white/10 bg-transparent py-3 focus:border-blue-600 outline-none transition-colors font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Dosya & Medya (Görseiler)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-black/10 dark:border-white/10 p-4 min-h-[120px] flex flex-wrap gap-4 items-center justify-center text-gray-400 hover:border-blue-600 transition-all cursor-pointer group"
                  >
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative w-20 h-20 border border-black/5">
                          <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-black transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={20} className="group-hover:text-blue-600 transition-colors" />
                        <span className="text-[9px] font-black uppercase mt-2 tracking-widest">GÖRSELLERİ YÜKLE</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">3D Model (.GLB)</label>
                  <div className="flex flex-col gap-3">
                    <div
                      onClick={() => modelInputRef.current?.click()}
                      className={`relative border-2 border-dashed ${formData.modelUrl ? 'border-blue-600/50 bg-blue-50/5' : 'border-black/10 dark:border-white/10'} p-4 min-h-[100px] flex flex-col items-center justify-center text-gray-400 hover:border-blue-600 transition-all cursor-pointer group`}
                    >
                      {formData.modelUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <Box size={20} className="text-blue-600" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">MODEL HAZIR</span>
                          <div className="text-[8px] font-mono opacity-50 truncate max-w-[150px]">
                            {formData.modelUrl.startsWith('data:') ? 'Lokal Dosya' : formData.modelUrl}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Box size={20} className="group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-black uppercase mt-2 tracking-widest">MODEL YÜKLE</span>
                        </>
                      )}
                      <input
                        type="file"
                        ref={modelInputRef}
                        onChange={handleModelSelect}
                        className="hidden"
                        accept=".glb,.gltf"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.modelUrl.startsWith('data:') ? '' : formData.modelUrl}
                      onChange={e => setFormData({ ...formData, modelUrl: e.target.value })}
                      className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-blue-600 outline-none transition-colors font-bold text-[8px] uppercase tracking-widest placeholder:text-gray-300"
                      placeholder="VEYA MODEL URL'Sİ YAPIŞTIRIN"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Video URL (Opsiyonel)</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border-b border-black/10 dark:border-white/10 bg-transparent py-2 focus:border-blue-600 outline-none transition-colors font-bold text-[10px] uppercase tracking-widest placeholder:text-gray-300"
                    placeholder="ÜRÜN VİDEOSU URL'Sİ (MP4, WEBM)"
                  />
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                    * Video, ürün detay sayfasında gösterilecektir
                  </p>
                </div>
              </div>
            </div>

            <div className="relative space-y-2">
              <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest">Hikaye & Detay</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-black/10 dark:border-white/10 p-6 h-40 outline-none focus:border-blue-600 bg-transparent transition-colors font-light text-sm leading-relaxed"
                placeholder="Ürünün ruhunu anlatın..."
              />
            </div>

            <div className="flex justify-end gap-6 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                {isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
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
