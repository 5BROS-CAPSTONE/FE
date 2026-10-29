import { createContext, useContext } from 'react'
import type { OperationsData, Role } from './operationsModel'

export interface OperationsStore {
  data: OperationsData
  role: Role
  customerId: string
  actor: string
  update: (apply: (draft: OperationsData) => void) => void
  reset: () => void
}

export const OperationsContext = createContext<OperationsStore | null>(null)

export function useOperations() {
  const store = useContext(OperationsContext)
  if (!store) throw new Error('useOperations must be used inside OperationsProvider')
  return store
}
