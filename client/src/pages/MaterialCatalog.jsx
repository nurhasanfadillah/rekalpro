import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, Search } from 'lucide-react';
import { materialApi, categoryApi } from '../api';
import MaterialModal from '../components/MaterialModal';
import ConfirmDialog from '../components/ConfirmDialog';

function MaterialCatalog() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, categoriesRes] = await Promise.all([
        materialApi.getAll(),
        categoryApi.getAll(),
      ]);
      setMaterials(materialsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedMaterial(null);
    setModalOpen(true);
  };

  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setModalOpen(true);
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
      fetchData();
      setDeleteDialog(false);
      setSelectedMaterial(null);
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

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Material</h1>
          <p className="text-gray-600 mt-1">Kelola daftar bahan baku dan harga standar</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Material
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada material</h3>
          <p className="text-gray-600 mt-2">Tambahkan material untuk digunakan dalam produk</p>
          <button
            onClick={handleAdd}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <Plus className="h-4 w-4" />
            Tambah Material
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nama Material</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Harga Standar</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Satuan</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {material.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(material.standard_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{material.unit}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(material)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{material.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {material.category_name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(material)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Harga: {formatCurrency(material.standard_price)}</span>
                  <span className="text-gray-600">/{material.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Modal */}
      <MaterialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        material={selectedMaterial}
        categories={categories}
        onSave={fetchData}
      />

      {/* Delete Confirmation */}
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
