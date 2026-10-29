import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { isGroup, navigationFor, type NavGroup, type NavLeaf } from '@/app/navigation'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/auth/authContext'
import { loginPath, portalInfo, type Portal } from '@/auth/model'
import Brand from '@/components/brand/Brand'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
    isActive
      ? 'bg-primary-container text-on-primary-container font-semibold'
      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
  }`

function LeafLink({ item }: { item: NavLeaf }) {
  return (
    <NavLink to={item.to} end={item.exact} className={navClass}>
      {item.icon && <Icon name={item.icon} />}
      <span className="flex-1">{item.label}</span>
      {item.tag && (
        <span className="rounded bg-tertiary-fixed px-1.5 py-0.5 font-label-sm text-label-sm uppercase text-on-tertiary-fixed">
          {item.tag}
        </span>
      )}
    </NavLink>
  )
}

function Group({ group }: { group: NavGroup }) {
  const { pathname } = useLocation()
  const containsActive = group.children.some((c) => pathname.startsWith(c.to))
  const [open, setOpen] = useState(true)
  return (
    <div className="mt-space-xs flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between rounded-lg px-space-md py-space-sm font-title-sm text-title-sm hover:bg-surface-container-low ${
          containsActive ? 'text-on-surface' : 'text-on-surface-variant'
        }`}
      >
        <span className="flex items-center gap-space-sm">
          <Icon name={group.icon} />
          {group.label}
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="text-on-surface-variant" />
      </button>
      {open && (
        <div className="mt-0.5 flex flex-col gap-space-xs pl-8 pr-space-xs">
          {group.children.map((child) => (
            <LeafLink key={child.to} item={child} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ portal, onNavigate }: { portal: Portal; onNavigate: () => void }) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const navigation = navigationFor(portal, session?.user)
  const signOut = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    const completion = logout()
    navigate(loginPath(portal), { replace: true })
    await completion
  }
  return (
    <>
      <div className="workspace-brand">
        <Brand
          to={`/${portal}`}
          light={portal === 'admin'}
          caption={portal === 'admin' ? 'ADMINISTRATION' : 'OPERATIONS WORKSPACE'}
        />
      </div>
      <div className="workspace-nav-label">{portalInfo[portal].label}</div>
      {/* Close the mobile drawer after picking a link */}
      <nav
        className="flex flex-1 flex-col gap-space-xs overflow-y-auto px-space-sm py-space-sm"
        onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}
      >
        {navigation.map((item) =>
          isGroup(item) ? <Group key={item.label} group={item} /> : <LeafLink key={item.to} item={item} />,
        )}
      </nav>
      <div className="workspace-sidebar-note">
        <Icon name={portal === 'admin' ? 'verified_user' : 'eco'} size={22} />
        <p>
          {portal === 'admin' ? 'Quản trị với sự an tâm.' : 'Công nghệ vun trồng tương lai.'}
          <small>SMARTDRONEHUB / 5BROS</small>
        </p>
      </div>
      <div className="border-t border-outline-variant/30 p-3">
        <button
          type="button"
          disabled={loggingOut}
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-error-container/30 hover:text-error"
        >
          <Icon name="logout" size={20} />
          {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </button>
      </div>
    </>
  )
}
