import { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Save } from 'lucide-react';
import { materialApi } from '../api';


function MaterialModal({ isOpen, onClose, material, categories = [], onSave }) {

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    standard_price: '',
    unit: 'Pcs',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        category_id: material.category_id || '',
        standard_price: material.standard_price || '',
        unit: material.unit || 'Pcs',
      });
    } else {
      // Defensive check: ensure categories is array and has items
      const safeCategories = Array.isArray(categories) ? categories : [];
      const defaultCategoryId = safeCategories.length > 0 ? safeCategories[0].id : '';
      setFormData({
        name: '',
        category_id: defaultCategoryId,
        standard_price: '',
        unit: 'Pcs',
      });
    }
  }, [material, categories, isOpen]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'standard_price' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (material) {
        await materialApi.update(material.id, formData);
      } else {
        await materialApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Defensive check for categories
  const safeCategories = Array.isArray(categories) ? categories : [];
  const hasCategories = safeCategories.length > 0;

  if (!hasCategories) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md p-6 text-center slide-up-enter">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Tidak Ada Kategori</h2>
          <p className="text-gray-500 mb-6 text-sm">Silakan tambahkan kategori terlebih dahulu sebelum menambah material.</p>
          <button onClick={onClose} className="btn-mobile-primary md:btn-primary w-full md:w-auto">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto slide-up-enter">
        {/* Mobile drag handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 z-10 md:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {material ? 'Edit Material' : 'Tambah Material'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all active:scale-95"
          >
            <X className="h-5 w-5 text-gray-500" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 md:px-6 py-5 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Material</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Masukkan nama material"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Harga Standar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input
                type="number"
                name="standard_price"
                value={formData.standard_price}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Satuan</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
              required
            >
              <option value="Pcs">Pcs (Pieces)</option>
              <option value="Cm">Cm (Centimeter)</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto btn-secondary haptic-touch py-3.5 md:py-2"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full md:w-auto btn-primary haptic-touch py-3.5 md:py-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" />
                  Simpan
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}

export default MaterialModal;
