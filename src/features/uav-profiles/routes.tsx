import type { RouteObject } from 'react-router-dom'
import UavProfileFormPage from './pages/UavProfileFormPage'
import UavProfileListPage from './pages/UavProfileListPage'

// S1.1: UAV Profile (drone model specs, versioned)
export const uavProfileRoutes: RouteObject[] = [
  { path: 'uav-profiles', element: <UavProfileListPage /> },
  { path: 'uav-profiles/new', element: <UavProfileFormPage /> },
  { path: 'uav-profiles/:id', element: <UavProfileFormPage view /> },
  { path: 'uav-profiles/:id/edit', element: <UavProfileFormPage /> },
]
