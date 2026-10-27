import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Icon from '@/components/ui/Icon'
import { useFleet } from '@/store/fleetContext'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast } = useFleet()

  return (
    <div className="min-h-screen bg-surface">
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="lg:pl-64">
        <Header onOpenMenu={() => setMenuOpen(true)} />
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
