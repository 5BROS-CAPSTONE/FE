import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from '@/app/routes'
import { FleetProvider } from '@/store/FleetProvider'
import { OperationsProvider } from '@/features/operations/operationsStore'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <FleetProvider>
      <OperationsProvider>
        <RouterProvider router={router} />
      </OperationsProvider>
    </FleetProvider>
  )
}
