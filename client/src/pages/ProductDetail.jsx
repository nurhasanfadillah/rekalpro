import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Trash2, Package, PieChart } from 'lucide-react';
import { productApi } from '../api';
import ScoreCard from '../components/ScoreCard';
import ConfirmDialog from '../components/ConfirmDialog';
import DonutChart from '../components/DonutChart';
import { useToast } from '../context/ToastContext';

function SkeletonDetail() {
  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-6">
        <div className="skeleton w-9 h-9 rounded-xl" />
        <div className="skeleton h-7 w-48 rounded" />
        <div className="ml-auto flex gap-2">
          <div className="skeleton h-9 w-20 rounded-xl" />
          <div className="skeleton h-9 w-20 rounded-xl" />
          <div className="skeleton h-9 w-20 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 p-5">
            <div className="space-y-2">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-7 w-32 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton h-5 w-48 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-3 border-b border-gray-50 flex gap-4">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-16 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productApi.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      addToast('Gagal memuat data produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await productApi.delete(id);
      addToast('Produk berhasil dihapus', 'success');
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
    setDuplicating(true);
    try {
      const response = await productApi.duplicate(id);
      addToast('Produk berhasil disalin', 'success');
      navigate(`/products/${response.data.id}`);
    } catch (error) {
      console.error('Error duplicating product:', error);
      addToast(error.response?.data?.error || 'Gagal menduplikasi produk', 'error');
    } finally {
      setDuplicating(false);
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

  if (loading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="page-container">
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Produk tidak ditemukan</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">Produk yang Anda cari tidak tersedia</p>
          <Link to="/" className="btn-primary inline-block">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  // Build donut chart data from BoM grouped by category
  const categoryMap = {};
  product.bill_of_materials?.forEach((item) => {
    const cat = item.category_name || 'Lainnya';
    categoryMap[cat] = (categoryMap[cat] || 0) + (item.subtotal || 0);
  });
  const donutData = Object.entries(categoryMap).map(([label, value]) => ({ label, value }));

  // Profitability indicator
  const marginPct = product.estimated_selling_price > 0
    ? ((product.gross_profit_per_unit / product.estimated_selling_price) * 100).toFixed(1)
    : 0;
  const profitabilityColor =
    product.gross_profit_per_unit <= 0 ? 'text-red-600 bg-red-50 border-red-200'
    : marginPct < 10 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : marginPct >= 25 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : 'text-blue-600 bg-blue-50 border-blue-200';
  const profitabilityLabel =
    product.gross_profit_per_unit <= 0 ? 'Merugi'
    : marginPct < 10 ? 'Margin Rendah'
    : marginPct >= 25 ? 'Profitabilitas Tinggi'
    : 'Margin Normal';

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 mt-0.5"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <span className={`badge border text-xs font-semibold px-2.5 py-1 rounded-full ${profitabilityColor}`}>
              {profitabilityLabel} {marginPct}%
            </span>
          </div>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">{duplicating ? 'Menyalin...' : 'Salin'}</span>
          </button>
          <Link
            to={`/products/${id}/edit`}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Ubah</span>
          </Link>
          <button
            onClick={() => setDeleteDialog(true)}
            className="btn-danger flex items-center gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <ScoreCard title="Total Biaya Material" value={product.total_material_cost} subtitle="Akumulasi dari BoM" type="bom" />
        <ScoreCard title="HPP (Harga Pokok)" value={product.production_cost} subtitle={`Overhead: ${product.overhead_percentage}%`} type="hpp" />
        <ScoreCard title="Estimasi Harga Jual" value={product.estimated_selling_price} subtitle={`Margin: ${product.target_margin_percentage}%`} type="selling" />
        <ScoreCard title="Laba Kotor / Unit" value={product.gross_profit_per_unit} subtitle="Harga Jual - HPP" type="profit" />
      </div>

      {/* Chart + BoM in 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        {donutData.length > 0 && (
          <div className="card lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-800">Breakdown Biaya Material</h2>
            </div>
            <DonutChart data={donutData} size={160} thickness={32} />
          </div>
        )}

        {/* BoM Table */}
        <div className={`card ${donutData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Komposisi Material (BoM)</h2>
          {product.bill_of_materials?.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Tidak ada material dalam BoM</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="pb-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {product.bill_of_materials?.map((item, index) => (
                    <tr key={index} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 font-medium text-gray-800">{item.material_name}</td>
                      <td className="py-3">
                        <span className="badge-blue">{item.category_name}</span>
                      </td>
                      <td className="py-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right text-gray-600">{item.quantity} {item.material_unit}</td>
                      <td className="py-3 text-right font-semibold text-gray-800">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan="4" className="pt-3 text-sm font-semibold text-gray-700 text-right">
                      Total Biaya Material:
                    </td>
                    <td className="pt-3 text-right font-bold text-gray-900">
                      {formatCurrency(product.total_material_cost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
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
