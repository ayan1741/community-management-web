import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Onayla',
  confirmVariant = 'danger',
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>İptal</Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
