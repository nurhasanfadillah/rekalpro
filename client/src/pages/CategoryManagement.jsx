import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Grid, Search, Package, RefreshCw, WifiOff } from 'lucide-react';
import { categoryApi } from '../api';
import { useOfflineCategories } from '../hooks/useOfflineData';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

function TableSkeleton() {
  return (
    <div className="table-container">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-4">
        {['w-32', 'w-28', 'w-16'].map((w, i) => (
          <div key={i} className={`skeleton h-3 ${w} rounded`} />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`px-5 py-4 grid grid-cols-3 gap-4 border-b border-gray-50 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="flex gap-2 justify-center">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const { addToast } = useToast();

  // Use offline-aware data fetching
  const { 
    data: categories, 
    loading, 
    error, 
    isOffline, 
    refresh,
    fromCache 
  } = useOfflineCategories(categoryApi);

  // Show toast when data is from cache
  useEffect(() => {
    if (fromCache && !loading) {
      addToast('Menampilkan data kategori tersimpan', 'info');
    }
  }, [fromCache, loading, addToast]);

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleSave = () => {
    refresh();
    addToast(
      selectedCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan',
      'success'
    );
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteError(null);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await categoryApi.delete(selectedCategory.id);
      refresh();
      setDeleteDialog(false);
      setSelectedCategory(null);
      addToast('Kategori berhasil dihapus', 'success');
    } catch (error) {
      setDeleteError(error.response?.data?.error || 'Gagal menghapus kategori');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog(false);
    setDeleteError(null);
    setSelectedCategory(null);
  };

  const handleRefresh = () => {
    refresh();
    addToast('Memperbarui data kategori...', 'info');
  };

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Kategori</h1>
          <p className="page-subtitle">Kelompokkan material berdasarkan jenisnya</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh button - visible on mobile */}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Kategori</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Offline indicator for cached data */}
      {fromCache && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2 text-blue-700 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>Data dari penyimpanan lokal</span>
          <button 
            onClick={handleRefresh}
            className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Search */}
      <div className="search-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Grid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {searchTerm ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {searchTerm
              ? `Tidak ada kategori yang cocok dengan "${searchTerm}"`
              : 'Tambahkan kategori untuk mengelompokkan material'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Nama Kategori</th>
                  <th className="table-th-center">Jumlah Material</th>
                  <th className="table-th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.id} className={`table-row ${index % 2 !== 0 ? 'table-row-even' : ''}`}>
                    <td className="table-td font-semibold text-gray-900">{category.name}</td>
                    <td className="table-td text-center">
                      <span className={`badge ${category.material_count > 0 ? 'badge-blue' : 'badge-gray'}`}>
                        <Package className="h-3 w-3 mr-1" />
                        {category.material_count} material
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit kategori"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.material_count > 0}
                          className={`p-2 rounded-xl transition-colors ${
                            category.material_count > 0
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={category.material_count > 0 ? 'Kategori masih memiliki material' : 'Hapus kategori'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Menampilkan <span className="font-semibold text-gray-600">{filteredCategories.length}</span> kategori
              </p>
            </div>
          </div>

          {/* Mobile List */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {filteredCategories.map((category) => (
              <div key={category.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                    <span className={`badge mt-1 inline-flex items-center gap-1 ${category.material_count > 0 ? 'badge-blue' : 'badge-gray'}`}>
                      <Package className="h-3 w-3" />
                      {category.material_count} material
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      disabled={category.material_count > 0}
                      className={`p-2 rounded-xl ${category.material_count > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"? Kategori yang masih memiliki material tidak dapat dihapus.`}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}

export default CategoryManagement;
