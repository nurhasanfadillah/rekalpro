import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Grid, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Beranda', icon: Home, exact: true },
  { path: '/materials', label: 'Material', icon: Layers },
  { path: '/categories', label: 'Kategori', icon: Grid },
];

function MobileNav() {
  const location = useLocation();
  const [pressedItem, setPressedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  // Handle scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Always show at bottom of page
      if (currentScrollY + windowHeight >= documentHeight - 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleTouchStart = (itemPath) => {
    setPressedItem(itemPath);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setPressedItem(null), 150);
  };

  return (
    <>
      {/* Floating Action Button for Quick Add */}
      <Link
        to="/products/new"
        className={`md:hidden fixed right-4 z-40 transition-all duration-300 ease-out ${
          isVisible ? 'bottom-24' : 'bottom-4'
        }`}
        onTouchStart={() => handleTouchStart('fab')}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => handleTouchStart('fab')}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div className={`relative group ${pressedItem === 'fab' ? 'scale-90' : 'scale-100'} transition-transform duration-150`}>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
          
          <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
            
            {/* Ripple effect on press */}
            {pressedItem === 'fab' && (
              <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping" />
            )}
          </div>
        </div>
      </Link>

      {/* Bottom Navigation */}
      <nav 
        className={`md:hidden fixed left-4 right-4 bottom-4 z-40 transition-all duration-300 ease-out transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 border border-white/50 pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              const isPressed = pressedItem === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  } ${isPressed ? 'scale-90' : 'scale-100'}`}
                  onTouchStart={() => handleTouchStart(item.path)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => handleTouchStart(item.path)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
                >
                  {/* Active background pill */}
                  {active && (
                    <div className="absolute inset-x-2 inset-y-1 bg-primary-50 rounded-xl transition-all duration-300 ease-out" />
                  )}
                  
                  <div className="relative flex flex-col items-center">
                    {/* Icon with animation */}
                    <div className={`relative p-2 rounded-xl transition-all duration-200 ${
                      active ? 'transform -translate-y-0.5' : ''
                    }`}>
                      <Icon 
                        className={`h-5 w-5 transition-all duration-200 ${
                          active ? 'scale-110' : 'scale-100'
                        }`} 
                        strokeWidth={active ? 2.5 : 2}
                      />
                    </div>
                    
                    {/* Label */}
                    <span className={`text-[11px] font-medium transition-all duration-200 ${
                      active ? 'font-semibold text-primary-700' : ''
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Active indicator dot */}
                    {active && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export default MobileNav;
