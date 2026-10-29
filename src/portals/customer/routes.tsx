import type { RouteObject } from 'react-router-dom'
import ProfilePage from '@/auth/ProfilePage'
import { operationsRoutes } from '@/features/operations/routes'
import NotFoundPage from '@/pages/NotFoundPage'
import CustomerLayout from './CustomerLayout'
import CustomerHomePage from './CustomerHomePage'
export const customerRoute: RouteObject = {
  path: '/customer',
  element: <CustomerLayout />,
  children: [
    { index: true, element: <CustomerHomePage /> },
    ...operationsRoutes,
    { path: 'ho-so', element: <ProfilePage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
}
