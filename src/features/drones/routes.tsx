import type { RouteObject } from 'react-router-dom'
import DroneDetailPage from './pages/DroneDetailPage'
import DroneFormPage from './pages/DroneFormPage'
import DroneListPage from './pages/DroneListPage'

// S1.2 – S1.4: fleet drones
export const droneRoutes: RouteObject[] = [
  { path: 'drones', element: <DroneListPage /> },
  { path: 'drones/new', element: <DroneFormPage /> },
  { path: 'drones/:id', element: <DroneDetailPage /> },
  { path: 'drones/:id/edit', element: <DroneFormPage /> },
]
