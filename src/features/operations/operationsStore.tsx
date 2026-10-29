import { useEffect, useRef, useState, type ReactNode } from 'react'
import { OperationsContext } from './operationsContext'
import { seedOperations, type OperationsData, type Role } from './operationsModel'
import { useAuth } from '@/auth/authContext'

const storageKey = 'smartdronehub-s7-s8-demo-v1'

function loadData(): OperationsData {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as OperationsData | null
    if (saved && Array.isArray(saved.farms) && Array.isArray(saved.fields) && Array.isArray(saved.tickets)) return saved
  } catch {
    // An invalid demo snapshot should not prevent the application from loading.
  }
  return seedOperations()
}

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OperationsData>(loadData)
  const dataRef = useRef(data)
  const { session } = useAuth()
  const role: Role = session?.portal === 'customer' ? 'customer' : 'manager'
  const customerId = session?.user.customerId ?? ''
  const actor = session?.user.fullName ?? ''

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data])

  const update = (apply: (draft: OperationsData) => void) => {
    const draft = structuredClone(dataRef.current)
    apply(draft)
    dataRef.current = draft
    setData(draft)
  }

  const reset = () => {
    const seeded = seedOperations()
    dataRef.current = seeded
    setData(seeded)
  }

  return (
    <OperationsContext.Provider value={{ data, role, customerId, actor, update, reset }}>
      {children}
    </OperationsContext.Provider>
  )
}
