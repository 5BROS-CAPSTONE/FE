import { Navigate, type RouteObject } from 'react-router-dom'
import { navLeaves } from '@/app/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { droneRoutes } from '@/features/drones/routes'
import { operationsRoutes } from '@/features/operations/routes'
import { uavProfileRoutes } from '@/features/uav-profiles/routes'
import ComingSoonPage from '@/pages/ComingSoonPage'
import NotFoundPage from '@/pages/NotFoundPage'

/** Each feature exports its own routes; add new features to this list. */
const featureRoutes: RouteObject[] = [...uavProfileRoutes, ...droneRoutes, ...operationsRoutes]

// Menu items whose module is not built yet get a placeholder page
const implemented = new Set(featureRoutes.map((r) => r.path?.split('/')[0]))
const placeholderRoutes: RouteObject[] = navLeaves
  .filter((leaf) => !implemented.has(leaf.to.slice(1)))
  .map((leaf) => ({ path: leaf.to.slice(1), element: <ComingSoonPage title={leaf.label} /> }))

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/drones" replace /> },
      ...featureRoutes,
      ...placeholderRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
