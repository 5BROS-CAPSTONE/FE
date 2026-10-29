import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { useAuth } from './authContext'
import { authMode, errorMessage } from './api'
import { demoAccounts, demoPassword } from './demoAccounts'
import { canUsePortal, roleLabels, type Portal } from './model'

export default function LoginForm({ portal }: { portal: Portal }) {
  const { notice, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const accounts = demoAccounts.filter((account) => canUsePortal(account, portal))
  const demoAccount = accounts.find((account) => account.email === demoEmail) ?? accounts[0]
  const unavailable = authMode === 'api' && portal === 'customer'

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || unavailable) return
    setBusy(true)
    setError('')
    try {
      const next = await login(email, password, portal)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from?.startsWith(`/${next.portal}/`) || from === `/${next.portal}` ? from : `/${next.portal}`, {
        replace: true,
      })
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-form-content">
      {notice && (
        <p role="status" className="auth-notice">
          {notice}
        </p>
      )}
      {unavailable && (
        <p role="status" className="auth-notice">
          Đăng nhập khách hàng đang có ở bản demo. Máy chủ hiện chỉ hỗ trợ tài khoản nội bộ.
        </p>
      )}
      <form onSubmit={submit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email">Địa chỉ email</label>
          <div className="auth-input-wrap">
            <Icon name="alternate_email" size={19} />
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              disabled={busy || unavailable}
              placeholder="Email của bạn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Mật khẩu</label>
          <div className="auth-input-wrap">
            <Icon name="lock_outline" size={19} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={busy || unavailable}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={19} />
            </button>
          </div>
        </div>
        <p className="auth-help">Quên mật khẩu? Liên hệ quản trị viên để được hỗ trợ.</p>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        <button type="submit" className="site-button auth-submit" disabled={busy || unavailable}>
          <span>{busy ? 'Đang xác thực…' : 'Đăng nhập'}</span>
          <Icon name={busy ? 'hourglass_top' : 'arrow_forward'} size={20} />
        </button>
      </form>
      <p className="auth-secure">
        <Icon name="verified_user" size={15} />
        Không gian riêng. Truy cập theo quyền của bạn.
      </p>
      {authMode === 'demo' && (
        <details className="auth-demo">
          <summary>
            Trải nghiệm bản demo <Icon name="expand_more" size={18} />
          </summary>
          <div>
            <p>
              Tài khoản mẫu · Mật khẩu <strong>{demoPassword}</strong>
            </p>
            {accounts.length > 1 && (
              <select
                aria-label="Tài khoản staff demo"
                value={demoAccount.email}
                onChange={(event) => setDemoEmail(event.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.email}>
                    {roleLabels[account.roles[0]]}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEmail(demoAccount.email)
                setPassword(demoPassword)
                setError('')
              }}
            >
              Điền tài khoản mẫu <Icon name="north_east" size={16} />
            </button>
            <small>{demoAccount.email}</small>
          </div>
        </details>
      )}
    </div>
  )
}
