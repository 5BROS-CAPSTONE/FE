interface IconProps {
  name: string
  size?: number
  filled?: boolean
  className?: string
}

/** Material Symbols Outlined icon, as used across the Stitch screens. */
export default function Icon({ name, size = 20, filled = false, className = '' }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined shrink-0 ${filled ? 'icon-filled' : ''} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}
