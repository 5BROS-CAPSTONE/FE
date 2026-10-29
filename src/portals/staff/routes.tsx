import type { RouteObject } from 'react-router-dom'
import { flattenNavigation } from '@/app/navigation'
import { RequireAccess } from '@/auth/RouteGuards'
import ProfilePage from '@/auth/ProfilePage'
import { droneRoutes } from '@/features/drones/routes'
import { operationsRoutes } from '@/features/operations/routes'
import { uavProfileRoutes } from '@/features/uav-profiles/routes'
import ComingSoonPage from '@/pages/ComingSoonPage'
import NotFoundPage from '@/pages/NotFoundPage'
import StaffLayout from './StaffLayout'
import StaffHomePage from './StaffHomePage'
import { staffNavigation } from './navigation'

const isForm = (route: RouteObject) => route.path?.endsWith('/new') || route.path?.endsWith('/edit')
const implemented = new Set(['uav-profiles', 'drones', 'khu-vuc-canh-tac', 'quan-ly-phieu', 'ho-so'])
const placeholders: RouteObject[] = flattenNavigation(staffNavigation)
  .filter((item) => !item.exact && !implemented.has(item.to.split('/')[2]))
  .map((item) => ({
    element: <RequireAccess permission={item.permission} roles={item.roles} />,
    children: [{ path: item.to.split('/')[2], element: <ComingSoonPage title={item.label} /> }],
  }))

export const staffRoute: RouteObject = {
  path: '/staff',
  element: <StaffLayout />,
  children: [
    { index: true, element: <StaffHomePage /> },
    {
      element: <RequireAccess permission="uav-profile:read" />,
      children: [
        ...uavProfileRoutes.filter((route) => !isForm(route)),
        { element: <RequireAccess permission="uav-profile:update" />, children: uavProfileRoutes.filter(isForm) },
      ],
    },
    {
      element: <RequireAccess permission="drone:read" />,
      children: [
        ...droneRoutes.filter((route) => !isForm(route)),
        { element: <RequireAccess permission="drone:update" />, children: droneRoutes.filter(isForm) },
      ],
    },
    {
      element: <RequireAccess permission="area:read" />,
      children: operationsRoutes.filter((route) => route.path === 'khu-vuc-canh-tac'),
    },
    {
      element: <RequireAccess roles={['MANAGER']} />,
      children: operationsRoutes.filter((route) => route.path === 'quan-ly-phieu'),
    },
    ...placeholders,
    { path: 'ho-so', element: <ProfilePage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
}
