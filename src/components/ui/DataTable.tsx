import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Icon from '@/components/ui/Icon'

export function TableCard({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="ui-table-card mb-space-lg overflow-hidden rounded-xl bg-surface-container-lowest">
      <div
        className="ui-table-scroll overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Bảng dữ liệu, có thể cuộn ngang"
      >
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
        <span className="font-body-sm text-body-sm text-on-surface-variant">Tất cả kết quả</span>
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant opacity-40"
            disabled
            type="button"
            aria-label="Trang trước"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-title-sm text-title-sm text-on-primary-container"
            aria-current="page"
          >
            1
          </span>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant opacity-40"
            disabled
            type="button"
            aria-label="Trang sau"
          >
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
      className={`ui-icon-button rounded-lg p-1.5 transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const initialFocus = useRef('first')
  const id = useId()
  const [position, setPosition] = useState({ left: 0, top: 0 })

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menu = menuRef.current
    const width = document.documentElement.clientWidth
    if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > width) {
      setOpen(false)
      return
    }
    const left = Math.max(12, Math.min(rect.right - menu.offsetWidth, width - menu.offsetWidth - 12))
    const top =
      rect.bottom + menu.offsetHeight + 12 <= window.innerHeight
        ? rect.bottom + 6
        : Math.max(12, rect.top - menu.offsetHeight - 6)
    setPosition({ left, top })
  }, [])

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return
    updatePosition()
    const menu = menuRef.current
    const buttons = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    buttons[initialFocus.current === 'last' ? buttons.length - 1 : 0]?.focus({ preventScroll: true })
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node))
        setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Thao tác khác"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? id : undefined}
        onClick={() => {
          initialFocus.current = 'first'
          setOpen((value) => !value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            initialFocus.current = event.key === 'ArrowUp' ? 'last' : 'first'
            setOpen(true)
          }
        }}
        className={`ui-icon-button rounded-lg p-1.5 transition-colors hover:bg-surface-container-low hover:text-on-surface ${
          dimmed ? 'text-outline-variant' : 'text-on-surface-variant'
        }`}
      >
        <Icon name="more_vert" size={18} />
      </button>
      {open &&
        createPortal(
          <div
            id={id}
            ref={menuRef}
            role="menu"
            aria-label="Thao tác trên drone"
            className="ui-row-menu"
            style={position}
            onKeyDown={(event) => {
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'))
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
              if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault()
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? buttons.length - 1
                      : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
                buttons[next]?.focus()
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                setOpen(false)
                triggerRef.current?.focus()
              }
              if (event.key === 'Tab') {
                event.preventDefault()
                const focusable = Array.from(
                  document.querySelectorAll<HTMLElement>(
                    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
                  ),
                ).filter((element) => element.getClientRects().length && !menuRef.current?.contains(element))
                const triggerIndex = focusable.indexOf(triggerRef.current!)
                setOpen(false)
                focusable[triggerIndex + (event.shiftKey ? -1 : 1)]?.focus()
              }
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  triggerRef.current?.focus()
                  setOpen(false)
                  item.onClick()
                }}
                className={`w-full px-3 py-1.5 text-left font-label-md text-label-md transition-colors ${
                  item.danger
                    ? 'text-error hover:bg-error-container/40'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
