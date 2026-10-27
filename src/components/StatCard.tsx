import type { ReactNode } from 'react'
import Icon from './Icon'

interface StatCardProps {
  label: string
  value: number
  icon: string
  iconClass: string
  footer?: ReactNode
}

export default function StatCard({ label, value, icon, iconClass, footer }: StatCardProps) {
  return (
    <div className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</span>
        <span className="font-display text-display leading-none text-on-surface">{value}</span>
        {footer}
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon name={icon} size={28} filled />
      </div>
    </div>
  )
}
