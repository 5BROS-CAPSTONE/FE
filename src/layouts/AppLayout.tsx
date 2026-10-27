import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import { COOPERATIVE, CURRENT_USER } from '../mocks/data'
import { useFleet } from '../store/fleetContext'

const topItems = [
  { to: '/nhiem-vu', label: 'Nhiệm vụ', icon: 'assignment' },
  { to: '/lap-ke-hoach', label: 'Lập kế hoạch', icon: 'calendar_month' },
  { to: '/danh-gia-kha-thi', label: 'Đánh giá khả thi', icon: 'psychology', tag: 'DSS' },
]

const bottomItems = [
  { to: '/pin', label: 'Pin', icon: 'battery_charging_full' },
  { to: '/khu-vuc-canh-tac', label: 'Khu vực canh tác', icon: 'crop_free' },
  { to: '/du-lieu-moi-truong', label: 'Dữ liệu môi trường', icon: 'thermostat' },
  { to: '/bao-cao', label: 'Báo cáo', icon: 'bar_chart' },
  { to: '/cau-hinh', label: 'Cấu hình', icon: 'settings' },
]

const fleetItems = [
  { to: '/uav-profiles', label: 'UAV Profile' },
  { to: '/drones', label: 'Danh sách drone' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-lg text-label-lg transition-colors ${
    isActive
      ? 'bg-primary-container text-on-primary-container font-semibold'
      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
  }`

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const [fleetOpen, setFleetOpen] = useState(true)
  return (
    <>
      <div className="flex h-16 items-center gap-space-sm px-space-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary">
          <Icon name="hub" size={20} />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-title-sm text-title-sm tracking-tight text-on-surface">SmartDroneHub</span>
          <span className="truncate font-label-sm text-label-sm text-on-surface-variant">Quản lý Đội bay Nông nghiệp</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-space-xs overflow-y-auto px-space-sm py-space-sm" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}>
        {topItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            <Icon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.tag && (
              <span className="rounded bg-tertiary-fixed px-1.5 py-0.5 font-label-sm text-label-sm uppercase text-on-tertiary-fixed">
                {item.tag}
              </span>
            )}
          </NavLink>
        ))}
        <div className="mt-space-xs flex flex-col">
          <button
            type="button"
            onClick={() => setFleetOpen((o) => !o)}
            className="flex items-center justify-between rounded-lg px-space-md py-space-sm font-title-sm text-title-sm text-on-surface hover:bg-surface-container-low"
          >
            <span className="flex items-center gap-space-sm">
              <Icon name="flight" />
              Đội drone
            </span>
            <Icon name={fleetOpen ? 'expand_less' : 'expand_more'} size={18} className="text-on-surface-variant" />
          </button>
          {fleetOpen && (
            <div className="mt-0.5 flex flex-col gap-space-xs pl-8 pr-space-xs">
              {fleetItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        {bottomItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass}>
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function HeaderCrumbs() {
  const { pathname } = useLocation()
  const section = pathname.startsWith('/uav-profiles')
    ? { label: 'UAV Profile', to: '/uav-profiles' }
    : pathname.startsWith('/drones')
      ? { label: 'Danh sách drone', to: '/drones' }
      : null
  if (!section) return null
  return (
    <div className="hidden items-center gap-space-sm font-label-lg text-label-lg text-on-surface-variant sm:flex">
      <span>Đội drone</span>
      <Icon name="chevron_right" size={16} />
      <Link to={section.to} className="font-semibold text-on-surface">
        {section.label}
      </Link>
    </div>
  )
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast } = useFleet()

  return (
    <div className="min-h-screen bg-surface">
      {menuOpen && <div className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-space-md bg-surface-container-lowest/90 px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md md:px-space-lg lg:left-64">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              aria-label="Mở menu"
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <HeaderCrumbs />
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden items-center gap-space-md xl:flex">
              <div className="flex flex-col items-end leading-tight">
                <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">Hợp tác xã</span>
                <span className="font-title-sm text-title-sm text-on-surface">{COOPERATIVE}</span>
              </div>
              <div className="h-8 w-px bg-surface-container-high" />
              <div className="flex items-center gap-space-xs rounded-full bg-surface-container-low px-2.5 py-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-label-sm text-label-sm font-medium text-on-surface">Trạng thái: Bình thường</span>
              </div>
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

        <main className="min-h-screen w-full px-space-md pb-space-lg pt-20 md:px-space-lg md:pt-24">
          <Outlet />
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-space-sm rounded-lg bg-inverse-surface px-space-md py-space-sm font-label-lg text-label-lg text-inverse-on-surface shadow-xl"
        >
          <Icon name="check_circle" size={18} className="text-inverse-primary" />
          {toast}
        </div>
      )}
    </div>
  )
}
