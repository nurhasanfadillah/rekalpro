import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Package } from 'lucide-react';
import { productApi, materialApi } from '../api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

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
    if (isEdit) {
      fetchProduct();
    }
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
        navigate(`/products/${id}`);
      } else {
        const response = await productApi.create(payload);
        navigate(`/products/${response.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan saat menyimpan');
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
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(isEdit ? `/products/${id}` : '/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Produk</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nama Produk *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="label">% Overhead *</label>
              <input
                type="number"
                name="overhead_percentage"
                value={formData.overhead_percentage}
                onChange={handleChange}
                className="input"
                min="0"
                max="99"
                step="0.1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Biaya tidak langsung (listrik, sewa, dll)</p>
            </div>
            <div>
              <label className="label">% Target Margin Profit *</label>
              <input
                type="number"
                name="target_margin_percentage"
                value={formData.target_margin_percentage}
                onChange={handleChange}
                className="input"
                min="0"
                max="99"
                step="0.1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Keuntungan yang diinginkan</p>
            </div>
          </div>
        </div>

        {/* BoM Editor */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Komposisi Material (BoM)</h2>
            <button
              type="button"
              onClick={addBomItem}
              disabled={materials.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Material
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada material tersedia</p>
              <p className="text-sm text-gray-500 mt-1">Tambahkan material di halaman Katalog Material terlebih dahulu</p>
            </div>
          ) : bomItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Klik "Tambah Material" untuk menambahkan komposisi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bomItems.map((item, index) => (
                <div key={index} className="flex flex-wrap gap-3 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-[200px]">
                    <label className="label text-xs">Material</label>
                    <select
                      value={item.material_id}
                      onChange={(e) => updateBomItem(index, 'material_id', e.target.value)}
                      className="input text-sm"
                      required
                    >
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.category_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="label text-xs">Harga</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateBomItem(index, 'price', e.target.value)}
                      className="input text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="label text-xs">Qty ({item.unit})</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateBomItem(index, 'quantity', e.target.value)}
                      className="input text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="label text-xs">Subtotal</label>
                    <p className="text-sm font-medium py-2">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBomItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Summary */}
        <div className="card bg-primary-50 border-primary-200">
          <h2 className="text-lg font-semibold mb-4 text-primary-900">Estimasi Biaya & Harga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-primary-700">Total Biaya Material</p>
              <p className="text-xl font-bold text-primary-900">{formatCurrency(totals.totalMaterialCost)}</p>
            </div>
            <div>
              <p className="text-sm text-primary-700">HPP (Harga Pokok)</p>
              <p className="text-xl font-bold text-primary-900">{formatCurrency(totals.productionCost)}</p>
            </div>
            <div>
              <p className="text-sm text-primary-700">Estimasi Harga Jual</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(totals.sellingPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-primary-700">Laba Kotor / Unit</p>
              <p className={`text-xl font-bold ${totals.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(totals.grossProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/products/${id}` : '/')}
            className="btn-secondary"
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving || bomItems.length === 0}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
