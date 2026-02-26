import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Grid, Package, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home, exact: true },
  { path: '/materials', label: 'Katalog Material', icon: Layers },
  { path: '/categories', label: 'Kategori', icon: Grid },
];


function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();


  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-primary-800 to-primary-900 text-white flex flex-col z-40 transition-all duration-300 shadow-xl ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div 
        className={`flex items-center gap-3 px-4 py-5 border-b border-primary-700 ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? 'ReKal' : undefined}
      >
        <div className="flex-shrink-0 w-9 h-9 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
          <Package className="h-5 w-5 text-white" />
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight">ReKal</h1>
            <p className="text-xs text-primary-300 truncate">PT. Redone Berkah Mandiri</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider px-3 mb-3">
            Menu Utama
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-white bg-opacity-20 text-white shadow-sm'
                  : 'text-primary-200 hover:bg-white hover:bg-opacity-10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`flex-shrink-0 h-5 w-5 ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* App version */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-primary-700">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary-400" />
            <span className="text-xs text-primary-400">ReKal v1.0.0</span>
          </div>
          <p className="text-xs text-primary-500 mt-0.5">Rekalkulasi HPP</p>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-primary-700 border-2 border-primary-600 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors shadow-md"
      >

        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-white" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-white" />
        )}
      </button>
    </aside>
  );
}

export default Sidebar;
