import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Package } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(isEdit ? `/products/${id}` : '/')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
          <p className="page-subtitle">{isEdit ? 'Perbarui informasi dan komposisi produk' : 'Isi informasi produk dan komposisi material'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">Informasi Produk</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nama Produk <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Contoh: CLUTA D300 HITAM" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Deskripsi</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input resize-none" rows="3" placeholder="Deskripsi singkat produk (opsional)" />
            </div>
            <div>
              <label className="label">% Overhead <span className="text-red-500">*</span></label>
              <input type="number" name="overhead_percentage" value={formData.overhead_percentage} onChange={handleChange} className="input" min="0" max="99" step="0.1" required />
              <p className="text-xs text-gray-400 mt-1.5">Biaya tidak langsung (listrik, sewa, dll)</p>
            </div>
            <div>
              <label className="label">% Target Margin Profit <span className="text-red-500">*</span></label>
              <input type="number" name="target_margin_percentage" value={formData.target_margin_percentage} onChange={handleChange} className="input" min="0" max="99" step="0.1" required />
              <p className="text-xs text-gray-400 mt-1.5">Keuntungan yang diinginkan</p>
            </div>
          </div>
        </div>

        {/* BoM Editor */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Komposisi Material (BoM)</h2>
            <button type="button" onClick={addBomItem} disabled={materials.length === 0} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <Plus className="h-4 w-4" />
              Tambah Material
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600">Belum ada material tersedia</p>
              <p className="text-xs text-gray-400 mt-1">Tambahkan material di halaman Katalog Material terlebih dahulu</p>
            </div>
          ) : bomItems.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Klik <span className="font-semibold text-primary-600">"Tambah Material"</span> untuk menambahkan komposisi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bomItems.map((item, index) => (
                <div key={index} className="flex flex-wrap gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
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
              ))}
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-primary-800 mb-4">Estimasi Biaya dan Harga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Biaya Material', value: totals.totalMaterialCost, color: 'text-primary-900' },
              { label: 'HPP (Harga Pokok)', value: totals.productionCost, color: 'text-primary-900' },
              { label: 'Estimasi Harga Jual', value: totals.sellingPrice, color: 'text-emerald-700' },
              { label: 'Laba Kotor / Unit', value: totals.grossProfit, color: totals.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-primary-100">
                <p className="text-xs text-primary-600 font-medium">{item.label}</p>
                <p className={`text-lg font-bold mt-1 ${item.color}`}>{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate(isEdit ? `/products/${id}` : '/')} className="btn-secondary" disabled={saving}>
            Batal
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving || bomItems.length === 0}>
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Produk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
