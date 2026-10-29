import { cloneElement, isValidElement, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import Icon from '@/components/ui/Icon'
import { inputClass } from '@/components/ui/inputClass'

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, required, hint, error, aside, className = '', children }: FieldProps) {
  const control =
    isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    typeof children.type === 'string' &&
    ['input', 'select', 'textarea'].includes(children.type)
      ? cloneElement(children, {
          'aria-invalid': !!error,
          'aria-describedby': error
            ? `${htmlFor}-error`
            : hint
              ? `${htmlFor}-hint`
              : children.props['aria-describedby'],
        })
      : children
  return (
    <div data-invalid={!!error} className={`ui-field flex flex-col gap-space-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1 font-label-lg text-label-lg text-on-surface" htmlFor={htmlFor}>
          {label}
          {required && <span className="font-bold text-error">*</span>}
        </label>
        {aside}
      </div>
      {control}
      {error ? (
        <div
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1.5 rounded-lg bg-error-container p-2 font-label-sm text-label-sm text-error"
        >
          <Icon name="error" size={16} />
          <span>{error}</span>
        </div>
      ) : (
        hint && (
          <span id={`${htmlFor}-hint`} className="font-label-sm text-label-sm text-secondary">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

interface NumberInputProps {
  id: string
  value: string
  unit: string
  onChange: (value: string) => void
  error?: string
  step?: string
  placeholder?: string
}

export function NumberInput({ id, value, unit, onChange, error, step = '0.1', placeholder }: NumberInputProps) {
  return (
    <div className="relative flex items-center">
      <input
        id={id}
        type="number"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} pr-14`}
      />
      <span className="pointer-events-none absolute right-3 select-none font-label-md text-label-md text-secondary">
        {unit}
      </span>
    </div>
  )
}

interface SelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function Select({ id, value, onChange, options, error, placeholder, disabled }: SelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
      />
    </div>
  )
}

interface SectionCardProps {
  icon: string
  title: string
  subtitle?: string
  children: ReactNode
}

export function SectionCard({ icon, title, subtitle, children }: SectionCardProps) {
  return (
    <section className="ui-section-card rounded-lg bg-surface-container-lowest p-space-md md:p-space-lg">
      <div className="mb-space-md flex items-center gap-space-sm border-b border-surface-container pb-space-md">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-primary">
          <Icon name={icon} size={18} />
        </span>
        <div className="flex flex-col">
          <h2 className="font-title-md text-title-md text-on-surface">{title}</h2>
          {subtitle && <p className="font-label-sm text-label-sm text-secondary">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

/** Fixed bottom action bar used by the create/edit forms. */
export function FormActionBar({ status, children }: { status: ReactNode; children: ReactNode }) {
  const barRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const bar = barRef.current
    const workspace = bar?.closest<HTMLElement>('.workspace')
    if (!bar || !workspace) return
    const update = () => workspace.style.setProperty('--form-action-height', `${bar.getBoundingClientRect().height}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(bar)
    return () => {
      observer.disconnect()
      workspace.style.removeProperty('--form-action-height')
    }
  }, [])
  return (
    <div
      ref={barRef}
      className="ui-form-action-bar fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-space-md bg-surface-container-lowest/95 px-space-md py-space-sm backdrop-blur-md md:px-space-lg lg:left-64"
    >
      <div className="hidden min-w-0 items-center gap-space-sm font-label-md text-label-md text-secondary sm:flex">
        {status}
      </div>
      <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-space-sm">{children}</div>
    </div>
  )
}
