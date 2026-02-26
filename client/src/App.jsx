import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Bell, User, WifiOff } from 'lucide-react';

import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import MaterialCatalog from './pages/MaterialCatalog';
import CategoryManagement from './pages/CategoryManagement';
import { ToastProvider } from './context/ToastContext';
import { isOnline, onNetworkChange } from './utils/storage';


const pageTitles = {
  '/': 'Dashboard',
  '/materials': 'Katalog Material',
  '/categories': 'Manajemen Kategori',
};


function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const [isOffline, setIsOffline] = useState(!isOnline());
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onNetworkChange((online) => {
      setIsOffline(!online);
    });
    return unsubscribe;
  }, []);



  const getPageTitle = () => {
    if (location.pathname.includes('/edit')) return 'Edit Produk';
    if (location.pathname.includes('/new')) return 'Tambah Produk Baru';
    if (location.pathname.match(/\/products\/[^/]+/)) return 'Detail Produk';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      </div>


      {/* Main Content */}

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>

        {/* Offline Indicator */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-amber-700 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Mode Offline - Data disimpan lokal</span>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm safe-top">

          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Breadcrumb / Page title */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 hidden sm:inline">ReKal</span>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="font-semibold text-gray-800">{getPageTitle()}</span>
          </div>


            {/* Right side */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
            <Route path="/materials" element={<MaterialCatalog />} />
            <Route path="/categories" element={<CategoryManagement />} />
          </Routes>

        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>

  );
}

function App() {
  return (
    <ToastProvider>
      <AppLayout />
    </ToastProvider>
  );
}

export default App;
