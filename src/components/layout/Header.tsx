import { Link, useLocation } from 'react-router-dom'
import { findNavTrail, navigationFor } from '@/app/navigation'
import Icon from '@/components/ui/Icon'
import { COOPERATIVE } from '@/mocks/data'
import { useAuth } from '@/auth/authContext'
import { roleLabels, type Portal } from '@/auth/model'

function HeaderCrumbs({ portal }: { portal: Portal }) {
  const { pathname } = useLocation()
  const { session } = useAuth()
  const trail = findNavTrail(pathname, navigationFor(portal, session?.user))
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

export default function Header({
  portal,
  onOpenMenu,
  menuOpen,
}: {
  portal: Portal
  onOpenMenu: (button: HTMLButtonElement) => void
  menuOpen: boolean
}) {
  const { session } = useAuth()
  const userName = session?.user.fullName ?? ''
  const userRole = session?.user.roles.map((role) => roleLabels[role] ?? role).join(' · ')
  const visibleRole =
    session && session.user.roles.length > 1
      ? `${roleLabels[session.user.roles[0]] ?? session.user.roles[0]} +${session.user.roles.length - 1}`
      : userRole
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-space-md bg-surface-container-lowest/90 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md md:px-space-lg lg:left-64">
      <div className="flex items-center gap-space-sm">
        <button
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          aria-controls="workspace-navigation"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
          onClick={(event) => onOpenMenu(event.currentTarget)}
        >
          <Icon name="menu" />
        </button>
        <HeaderCrumbs portal={portal} />
      </div>
      <div className="flex items-center gap-space-md">
        <div className="hidden flex-col items-end leading-tight xl:flex">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
            Hợp tác xã
          </span>
          <span className="font-title-sm text-title-sm text-on-surface">{COOPERATIVE}</span>
        </div>
        <Link
          to={`/${portal}/ho-so`}
          className="flex items-center gap-space-sm rounded-lg p-1 hover:bg-surface-container-low"
          aria-label="Mở hồ sơ của tôi"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container font-title-sm text-title-sm text-on-secondary-fixed">
            {userName.split(' ').pop()?.[0]}
          </div>
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate font-title-sm text-title-sm text-on-surface">{userName}</span>
            <span
              title={userRole}
              className="max-w-[220px] truncate font-label-sm text-label-sm text-on-surface-variant"
            >
              {visibleRole}
            </span>
          </div>
        </Link>
      </div>
    </header>
  )
}
