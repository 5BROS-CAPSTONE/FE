import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'
import { apiRequest, authMode, errorMessage } from './api'
import { demoLogin } from './demoAccounts'
import { canUsePortal, hasPermission, type AuthSession, type AuthUser, type LoginResponse, type Portal } from './model'

function readSession(portal: Portal): AuthSession | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(`smartdronehub-auth-v2-${portal}`) ?? 'null') as AuthSession | null
    if (
      saved &&
      saved.mode === authMode &&
      saved.accessToken &&
      saved.portal === portal &&
      Array.isArray(saved.user?.roles) &&
      Date.parse(saved.expiresAt) > Date.now() &&
      canUsePortal(saved.user, saved.portal)
    )
      return saved
  } catch {
    /* Discard invalid or inaccessible session storage. */
  }
  return null
}

export function AuthProvider({ portal: activePortal, children }: { portal: Portal; children: ReactNode }) {
  const storageKey = `smartdronehub-auth-v2-${activePortal}`
  const [session, setSession] = useState<AuthSession | null>(() => readSession(activePortal))
  const [loading, setLoading] = useState(authMode === 'api' && !!session)
  const [notice, setNotice] = useState('')
  const expire = useCallback((message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') => {
    setSession(null)
    setNotice(message)
    setLoading(false)
  }, [])

  useEffect(() => {
    try {
      if (session) sessionStorage.setItem(storageKey, JSON.stringify(session))
      else sessionStorage.removeItem(storageKey)
    } catch {
      /* The active session can still work without persistence. */
    }
  }, [session, storageKey])

  const token = session?.accessToken
  const portal = session?.portal
  useEffect(() => {
    const onUnauthorized = (event: Event) => {
      if ((event as CustomEvent<string>).detail === token) expire()
    }
    window.addEventListener('smartdronehub:unauthorized', onUnauthorized)
    return () => window.removeEventListener('smartdronehub:unauthorized', onUnauthorized)
  }, [token, expire])

  useEffect(() => {
    if (!token || !portal || authMode !== 'api') return
    let active = true
    const verify = async () => {
      try {
        const user = await apiRequest<AuthUser>('/auth/me', token)
        if (!active) return
        if (!canUsePortal(user, portal)) return expire('Quyền truy cập đã thay đổi. Vui lòng đăng nhập lại.')
        setSession((current) => (current?.accessToken === token ? { ...current, user } : current))
      } catch (error) {
        if (active) expire(errorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    }
    void verify()
    window.addEventListener('focus', verify)
    return () => {
      active = false
      window.removeEventListener('focus', verify)
    }
  }, [token, portal, expire])

  useEffect(() => {
    if (!session) return
    const remaining = Date.parse(session.expiresAt) - Date.now()
    const timer = window.setTimeout(() => expire(), Math.max(0, remaining))
    return () => window.clearTimeout(timer)
  }, [session, expire])

  const login = async (email: string, password: string, selectedPortal: Portal) => {
    if (selectedPortal !== activePortal) throw new Error('Vui lòng sử dụng đúng trang đăng nhập của khu vực này.')
    let next: AuthSession
    if (authMode === 'demo') {
      next = {
        accessToken: `demo-${crypto.randomUUID()}`,
        expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
        user: demoLogin(email, password, selectedPortal),
        portal: selectedPortal,
        mode: 'demo',
      }
    } else {
      if (selectedPortal === 'customer') throw new Error('BE hiện chưa hỗ trợ tài khoản khách hàng.')
      const response = await apiRequest<LoginResponse>('/auth/login', undefined, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (
        !response.accessToken ||
        !Number.isFinite(Date.parse(response.expiresAt)) ||
        Date.parse(response.expiresAt) <= Date.now() ||
        !Array.isArray(response.user?.roles)
      )
        throw new Error('Phản hồi đăng nhập không hợp lệ.')
      if (!canUsePortal(response.user, selectedPortal)) {
        await apiRequest('/auth/logout', response.accessToken, { method: 'POST' }).catch(() => undefined)
        throw new Error('Tài khoản này không có quyền truy cập cổng đã chọn.')
      }
      next = {
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        user: response.user,
        portal: selectedPortal,
        mode: 'api',
      }
    }
    setNotice('')
    setSession(next)
    return next
  }

  const logout = async () => {
    const current = session
    expire('Bạn đã đăng xuất.')
    if (current?.mode === 'api') {
      try {
        await apiRequest('/auth/logout', current.accessToken, { method: 'POST' })
      } catch {
        setNotice('Đã đăng xuất trên thiết bị này. Chưa thể xác nhận thu hồi phiên trên máy chủ do lỗi kết nối.')
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        portal: activePortal,
        session,
        loading,
        notice,
        login,
        logout,
        expire,
        can: (permission) => hasPermission(session?.user, permission),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
