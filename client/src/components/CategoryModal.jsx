
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { categoryApi } from '../api';

function CategoryModal({ isOpen, onClose, category, onSave }) {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || '' });
    } else {
      setFormData({ name: '' });
    }
  }, [category, isOpen]);

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        await categoryApi.update(category.id, formData);
      } else {
        await categoryApi.create(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Category save error:', err);
      let errorMsg = 'Terjadi kesalahan';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMsg = 'Data tidak valid. Periksa kembali input Anda.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error. Silakan coba lagi nanti.';
      } else if (!navigator.onLine) {
        errorMsg = 'Tidak ada koneksi internet. Periksa koneksi Anda.';
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      setError(errorMsg);
    } finally {

      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
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
            <label className="label">Nama Kategori</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
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

export default CategoryModal;
