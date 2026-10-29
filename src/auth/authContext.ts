import { createContext, useContext } from 'react'
import type { AuthSession, Permission, Portal } from './model'

export interface AuthStore {
  portal: Portal
  session: AuthSession | null
  loading: boolean
  notice: string
  login: (email: string, password: string, portal: Portal) => Promise<AuthSession>
  logout: () => Promise<void>
  expire: (message?: string) => void
  can: (permission: Permission) => boolean
}
export const AuthContext = createContext<AuthStore | null>(null)
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside AuthProvider')
  return auth
}
