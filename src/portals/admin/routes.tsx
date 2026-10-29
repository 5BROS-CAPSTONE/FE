import type { RouteObject } from 'react-router-dom'
import ProfilePage from '@/auth/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminLayout from './AdminLayout'
import AdminHomePage from './AdminHomePage'
import AccountsPage from './AccountsPage'
import RolesPage from './RolesPage'
export const adminRoute: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { index: true, element: <AdminHomePage /> },
    { path: 'tai-khoan', element: <AccountsPage /> },
    { path: 'vai-tro', element: <RolesPage /> },
    { path: 'ho-so', element: <ProfilePage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
}
