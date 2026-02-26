import { AlertTriangle, X, XCircle, Trash2 } from 'lucide-react';


function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false, error = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 animate-fade-in">
      {/* Mobile: Bottom sheet style, Desktop: Center modal */}
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md md:w-full border border-gray-100 overflow-hidden slide-up-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-9 md:h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              {title || 'Konfirmasi'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all text-gray-400 hover:text-gray-600 disabled:opacity-50 active:scale-95"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 md:px-6 py-5 space-y-4">
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {message || 'Apakah Anda yakin?'}
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer - Mobile: Full width buttons stacked */}
        <div className="flex flex-col md:flex-row justify-end gap-2.5 px-5 md:px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full md:w-auto btn-secondary text-sm haptic-touch py-3 md:py-2"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="w-full md:w-auto btn-danger text-sm haptic-touch py-3 md:py-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                Hapus
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

}

export default ConfirmDialog;
