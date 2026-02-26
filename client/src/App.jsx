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

        {/* Offline Indicator - Enhanced */}
        {isOffline && (
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-b border-amber-200/60 px-4 py-2.5 flex items-center justify-center gap-2 text-amber-700 text-sm animate-pulse-soft">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100">
              <WifiOff className="h-3 w-3" />
            </div>
            <span className="font-medium">Mode Offline</span>
            <span className="text-amber-600/70 hidden sm:inline">- Data disimpan lokal</span>
          </div>
        )}


        {/* Top Header - Enhanced for Mobile */}
        <header className="sticky top-0 z-30 safe-top">
          {/* Mobile: Glassmorphism effect, Desktop: Standard */}
          <div className="bg-white/95 md:bg-white backdrop-blur-xl md:backdrop-blur-none border-b border-gray-100/80 shadow-sm md:shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 h-14 md:h-14">
              {/* Breadcrumb / Page title */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 hidden sm:inline">ReKal</span>
                <span className="text-gray-300 hidden sm:inline">/</span>
                <span className="font-semibold text-gray-800 text-base md:text-sm">{getPageTitle()}</span>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-1.5 md:gap-2">
                <button className="p-2.5 md:p-2 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-all relative active:scale-95">
                  <Bell className="h-5 w-5" strokeWidth={2} />
                  <span className="absolute top-2 right-2.5 md:top-1.5 md:right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white" />
                </button>
                <div className="flex items-center gap-2 pl-2 md:border-l md:border-gray-100">
                  <div className="w-9 h-9 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 md:h-4 md:w-4 text-primary-700" strokeWidth={2} />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>


        {/* Page Content with Mobile Transitions */}
        <main className="flex-1 overflow-auto pb-24 md:pb-0 scroll-smooth">
          <div className="page-enter">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/materials" element={<MaterialCatalog />} />
              <Route path="/categories" element={<CategoryManagement />} />
            </Routes>
          </div>
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
