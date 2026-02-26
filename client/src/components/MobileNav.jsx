import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Layers, Grid, Plus } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Beranda', icon: Home, exact: true },
  { path: '/products', label: 'Produk', icon: Package },
  { path: '/materials', label: 'Material', icon: Layers },
  { path: '/categories', label: 'Kategori', icon: Grid },
];

function MobileNav() {
  const location = useLocation();

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                active ? 'bg-primary-50' : ''
              }`}>
                <Icon className={`h-5 w-5 ${active ? 'scale-110' : ''}`} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Quick Add Button */}
        <Link
          to="/products/new"
          className="flex flex-col items-center justify-center flex-1 h-full text-primary-600"
        >
          <div className="relative p-1.5 rounded-xl bg-primary-100">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Tambah</span>
        </Link>
      </div>
    </nav>
  );
}

export default MobileNav;
