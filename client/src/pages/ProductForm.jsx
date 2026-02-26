import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Package, Layers, Calculator, AlertCircle } from 'lucide-react';

import { productApi, materialApi } from '../api';
import { useToast } from '../context/ToastContext';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    overhead_percentage: 20,
    target_margin_percentage: 30,
  });

  const [bomItems, setBomItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterials();
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchMaterials = async () => {
    try {
      const response = await materialApi.getAll();
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productApi.getById(id);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description || '',
        image_url: product.image_url || '',
        overhead_percentage: product.overhead_percentage,
        target_margin_percentage: product.target_margin_percentage,
      });
      setBomItems(product.bill_of_materials?.map(item => ({
        material_id: item.material_id,
        material_name: item.material_name,
        price: item.price,
        quantity: item.quantity,
        unit: item.material_unit,
      })) || []);
    } catch (error) {
      setError('Gagal memuat data produk');
      addToast('Gagal memuat data produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('percentage') ? parseFloat(value) || 0 : value,
    }));
  };

  const addBomItem = () => {
    if (materials.length === 0) return;
    const firstMaterial = materials[0];
    setBomItems(prev => [...prev, {
      material_id: firstMaterial.id,
      material_name: firstMaterial.name,
      price: firstMaterial.standard_price,
      quantity: 1,
      unit: firstMaterial.unit,
    }]);
  };

  const updateBomItem = (index, field, value) => {
    setBomItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      if (field === 'material_id') {
        const material = materials.find(m => m.id === value);
        return {
          ...item,
          material_id: value,
          material_name: material?.name || '',
          price: material?.standard_price || 0,
          unit: material?.unit || 'Pcs',
        };
      }
      return { ...item, [field]: field === 'price' || field === 'quantity' ? parseFloat(value) || 0 : value };
    }));
  };

  const removeBomItem = (index) => {
    setBomItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalMaterialCost = bomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const overheadMultiplier = 1 / (1 - formData.overhead_percentage / 100);
    const productionCost = totalMaterialCost * overheadMultiplier;
    const marginMultiplier = 1 / (1 - formData.target_margin_percentage / 100);
    const sellingPrice = productionCost * marginMultiplier;
    const grossProfit = sellingPrice - productionCost;
    return {
      totalMaterialCost: Math.round(totalMaterialCost),
      productionCost: Math.round(productionCost),
      sellingPrice: Math.round(sellingPrice),
      grossProfit: Math.round(grossProfit),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bomItems.length === 0) {
      setError('Minimal satu material diperlukan dalam BoM');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...formData,
      bill_of_materials: bomItems.map(item => ({
        material_id: item.material_id,
        price: item.price,
        quantity: item.quantity,
      })),
    };
    try {
      if (isEdit) {
        await productApi.update(id, payload);
        addToast('Produk berhasil diperbarui', 'success');
        navigate(`/products/${id}`);
      } else {
        const response = await productApi.create(payload);
        addToast('Produk berhasil ditambahkan', 'success');
        navigate(`/products/${response.data.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Terjadi kesalahan saat menyimpan';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="skeleton h-7 w-48 rounded" />
        </div>
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header - Enhanced Mobile */}
      <div className="flex items-start gap-3 mb-6">
        <button
          onClick={() => navigate(isEdit ? `/products/${id}` : '/')}
          className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all flex-shrink-0 active:scale-95 mt-0.5"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? 'Perbarui informasi dan komposisi produk' : 'Isi informasi produk dan komposisi material'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-6 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <span className="flex-1">{error}</span>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info - Enhanced Mobile */}
        <div className="card-mobile-elevated md:card p-4 md:p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            Informasi Produk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama Produk <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Contoh: CLUTA D300 HITAM" 
                required 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" 
                rows="3" 
                placeholder="Deskripsi singkat produk (opsional)" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Overhead <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="overhead_percentage" 
                value={formData.overhead_percentage} 
                onChange={handleChange} 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                min="0" 
                max="99" 
                step="0.1" 
                required 
              />
              <p className="text-xs text-gray-400 mt-1.5">Biaya tidak langsung (listrik, sewa, dll)</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">% Target Margin <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="target_margin_percentage" 
                value={formData.target_margin_percentage} 
                onChange={handleChange} 
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                min="0" 
                max="99" 
                step="0.1" 
                required 
              />
              <p className="text-xs text-gray-400 mt-1.5">Keuntungan yang diinginkan</p>
            </div>
          </div>
        </div>


        {/* BoM Editor - Enhanced Mobile */}
        <div className="card-mobile-elevated md:card p-4 md:p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              Komposisi Material (BoM)
            </h2>
            <button 
              type="button" 
              onClick={addBomItem} 
              disabled={materials.length === 0} 
              className="btn-primary flex items-center gap-2 text-sm haptic-touch disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Material</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="empty-state-mobile py-8 bg-gray-50 rounded-xl">
              <div className="empty-state-icon-mobile w-16 h-16">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Belum ada material tersedia</p>
              <p className="text-xs text-gray-400">Tambahkan material di halaman Katalog Material terlebih dahulu</p>
            </div>
          ) : bomItems.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Klik <span className="font-semibold text-primary-600">"Tambah"</span> untuk menambahkan komposisi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bomItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  {/* Mobile Layout */}
                  <div className="md:hidden p-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">Material</label>
                      <select 
                        value={item.material_id} 
                        onChange={(e) => updateBomItem(index, 'material_id', e.target.value)} 
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Harga (Rp)</label>
                        <input 
                          type="number" 
                          value={item.price} 
                          onChange={(e) => updateBomItem(index, 'price', e.target.value)} 
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          min="0" 
                          step="0.01" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Qty ({item.unit})</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateBomItem(index, 'quantity', e.target.value)} 
                          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          min="0" 
                          step="0.01" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                      <button 
                        type="button" 
                        onClick={() => removeBomItem(index)} 
                        className="p-2 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden md:flex flex-wrap gap-3 items-end p-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="label text-xs">Material</label>
                      <select value={item.material_id} onChange={(e) => updateBomItem(index, 'material_id', e.target.value)} className="input text-sm" required>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="label text-xs">Harga (Rp)</label>
                      <input type="number" value={item.price} onChange={(e) => updateBomItem(index, 'price', e.target.value)} className="input text-sm" min="0" step="0.01" required />
                    </div>
                    <div className="w-28">
                      <label className="label text-xs">Qty ({item.unit})</label>
                      <input type="number" value={item.quantity} onChange={(e) => updateBomItem(index, 'quantity', e.target.value)} className="input text-sm" min="0" step="0.01" required />
                    </div>
                    <div className="w-32">
                      <label className="label text-xs">Subtotal</label>
                      <p className="text-sm font-semibold text-gray-800 py-2.5">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <button type="button" onClick={() => removeBomItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mb-0.5">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Cost Summary - Enhanced Mobile */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-2xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Estimasi Biaya dan Harga
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: 'Biaya Material', value: totals.totalMaterialCost, color: 'text-primary-900' },
              { label: 'HPP', value: totals.productionCost, color: 'text-primary-900' },
              { label: 'Harga Jual', value: totals.sellingPrice, color: 'text-emerald-700' },
              { label: 'Laba/Unit', value: totals.grossProfit, color: totals.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 md:p-4 border border-primary-100 shadow-sm">
                <p className="text-xs text-primary-600 font-medium mb-1">{item.label}</p>
                <p className={`text-base md:text-lg font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions - Enhanced Mobile */}
        <div className="flex flex-col md:flex-row justify-end gap-3 pb-4 pt-2">
          <button 
            type="button" 
            onClick={() => navigate(isEdit ? `/products/${id}` : '/')} 
            className="w-full md:w-auto btn-secondary haptic-touch py-3.5 md:py-2 order-2 md:order-1" 
            disabled={saving}
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="w-full md:w-auto btn-primary flex items-center justify-center gap-2 haptic-touch py-3.5 md:py-2 order-1 md:order-2" 
            disabled={saving || bomItems.length === 0}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Simpan Produk
              </span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default ProductForm;
