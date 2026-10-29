import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import type { Portal } from '@/auth/model'
import { FleetProvider } from '@/store/FleetProvider'
import { OperationsProvider } from '@/features/operations/operationsStore'

export default function PortalScope({ portal }: { portal: Portal }) {
  return (
    <AuthProvider key={portal} portal={portal}>
      <FleetProvider>
        <OperationsProvider>
          <Outlet />
        </OperationsProvider>
      </FleetProvider>
    </AuthProvider>
  )
}
