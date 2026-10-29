import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { usePortalPath } from '@/app/usePortalNavigation'

export interface Crumb {
  label: string
  to?: string
}

interface PageHeadingProps {
  title: ReactNode
  subtitle?: ReactNode
  crumbs?: Crumb[]
  badge?: ReactNode
  actions?: ReactNode
}

export default function PageHeading({ title, subtitle, crumbs, badge, actions }: PageHeadingProps) {
  const pathFor = usePortalPath()
  return (
    <div className="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-start">
      <div className="flex min-w-0 flex-col gap-1">
        {crumbs && (
          <nav className="flex flex-wrap items-center gap-space-xs font-label-md text-label-md text-secondary">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-space-xs">
                {i > 0 && <Icon name="chevron_right" size={14} />}
                {i === crumbs.length - 1 ? (
                  <span className="font-semibold text-primary">{c.label}</span>
                ) : c.to ? (
                  <Link to={pathFor(c.to)} className="hover:text-on-surface">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-surface md:font-headline-lg md:text-headline-lg">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-sm">{actions}</div>}
    </div>
  )
}
