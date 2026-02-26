import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, Search, RefreshCw, WifiOff } from 'lucide-react';
import { materialApi, categoryApi } from '../api';
import { useOfflineMaterials } from '../hooks/useOfflineData';
import MaterialModal from '../components/MaterialModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

function TableSkeleton() {
  return (
    <div className="table-container">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 grid grid-cols-5 gap-4">
        {['w-32', 'w-24', 'w-24', 'w-16', 'w-16'].map((w, i) => (
          <div key={i} className={`skeleton h-3 ${w} rounded`} />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`px-5 py-4 grid grid-cols-5 gap-4 border-b border-gray-50 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
          <div className="flex gap-2 justify-center">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MaterialCatalog() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const { addToast } = useToast();

  // Use offline-aware data fetching
  const { 
    data: materials, 
    loading, 
    error, 
    isOffline, 
    refresh,
    fromCache 
  } = useOfflineMaterials(materialApi);

  // Fetch categories separately (lighter data)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Show toast when data is from cache
  useEffect(() => {
    if (fromCache && !loading) {
      addToast('Menampilkan data material tersimpan', 'info');
    }
  }, [fromCache, loading, addToast]);

  const handleAdd = () => {
    setSelectedMaterial(null);
    setModalOpen(true);
  };

  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setModalOpen(true);
  };

  const handleSave = () => {
    refresh();
    addToast(
      selectedMaterial ? 'Material berhasil diperbarui' : 'Material berhasil ditambahkan',
      'success'
    );
  };

  const handleDeleteClick = (material) => {
    setSelectedMaterial(material);
    setDeleteError(null);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await materialApi.delete(selectedMaterial.id);
      refresh();
      setDeleteDialog(false);
      setSelectedMaterial(null);
      addToast('Material berhasil dihapus', 'success');
    } catch (error) {
      setDeleteError(error.response?.data?.error || 'Gagal menghapus material');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog(false);
    setDeleteError(null);
    setSelectedMaterial(null);
  };

  const handleRefresh = () => {
    refresh();
    addToast('Memperbarui data material...', 'info');
  };

  const filteredMaterials = materials?.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Katalog Material</h1>
          <p className="page-subtitle">Kelola daftar bahan baku dan harga standar</p>
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
            <span className="hidden sm:inline">Tambah Material</span>
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
          placeholder="Cari material atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {searchTerm ? 'Material tidak ditemukan' : 'Belum ada material'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {searchTerm
              ? `Tidak ada material yang cocok dengan "${searchTerm}"`
              : 'Tambahkan material untuk digunakan dalam produk'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Material
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
                  <th className="table-th">Nama Material</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th-right">Harga Standar</th>
                  <th className="table-th-center">Satuan</th>
                  <th className="table-th-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material, index) => (
                  <tr key={material.id} className={`table-row ${index % 2 !== 0 ? 'table-row-even' : ''}`}>
                    <td className="table-td font-semibold text-gray-900">{material.name}</td>
                    <td className="table-td">
                      <span className="badge-blue">{material.category_name}</span>
                    </td>
                    <td className="table-td-right font-semibold text-gray-800">
                      {formatCurrency(material.standard_price)}
                    </td>
                    <td className="table-td text-center text-gray-500">{material.unit}</td>
                    <td className="table-td">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit material"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(material)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus material"
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
                Menampilkan <span className="font-semibold text-gray-600">{filteredMaterials.length}</span> material
              </p>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{material.name}</h3>
                    <span className="badge-blue mt-1 inline-block">{material.category_name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(material)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteClick(material)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Harga: <span className="font-semibold text-gray-700">{formatCurrency(material.standard_price)}</span></span>
                  <span>/{material.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <MaterialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        material={selectedMaterial}
        categories={categories}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
        title="Hapus Material"
        message={`Apakah Anda yakin ingin menghapus material "${selectedMaterial?.name}"? Material yang sudah digunakan dalam produk tidak dapat dihapus.`}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}

export default MaterialCatalog;
