import { Link, useLocation } from 'react-router-dom'
import { findNavTrail } from '@/app/navigation'
import Icon from '@/components/ui/Icon'
import { COOPERATIVE, CURRENT_USER } from '@/mocks/data'

function HeaderCrumbs() {
  const { pathname } = useLocation()
  const trail = findNavTrail(pathname)
  if (!trail) return null
  return (
    <div className="hidden items-center gap-space-sm font-label-lg text-label-lg text-on-surface-variant sm:flex">
      {trail.group && (
        <>
          <span>{trail.group.label}</span>
          <Icon name="chevron_right" size={16} />
        </>
      )}
      <Link to={trail.leaf.to} className="font-semibold text-on-surface">
        {trail.leaf.label}
      </Link>
    </div>
  )
}

export default function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-space-md bg-surface-container-lowest/90 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md md:px-space-lg lg:left-64">
      <div className="flex items-center gap-space-sm">
        <button
          type="button"
          aria-label="Mở menu"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          onClick={onOpenMenu}
        >
          <Icon name="menu" />
        </button>
        <HeaderCrumbs />
      </div>
      <div className="flex items-center gap-space-md">
        <div className="hidden flex-col items-end leading-tight xl:flex">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
            Hợp tác xã
          </span>
          <span className="font-title-sm text-title-sm text-on-surface">{COOPERATIVE}</span>
        </div>
        <button
          type="button"
          aria-label="Thông báo"
          className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          <Icon name="notifications" size={22} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
        </button>
        <div className="flex items-center gap-space-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container font-title-sm text-title-sm text-on-secondary-fixed">
            {CURRENT_USER.name.split(' ').pop()?.[0]}
          </div>
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-title-sm text-title-sm text-on-surface">{CURRENT_USER.name}</span>
            <span className="truncate font-label-sm text-label-sm text-on-surface-variant">{CURRENT_USER.role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
