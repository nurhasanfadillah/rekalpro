import { AlertTriangle, X, XCircle } from 'lucide-react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false, error = null }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title || 'Konfirmasi'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" disabled={loading}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-gray-700">{message || 'Apakah Anda yakin?'}</p>

          {/* Error message inline */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Batal
          </button>
          {!error && (
            <button
              onClick={onConfirm}
              className="btn-danger"
              disabled={loading}
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
