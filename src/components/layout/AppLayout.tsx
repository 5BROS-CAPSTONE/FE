import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Icon from '@/components/ui/Icon'
import { useFleet } from '@/store/fleetContext'
import type { Portal } from '@/auth/model'
import { useAuth } from '@/auth/authContext'
import PageTransition from '@/motion/PageTransition'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function AppLayout({ portal }: { portal: Portal }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const desktop = useMediaQuery('(min-width: 1024px)')
  const drawerRef = useRef<HTMLElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const { toast } = useFleet()
  const { session } = useAuth()
  const [wasDesktop, setWasDesktop] = useState(desktop)
  if (desktop !== wasDesktop) {
    setWasDesktop(desktop)
    if (desktop) setMenuOpen(false)
  }
  useEffect(() => {
    document.title = `${portal === 'admin' ? 'Quản trị hệ thống' : 'Không gian vận hành'} · SmartDroneHub`
  }, [portal])
  useEffect(() => {
    if (desktop || !menuOpen) return
    const previous = openerRef.current ?? (document.activeElement as HTMLElement | null)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
      }
      if (event.key !== 'Tab') return
      const items = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [],
      ).filter((item) => item.getClientRects().length)
      if (!items.length) return
      event.preventDefault()
      const index = items.indexOf(document.activeElement as HTMLElement)
      items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [menuOpen, desktop])

  return (
    <div className={`workspace workspace--${portal} min-h-screen bg-surface`}>
      {menuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        ref={drawerRef}
        inert={!desktop && !menuOpen}
        aria-hidden={!desktop && !menuOpen}
        role={desktop ? 'complementary' : 'dialog'}
        aria-label="Điều hướng không gian làm việc"
        aria-modal={!desktop && menuOpen ? true : undefined}
        className={`workspace-sidebar fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="drawer-topbar">
          <span>Không gian làm việc</span>
          <button type="button" aria-label="Đóng điều hướng" onClick={() => setMenuOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        <Sidebar portal={portal} onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="lg:pl-64" inert={!desktop && menuOpen}>
        <Header
          portal={portal}
          menuOpen={menuOpen}
          onOpenMenu={(button) => {
            openerRef.current = button
            setMenuOpen(true)
          }}
        />
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
          className="ui-toast fixed bottom-20 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-space-sm rounded-lg bg-inverse-surface px-space-md py-space-sm font-label-lg text-label-lg text-inverse-on-surface shadow-xl"
        >
          <Icon name="check_circle" size={18} className="text-inverse-primary" />
          {toast}
        </div>
      )}
    </div>
  )
}
