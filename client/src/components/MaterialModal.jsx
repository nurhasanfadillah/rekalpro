import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Tidak Ada Kategori</h2>
          <p className="text-gray-500 mb-4">Silakan tambahkan kategori terlebih dahulu sebelum menambah material.</p>
          <button onClick={onClose} className="btn-primary">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {material ? 'Edit Material' : 'Tambah Material'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="label">Nama Material</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Kategori</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Harga Standar</label>
            <input
              type="number"
              name="standard_price"
              value={formData.standard_price}
              onChange={handleChange}
              className="input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="label">Satuan</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="Pcs">Pcs (Pieces)</option>
              <option value="Cm">Cm (Centimeter)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaterialModal;
