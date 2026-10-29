import { Navigate, useSearchParams } from 'react-router-dom'
import AuthScreen from '@/auth/AuthScreen'
export default function CustomerLoginPage() {
  const [params] = useSearchParams()
  const legacy = params.get('portal')
  if (legacy === 'staff' || legacy === 'admin') return <Navigate to={`/${legacy}/dang-nhap`} replace />
  return <AuthScreen portal="customer" />
}
