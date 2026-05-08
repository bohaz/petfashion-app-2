'use client'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl">
        <h3 className="text-lg font-extrabold mb-2">{title}</h3>
        <p className="text-sm text-stone-600 mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 bg-stone-100 py-3 rounded-xl font-semibold text-sm hover:bg-stone-200 transition">
            Cancelar
          </button>
          <button onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 hover:bg-stone-800'}`}>
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
