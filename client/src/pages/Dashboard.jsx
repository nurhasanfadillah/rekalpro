import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Search, RefreshCw, WifiOff } from 'lucide-react';
import { productApi } from '../api';
import { useOfflineProducts } from '../hooks/useOfflineData';
import ScoreCard from '../components/ScoreCard';
import ProductTable from '../components/ProductTable';
import { useToast } from '../context/ToastContext';

// Skeleton loader for stat cards
function ScoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-gray-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

// Skeleton loader for table rows
function TableSkeleton() {
  return (
    <div className="table-container">
      <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 grid grid-cols-7 gap-4">
        {['w-32', 'w-20', 'w-20', 'w-24', 'w-16', 'w-20', 'w-16'].map((w, i) => (
          <div key={i} className={`skeleton h-3 ${w} rounded`} />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`px-5 py-4 grid grid-cols-7 gap-4 border-b border-gray-50 ${i % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-36 rounded" />
            <div className="skeleton h-2.5 w-24 rounded" />
          </div>
          <div className="skeleton h-3.5 w-20 rounded" />
          <div className="skeleton h-3.5 w-20 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-3.5 w-16 rounded" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  
  // Use offline-aware data fetching
  const { 
    data: products, 
    loading, 
    error, 
    isOffline, 
    refresh,
    fromCache 
  } = useOfflineProducts(productApi);

  // Show toast when data is from cache
  useEffect(() => {
    if (fromCache && !loading) {
      addToast('Menampilkan data tersimpan', 'info');
    }
  }, [fromCache, loading, addToast]);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalProducts: products?.length || 0,
    totalHPP: products?.reduce((sum, p) => sum + (p.production_cost || 0), 0) || 0,
    avgMargin: products?.length > 0
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

  const handleRefresh = () => {
    refresh();
    addToast('Memperbarui data...', 'info');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Monitoring produk dan biaya produksi</p>
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
          <Link to="/products/new" className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Produk Baru</span>
            <span className="sm:hidden">Tambah</span>
          </Link>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            <ScoreCardSkeleton />
            <ScoreCardSkeleton />
            <ScoreCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Cari produk berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
      </div>

      {/* Products List */}
      {loading ? (
        <TableSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {searchTerm
              ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
              : 'Mulai dengan menambahkan produk baru ke katalog'}
          </p>
          {!searchTerm && (
            <Link to="/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <ProductTable products={filteredProducts} formatCurrency={formatCurrency} />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {filteredProducts.map((product, index) => {
              const profit = product.gross_profit_per_unit || 0;
              return (
                <Link
                  key={product.id || `product-${index}`}
                  to={`/products/${product.id}`}
                  className="card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                      )}
                    </div>
                    <span className={`badge ${profit > 0 ? 'badge-green' : 'badge-red'}`}>
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">HPP</p>
                      <p className="font-semibold text-gray-700">{formatCurrency(product.production_cost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Harga Jual</p>
                      <p className="font-semibold text-emerald-600">{formatCurrency(product.estimated_selling_price || 0)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
