import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Search, ArrowRight } from 'lucide-react';
import { productApi } from '../api';
import ScoreCard from '../components/ScoreCard';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    totalHPP: products.reduce((sum, p) => sum + (p.production_cost || 0), 0),
    avgMargin: products.length > 0
      ? products.reduce((sum, p) => sum + (p.gross_profit_per_unit || 0), 0) / products.length
      : 0,
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoring produk dan biaya produksi</p>
        </div>
        <Link
          to="/products/new"
          className="btn-primary flex items-center gap-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ScoreCard
          title="Total Produk"
          value={stats.totalProducts}
          subtitle="Jumlah produk dalam katalog"
          type="count"
        />
        <ScoreCard
          title="Total HPP"
          value={stats.totalHPP}
          subtitle="Akumulasi harga pokok produksi"
          type="hpp"
        />
        <ScoreCard
          title="Rata-rata Laba"
          value={stats.avgMargin}
          subtitle="Laba kotor per unit rata-rata"
          type="profit"
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada produk</h3>
          <p className="text-gray-600 mt-2">Mulai dengan menambahkan produk baru</p>
          <Link
            to="/products/new"
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="card hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">HPP</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.production_cost || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Harga Jual</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(product.estimated_selling_price || 0)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Biaya Material: {formatCurrency(product.total_material_cost || 0)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  (product.gross_profit_per_unit || 0) > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Laba: {formatCurrency(product.gross_profit_per_unit || 0)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
