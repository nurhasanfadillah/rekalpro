import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const styles = {
    success: {
      container: 'bg-white border-l-4 border-emerald-500 shadow-lg',
      icon: '✓',
      iconBg: 'bg-emerald-100 text-emerald-600',
      title: 'Berhasil',
      titleColor: 'text-emerald-700',
    },
    error: {
      container: 'bg-white border-l-4 border-red-500 shadow-lg',
      icon: '✕',
      iconBg: 'bg-red-100 text-red-600',
      title: 'Gagal',
      titleColor: 'text-red-700',
    },
    info: {
      container: 'bg-white border-l-4 border-blue-500 shadow-lg',
      icon: 'i',
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'Info',
      titleColor: 'text-blue-700',
    },
    warning: {
      container: 'bg-white border-l-4 border-amber-500 shadow-lg',
      icon: '!',
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'Perhatian',
      titleColor: 'text-amber-700',
    },
  };

  const style = styles[toast.type] || styles.success;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg min-w-[280px] max-w-sm animate-slide-in ${style.container}`}
    >
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${style.iconBg}`}>
        {style.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.titleColor}`}>{style.title}</p>
        <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
