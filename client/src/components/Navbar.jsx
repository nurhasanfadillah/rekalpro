import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Grid, Layers } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Beranda', icon: Home, exact: true },
    { path: '/materials', label: 'Katalog Material', icon: Layers },
    { path: '/categories', label: 'Kategori', icon: Grid },
  ];

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">ReKal</h1>
                <p className="text-xs text-primary-100">PT. Redone Berkah Mandiri</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="md:hidden">
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-md ${
                      isActive ? 'bg-primary-800' : 'hover:bg-primary-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
