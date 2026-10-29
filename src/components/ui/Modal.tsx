import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/ui/Icon'

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
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    dialog.querySelector('button')?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])

  const style = toneStyles[tone]
  return createPortal(
    <dialog
      ref={dialogRef}
      className={`ui-dialog ui-dialog--${tone}`}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]',
          ),
        ).filter((item) => item.getClientRects().length)
        if (!items.length) return
        event.preventDefault()
        const index = items.indexOf(document.activeElement as HTMLElement)
        items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }}
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose()
      }}
    >
      <div className="ui-dialog-content">
        <button aria-label="Đóng" className="ui-dialog-close" type="button" onClick={onClose}>
          <Icon name="close" />
        </button>
        <div className="ui-dialog-header">
          <div className={`ui-dialog-tone ${style.box}`}>
            <Icon name={style.icon} size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId}>{title}</h2>
            {description && (
              <div id={descriptionId} className="ui-dialog-description">
                {description}
              </div>
            )}
          </div>
        </div>
        {children && <div className="ui-dialog-body">{children}</div>}
        <div className="ui-dialog-footer">{footer}</div>
      </div>
    </dialog>,
    document.body,
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
