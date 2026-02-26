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
          {/* Refresh button - visible on mobile with enhanced styling */}
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="md:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/products/new" className="btn-primary flex items-center gap-2 haptic-touch">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Produk Baru</span>
            <span className="sm:hidden">Tambah</span>
          </Link>
        </div>

      </div>

      {/* Offline indicator for cached data - Enhanced */}
      {fromCache && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-blue-700 text-sm shadow-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 flex-shrink-0">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-900">Data Tersimpan</p>
            <p className="text-blue-600/80 text-xs">Menampilkan data dari penyimpanan lokal</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 active:bg-blue-100 font-medium text-xs transition-all active:scale-95"
          >
            Refresh
          </button>
        </div>
      )}


      {/* Stats Cards - Enhanced Mobile Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">

        {loading ? (
          <>
            <ScoreCardSkeleton />
            <ScoreCardSkeleton />
            <ScoreCardSkeleton />
          </>
        ) : (
          <>
            <div className="col-span-2 md:col-span-1">
              <ScoreCard
                title="Total Produk"
                value={stats.totalProducts}
                subtitle="Jumlah produk"
                type="count"
              />
            </div>
            <ScoreCard
              title="Total HPP"
              value={stats.totalHPP}
              subtitle="Akumulasi HPP"
              type="hpp"
            />
            <ScoreCard
              title="Rata-rata Laba"
              value={stats.avgMargin}
              subtitle="Laba per unit"
              type="profit"
            />
          </>
        )}
      </div>

      {/* Search - Enhanced Mobile */}
      <div className="search-wrapper">
        <Search className="search-icon h-5 w-5" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search md:input-search text-base md:text-sm h-12 md:h-auto"
        />
      </div>


      {/* Products List */}
      {loading ? (
        <TableSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state-mobile bg-white rounded-2xl border border-gray-100 shadow-sm mx-4 md:mx-0">
          <div className="empty-state-icon-mobile">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {searchTerm ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            {searchTerm
              ? `Tidak ada produk yang cocok dengan "${searchTerm}"`
              : 'Mulai dengan menambahkan produk baru ke katalog'}
          </p>
          {!searchTerm && (
            <Link to="/products/new" className="btn-mobile-primary md:btn-primary">
              <Plus className="h-5 w-5" />
              Tambah Produk Baru
            </Link>
          )}
        </div>

      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <ProductTable products={filteredProducts} formatCurrency={formatCurrency} />
          </div>

          {/* Mobile Card View - Enhanced Native Style */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {filteredProducts.map((product, index) => {
              const profit = product.gross_profit_per_unit || 0;
              const marginPct = product.estimated_selling_price > 0 
                ? ((profit / product.estimated_selling_price) * 100).toFixed(0)
                : 0;
              
              return (
                <Link
                  key={product.id || `product-${index}`}
                  to={`/products/${product.id}`}
                  className="card-mobile group"
                >
                  <div className="p-4">
                    {/* Header with profit badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight group-active:text-primary-700 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                        )}
                      </div>
                      <div className={`flex-shrink-0 badge-mobile ${
                        profit > 0 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {marginPct}%
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="divider-mobile" />
                    
                    {/* Financial details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-mobile-label">HPP</p>
                        <p className="text-sm font-bold text-gray-800">
                          {formatCurrency(product.production_cost || 0)}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-mobile-label">Harga Jual</p>
                        <p className="text-sm font-bold text-emerald-600">
                          {formatCurrency(product.estimated_selling_price || 0)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Profit bar indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            profit > 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(marginPct), 100)}%` 
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        profit > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Touch ripple effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
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
