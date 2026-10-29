import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import Brand from '@/components/brand/Brand'
import Icon from '@/components/ui/Icon'
import PageTransition from '@/motion/PageTransition'

export default function CustomerWorkspaceLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Không gian khách hàng · SmartDroneHub'
  }, [])
  const signOut = () => {
    void logout()
    navigate('/dang-nhap', { replace: true })
  }
  return (
    <div className="workspace workspace--customer customer-workspace">
      <header className="customer-header">
        <div className="customer-header-top">
          <Brand to="/" />
          <div className="customer-account">
            <Link to="/customer/ho-so" aria-label="Mở hồ sơ của tôi">
              <span className="customer-avatar">{session?.user.fullName.split(' ').pop()?.[0]}</span>
              <span>
                {session?.user.fullName}
                <small>Không gian khách hàng</small>
              </span>
            </Link>
            <button type="button" aria-label="Đăng xuất" title="Đăng xuất" onClick={signOut}>
              <Icon name="logout" size={20} />
            </button>
          </div>
        </div>
        <div className="customer-nav-row">
          <nav aria-label="Điều hướng khách hàng">
            {[
              ['/customer', 'Tổng quan', 'space_dashboard'],
              ['/customer/khu-vuc-canh-tac', 'Khu vực canh tác', 'crop_free'],
              ['/customer/quan-ly-phieu', 'Phiếu yêu cầu', 'description'],
            ].map(([to, label, icon]) => (
              <NavLink key={to} to={to} end={to === '/customer'}>
                <Icon name={icon} size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <span className="customer-space-label">
            <span className="status-dot" />
            KHÔNG GIAN CỦA BẠN
          </span>
        </div>
      </header>
      <main className="customer-main">
        <div className="workspace-demo-note">
          <span>Bản trải nghiệm</span>Dữ liệu canh tác và phiếu yêu cầu hiện là dữ liệu demo.
        </div>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="customer-workspace-footer">
        <span>© {new Date().getFullYear()} SmartDroneHub</span>
        <Link to="/">
          Về trang chủ
          <Icon name="north_east" size={14} />
        </Link>
      </footer>
    </div>
  )
}
