import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Trash2, Package } from 'lucide-react';
import { productApi } from '../api';
import ScoreCard from '../components/ScoreCard';
import ConfirmDialog from '../components/ConfirmDialog';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productApi.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await productApi.delete(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeleteError(error.response?.data?.error || 'Gagal menghapus produk');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteDialog(false);
    setDeleteError(null);
  };

  const handleDuplicate = async () => {
    setDuplicateError(null);
    try {
      const response = await productApi.duplicate(id);
      navigate(`/products/${response.data.id}`);
    } catch (error) {
      console.error('Error duplicating product:', error);
      setDuplicateError(error.response?.data?.error || 'Gagal menduplikasi produk');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Produk tidak ditemukan</h2>
        <Link to="/" className="btn-primary inline-block mt-4">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 mt-1">{product.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {duplicateError && (
            <span className="text-sm text-red-600 self-center">{duplicateError}</span>
          )}
          <button
            onClick={handleDuplicate}
            className="btn-secondary flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Salin</span>
          </button>
          <Link
            to={`/products/${id}/edit`}
            className="btn-primary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            onClick={() => setDeleteDialog(true)}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ScoreCard
          title="Total Biaya Material"
          value={product.total_material_cost}
          subtitle="Akumulasi dari BoM"
          type="bom"
        />
        <ScoreCard
          title="HPP (Harga Pokok)"
          value={product.production_cost}
          subtitle={`Overhead: ${product.overhead_percentage}%`}
          type="hpp"
        />
        <ScoreCard
          title="Estimasi Harga Jual"
          value={product.estimated_selling_price}
          subtitle={`Margin: ${product.target_margin_percentage}%`}
          type="selling"
        />
        <ScoreCard
          title="Laba Kotor / Unit"
          value={product.gross_profit_per_unit}
          subtitle="Harga Jual - HPP"
          type="profit"
        />
      </div>

      {/* BoM List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Komposisi Material (BoM)</h2>
        {product.bill_of_materials?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada material</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Material</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Harga</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {product.bill_of_materials?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.material_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.quantity} {item.material_unit}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-sm text-gray-700 text-right">
                    Total Biaya Material:
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatCurrency(product.total_material_cost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`}
        loading={deleting}
        error={deleteError}
      />
    </div>
  );
}

export default ProductDetail;
