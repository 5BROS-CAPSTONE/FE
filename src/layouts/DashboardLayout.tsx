import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Plane, Layers } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/drones', label: 'Danh sách drone', icon: Plane },
  { to: '/uav-profiles', label: 'UAV Profile', icon: Layers },
]

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 bg-secondary text-slate-300 md:block">
        <div className="px-6 py-5 text-lg font-bold text-white">SmartDroneHub</div>
        <nav className="space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
