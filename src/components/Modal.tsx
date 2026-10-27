import { useEffect, type ReactNode } from 'react'
import Icon from './Icon'

type Tone = 'warning' | 'info' | 'error'

const toneStyles: Record<Tone, { box: string; icon: string }> = {
  warning: { box: 'bg-secondary-container text-secondary', icon: 'warning' },
  info: { box: 'bg-tertiary-fixed text-tertiary', icon: 'info' },
  error: { box: 'bg-error-container text-error', icon: 'error' },
}

interface ModalProps {
  title: string
  description?: ReactNode
  tone?: Tone
  onClose: () => void
  children?: ReactNode
  footer: ReactNode
}

export default function Modal({ title, description, tone = 'warning', onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const style = toneStyles[tone]
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
      >
        <button
          aria-label="Đóng"
          className="absolute right-5 top-5 rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          type="button"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.box}`}>
            <Icon name={style.icon} size={28} />
          </div>
          <div className="flex flex-col gap-1 pr-6">
            <h2 className="font-headline-sm text-headline-sm tracking-tight text-on-surface">{title}</h2>
            {description && <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>}
          </div>
        </div>
        {children && <div className="flex flex-col gap-4">{children}</div>}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3">{footer}</div>
      </div>
    </div>
  )
}

export function ModalSectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
      {children}
    </span>
  )
}

export function InfoNote({ children, icon = 'info' }: { children: ReactNode; icon?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-tertiary-fixed/40 p-3 font-body-sm text-body-sm text-tertiary">
      <Icon name={icon} size={18} className="mt-0.5" />
      <span>{children}</span>
    </div>
  )
}
