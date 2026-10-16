'use client'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative max-w-sm w-full rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
      >
        <div className="section-label mb-2">{danger ? 'Acción irreversible' : 'Confirmar'}</div>
        <h3 className="font-display text-xl text-white mb-2">{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'rgba(245,240,232,0.45)' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-ghost">
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 btn-gold"
            style={danger ? { background: 'rgba(239,68,68,0.9)', color: 'white' } : {}}
          >
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
