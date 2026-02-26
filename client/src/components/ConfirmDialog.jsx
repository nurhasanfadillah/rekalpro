import { AlertTriangle, X, XCircle } from 'lucide-react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false, error = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">
              {title || 'Konfirmasi'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {message || 'Apakah Anda yakin?'}
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="btn-secondary text-sm"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger text-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </span>
            ) : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
