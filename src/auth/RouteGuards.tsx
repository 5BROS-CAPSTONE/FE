import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'
import { canUsePortal, loginPath, type AppRole, type Permission, type Portal } from './model'
import ForbiddenPage from '@/pages/ForbiddenPage'

export function RequirePortal({ portal }: { portal: Portal }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div role="status" className="grid min-h-screen place-items-center">
        Đang kiểm tra phiên đăng nhập…
      </div>
    )
  if (!session) return <Navigate to={loginPath(portal)} state={{ from: location.pathname + location.search }} replace />
  if (session.portal !== portal || !canUsePortal(session.user, portal)) return <ForbiddenPage />
  return <Outlet />
}

export function RequireAccess({ permission, roles }: { permission?: Permission; roles?: AppRole[] }) {
  const { session, can } = useAuth()
  if ((permission && !can(permission)) || (roles && !session?.user.roles.some((role) => roles.includes(role))))
    return <ForbiddenPage />
  return <Outlet />
}

export function PortalRedirect({ legacy = false }: { legacy?: boolean }) {
  const { session, loading, portal } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div role="status" className="p-10">
        Đang kiểm tra phiên đăng nhập…
      </div>
    )
  if (!session)
    return (
      <Navigate
        to={loginPath(portal)}
        state={legacy ? { from: `/${portal}${location.pathname}${location.search}` } : undefined}
        replace
      />
    )
  return (
    <Navigate
      to={legacy ? `/${session.portal}${location.pathname}${location.search}${location.hash}` : `/${session.portal}`}
      replace
    />
  )
}
