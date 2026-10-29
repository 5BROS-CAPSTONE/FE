import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Icon from '@/components/ui/Icon'
import { useFleet } from '@/store/fleetContext'
import type { Portal } from '@/auth/model'
import { useAuth } from '@/auth/authContext'
import PageTransition from '@/motion/PageTransition'

export default function AppLayout({ portal }: { portal: Portal }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toast } = useFleet()
  const { session } = useAuth()
  useEffect(() => {
    document.title = `${portal === 'admin' ? 'Quản trị hệ thống' : 'Không gian vận hành'} · SmartDroneHub`
  }, [portal])

  return (
    <div className={`workspace workspace--${portal} min-h-screen bg-surface`}>
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <aside
        className={`workspace-sidebar fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar portal={portal} onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="lg:pl-64">
        <Header portal={portal} onOpenMenu={() => setMenuOpen(true)} />
        <main className="min-h-screen w-full px-space-md pb-space-lg pt-20 md:px-space-lg md:pt-24">
          <div className="workspace-demo-note">
            <span className="rounded bg-secondary-container px-1.5 py-0.5 font-semibold">
              {session?.mode === 'demo' ? 'Đăng nhập demo' : 'Đã kết nối tài khoản'}
            </span>
            Dữ liệu nghiệp vụ trong không gian này là dữ liệu trải nghiệm.
          </div>
          <PageTransition>
            <Outlet />
          </PageTransition>
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
