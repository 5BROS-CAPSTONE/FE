import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './authContext'
import { apiRequest, errorMessage } from './api'
import { roleLabels, loginPath } from './model'
import { LabeledValue, Panel, inputClass, labelClass, Notice, PageIntro } from '@/features/operations/OperationUi'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const { session, expire } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!session) return null
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || session.mode !== 'api') return
    if (newPassword !== confirmation) return setError('Xác nhận mật khẩu chưa khớp.')
    if (newPassword.length < 8 || new TextEncoder().encode(newPassword).length > 72)
      return setError('Mật khẩu mới cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.')
    setBusy(true)
    setError('')
    try {
      await apiRequest('/auth/password', session.accessToken, {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      expire('Đã đổi mật khẩu. Vui lòng đăng nhập lại bằng mật khẩu mới.')
      navigate(loginPath(session.portal), { replace: true })
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageIntro eyebrow="Tài khoản" title="Hồ sơ của tôi" description="Thông tin tài khoản và bảo mật đăng nhập." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Thông tin cá nhân">
          <dl className="grid gap-6 p-5 sm:grid-cols-2">
            <LabeledValue label="Họ và tên" value={session.user.fullName} />
            <LabeledValue label="Email" value={session.user.email} />
            <LabeledValue
              label="Vai trò"
              value={session.user.roles.map((role) => roleLabels[role] ?? role).join(', ')}
            />
            <LabeledValue label="Trạng thái" value="Đang hoạt động" />
          </dl>
        </Panel>
        <Panel title="Đổi mật khẩu">
          <form className="space-y-4 p-5" onSubmit={submit}>
            {session.mode === 'demo' && (
              <Notice>
                Đổi mật khẩu khả dụng khi kết nối API. Tài khoản demo dùng mật khẩu mẫu trên trang đăng nhập.
              </Notice>
            )}
            {[
              {
                id: 'current-password',
                label: 'Mật khẩu hiện tại',
                value: currentPassword,
                setter: setCurrentPassword,
                autoComplete: 'current-password',
              },
              {
                id: 'new-password',
                label: 'Mật khẩu mới',
                value: newPassword,
                setter: setNewPassword,
                autoComplete: 'new-password',
              },
              {
                id: 'confirm-password',
                label: 'Xác nhận mật khẩu mới',
                value: confirmation,
                setter: setConfirmation,
                autoComplete: 'new-password',
              },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className={labelClass}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type="password"
                  autoComplete={field.autoComplete}
                  className={inputClass}
                  required
                  disabled={busy || session.mode === 'demo'}
                  value={field.value}
                  onChange={(event) => field.setter(event.target.value)}
                />
              </div>
            ))}
            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy || session.mode === 'demo'}>
              {busy ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
            </Button>
            <p className="text-xs text-on-surface-variant">
              Đổi mật khẩu thành công sẽ đăng xuất mọi phiên của tài khoản.
            </p>
          </form>
        </Panel>
      </div>
    </>
  )
}
