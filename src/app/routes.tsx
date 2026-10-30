import { Navigate, type RouteObject } from 'react-router-dom'
import { PortalRedirect, RequirePortal } from '@/auth/RouteGuards'
import PortalScope from '@/app/PortalScope'
import SiteRoot from '@/app/SiteRoot'
import { adminRoute } from '@/portals/admin/routes'
import { staffRoute } from '@/portals/staff/routes'
import { customerRoute } from '@/portals/customer/routes'

const siteRoutes: RouteObject[] = [
  {
    element: <PortalScope key="customer" portal="customer" />,
    children: [
      { path: '/', lazy: async () => ({ Component: (await import('@/portals/customer/public/HomePage')).default }) },
      {
        path: '/dang-nhap',
        lazy: async () => ({ Component: (await import('@/portals/customer/CustomerLoginPage')).default }),
      },
      { element: <RequirePortal portal="customer" />, children: [customerRoute] },
      { path: '/quan-ly-phieu', element: <PortalRedirect legacy /> },
      { path: '/khu-vuc-canh-tac', element: <PortalRedirect legacy /> },
    ],
  },
  {
    element: <PortalScope key="staff" portal="staff" />,
    children: [
      {
        path: '/staff/dang-nhap',
        lazy: async () => ({ Component: (await import('@/portals/staff/StaffLoginPage')).default }),
      },
      { element: <RequirePortal portal="staff" />, children: [staffRoute] },
      ...[
        'drones',
        'uav-profiles',
        'nhiem-vu',
        'lap-ke-hoach',
        'danh-gia-kha-thi',
        'pin',
        'du-lieu-moi-truong',
        'bao-cao',
      ].map((path) => ({ path: `/${path}/*`, element: <PortalRedirect legacy /> })),
    ],
  },
  {
    element: <PortalScope key="admin" portal="admin" />,
    children: [
      {
        path: '/admin/dang-nhap',
        lazy: async () => ({ Component: (await import('@/portals/admin/AdminLoginPage')).default }),
      },
      { element: <RequirePortal portal="admin" />, children: [adminRoute] },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
export const routes: RouteObject[] = [
  {
    element: <SiteRoot />,
    // Shown while the first lazy route module is still loading. React Router 7
    // dropped RouterProvider's fallbackElement in favour of this route-level one.
    hydrateFallbackElement: (
      <div className="auth-loading" role="status">
        SmartDroneHub · Đang chuẩn bị không gian của bạn…
      </div>
    ),
    children: siteRoutes,
  },
]
