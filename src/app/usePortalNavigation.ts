import { useNavigate, type NavigateOptions } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { portalPath } from '@/auth/model'

export function usePortalPath() {
  const { portal } = useAuth()
  return (path = '') => portalPath(portal, path)
}

export function usePortalNavigate() {
  const navigate = useNavigate()
  const pathFor = usePortalPath()
  return (path: string, options?: NavigateOptions) => navigate(path.startsWith('/') ? pathFor(path) : path, options)
}
