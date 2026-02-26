
import { useState, useEffect } from 'react';
import { X, AlertCircle, Save, Folder } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto slide-up-enter">
        {/* Mobile drag handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 z-10 md:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
        </div>
        
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <Folder className="h-4 w-4 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {category ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
          </div>
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
            <label className="text-sm font-medium text-gray-700">Nama Kategori</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Masukkan nama kategori"
              required
            />
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

export default CategoryModal;
