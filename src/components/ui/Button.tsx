import type { ButtonHTMLAttributes } from 'react'
import Icon from '@/components/ui/Icon'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger-outline' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-primary-container text-on-primary hover:bg-primary shadow-sm',
  secondary: 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  outline: 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low',
  'danger-outline': 'bg-surface-container-lowest text-error shadow-sm hover:bg-error-container/40',
  danger: 'bg-error text-on-error hover:opacity-90 shadow-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: string
}

export default function Button({ variant = 'primary', icon, className = '', children, onClick, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true })
        onClick?.(event)
      }}
      className={`ui-button ui-button--${variant} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-space-md font-label-lg text-label-lg disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}
