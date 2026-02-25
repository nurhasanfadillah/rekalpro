import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Grid, Search, Package } from 'lucide-react';
import { categoryApi } from '../api';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
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
      fetchCategories();
      setDeleteDialog(false);
      setSelectedCategory(null);
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
          <p className="text-gray-600 mt-1">Kelompokkan material berdasarkan jenisnya</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada kategori</h3>
          <p className="text-gray-600 mt-2">Tambahkan kategori untuk mengelompokkan material</p>
          <button
            onClick={handleAdd}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nama Kategori</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Jumlah Material</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.material_count > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Package className="h-3 w-3 mr-1" />
                        {category.material_count} material
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.material_count > 0}
                          className={`p-2 rounded-lg transition-colors ${
                            category.material_count > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
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
          </div>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <div key={category.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      category.material_count > 0 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Package className="h-3 w-3 mr-1" />
                      {category.material_count} material
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      disabled={category.material_count > 0}
                      className={`p-2 rounded-lg ${
                        category.material_count > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSave={fetchCategories}
      />

      {/* Delete Confirmation */}
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
