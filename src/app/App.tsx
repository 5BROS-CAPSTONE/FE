import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from '@/app/routes'
import { FleetProvider } from '@/store/FleetProvider'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <FleetProvider>
      <RouterProvider router={router} />
    </FleetProvider>
  )
}
