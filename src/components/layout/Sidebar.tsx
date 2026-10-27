import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { isGroup, navigation, type NavGroup, type NavLeaf } from '@/app/navigation'
import Icon from '@/components/ui/Icon'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
    isActive
      ? 'bg-primary-container text-on-primary-container font-semibold'
      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
  }`

function LeafLink({ item }: { item: NavLeaf }) {
  return (
    <NavLink to={item.to} className={navClass}>
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

export default function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-space-sm px-space-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          <Icon name="hub" size={20} />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-title-sm text-title-sm tracking-tight text-on-surface">SmartDroneHub</span>
          <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
            Quản lý Đội bay Nông nghiệp
          </span>
        </div>
      </div>
      {/* Close the mobile drawer after picking a link */}
      <nav
        className="flex flex-1 flex-col gap-space-xs overflow-y-auto px-space-sm py-space-sm"
        onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}
      >
        {navigation.map((item) =>
          isGroup(item) ? <Group key={item.label} group={item} /> : <LeafLink key={item.to} item={item} />,
        )}
      </nav>
    </>
  )
}
