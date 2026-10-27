import { useEffect, useRef, useState, type ReactNode } from 'react'
import Icon from './Icon'

export function TableCard({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mb-space-lg overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
      {footer}
    </div>
  )
}

export function Th({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return <th className={`px-space-md py-2 ${align === 'right' ? 'text-right' : ''}`}>{children}</th>
}

export const theadRowClass =
  'h-10 bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider'

export function TableFooter({ shown, total, unit }: { shown: number; total: number; unit: string }) {
  return (
    <div className="flex flex-col items-center justify-between gap-space-sm bg-surface-container-low/50 px-space-md py-3 sm:flex-row">
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        Hiển thị <span className="font-semibold text-on-surface">{shown === 0 ? 0 : `1 - ${shown}`}</span> trong tổng số{' '}
        <span className="font-semibold text-on-surface">{total}</span> {unit}
      </div>
      <div className="flex items-center gap-space-md">
        <span className="font-body-sm text-body-sm text-on-surface-variant">10 / trang</span>
        <div className="flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant opacity-40" disabled type="button">
            <Icon name="chevron_left" size={18} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-title-sm text-title-sm text-on-primary-container" type="button">
            1
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant opacity-40" disabled type="button">
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-space-md py-space-xl text-center text-on-surface-variant">
        {text}
      </td>
    </tr>
  )
}

interface IconButtonProps {
  icon: string
  title: string
  onClick?: () => void
  disabled?: boolean
  muted?: boolean
}

export function IconButton({ icon, title, onClick, disabled, muted }: IconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-1.5 transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
        muted ? 'text-outline' : 'text-on-surface-variant'
      }`}
    >
      <Icon name={icon} size={18} />
    </button>
  )
}

export interface MenuItem {
  label: string
  danger?: boolean
  onClick: () => void
}

/** "More" (⋮) dropdown for table rows. */
export function RowMenu({ items, dimmed }: { items: MenuItem[]; dimmed?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Thao tác khác"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`rounded-lg p-1.5 transition-colors hover:bg-surface-container-low hover:text-on-surface ${
          dimmed ? 'text-outline-variant' : 'text-on-surface-variant'
        }`}
      >
        <Icon name="more_vert" size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg bg-surface-container-lowest py-1 text-left shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`w-full px-3 py-1.5 text-left font-label-md text-label-md transition-colors ${
                item.danger ? 'text-error hover:bg-error-container/40' : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
