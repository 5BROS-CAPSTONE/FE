import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { ApiError, errorMessage } from '@/auth/api'
import { roleLabels, type AuthUser, type BackendRole } from '@/auth/model'
import { inputClass, Notice, PageIntro, Panel, tableClass, tdClass, thClass } from '@/features/operations/OperationUi'
import Button from '@/components/ui/Button'
import { CreateAccountDialog, EditAccountDialog, PasswordDialog, RolesDialog } from './AccountDialogs'
import {
  assignRoles,
  createAccount,
  listAccounts,
  resetAccountPassword,
  updateAccount,
  type AccountEdit,
  type AccountPage,
  type NewAccount,
} from './accountsApi'

type Dialog = { kind: 'create' } | { kind: 'edit' | 'roles' | 'password'; user: AuthUser }

export default function AccountsPage() {
  const { session, expire } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<AccountPage>({ items: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [reload, setReload] = useState(0)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [busy, setBusy] = useState(false)
  const token = session?.accessToken
  const mode = session?.mode ?? 'demo'

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const next = await listAccounts(mode, token, { search, status, page, size: 20 })
        if (active) setResult(next)
      } catch (failure) {
        if (active) {
          if (failure instanceof ApiError && failure.status === 401) expire()
          else setError(errorMessage(failure))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    const timer = window.setTimeout(load, 200)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [search, status, page, token, mode, reload, expire])

  // Mọi thao tác ghi đi qua đây để chỉ có một chỗ xử lý lỗi, phiên hết hạn và tải lại danh sách.
  const run = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true)
    setError('')
    setDone('')
    try {
      await action()
      setDialog(null)
      setDone(message)
      setReload((value) => value + 1)
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expire()
      else setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  const submitCreate = (account: NewAccount) =>
    run(() => createAccount(mode, token, account), `Đã cấp tài khoản cho ${account.email.trim()}.`)

  const submitEdit = (user: AuthUser, edit: AccountEdit) =>
    run(() => updateAccount(mode, token, user.id, edit), 'Đã lưu thay đổi tài khoản.')

  const submitRoles = (user: AuthUser, roles: BackendRole[]) =>
    run(() => assignRoles(mode, token, user.id, roles), `Đã cập nhật vai trò cho ${user.fullName}.`)

  const submitPassword = (user: AuthUser, password: string) =>
    run(() => resetAccountPassword(mode, token, user.id, password), `Đã đặt lại mật khẩu cho ${user.email}.`)

  return (
    <>
      <PageIntro
        eyebrow="Quản trị"
        title="Tài khoản nội bộ"
        description="Cấp tài khoản cho nhân viên, đổi vai trò, đặt lại mật khẩu và khóa tài khoản."
      />
      <Panel title="Danh sách tài khoản" aside={`${result.totalElements} tài khoản`}>
        <div className="flex flex-wrap gap-3 p-4">
          <input
            aria-label="Tìm tài khoản"
            className={`${inputClass} !w-auto min-w-[220px] flex-1`}
            maxLength={120}
            placeholder="Tìm theo tên hoặc email…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
          />
          <select
            aria-label="Lọc trạng thái tài khoản"
            className={`${inputClass} !w-auto`}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(0)
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="DISABLED">Đã khóa</option>
          </select>
          <Button variant="outline" onClick={() => setReload((value) => value + 1)}>
            Tải lại
          </Button>
          <Button onClick={() => setDialog({ kind: 'create' })}>Cấp tài khoản</Button>
        </div>
        {(error || done) && (
          <div className="px-4 pb-2">
            <Notice tone={error ? 'error' : 'info'}>{error || done}</Notice>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                {['Họ và tên', 'Email', 'Vai trò', 'Trạng thái', 'Thao tác'].map((label) => (
                  <th key={label} className={thClass}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                result.items.map((user) => (
                  <tr key={user.id}>
                    <td className={tdClass}>{user.fullName}</td>
                    <td className={tdClass}>{user.email}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="rounded-md bg-primary-fixed/20 px-2 py-1 text-xs font-semibold text-primary"
                          >
                            {roleLabels[role] ?? role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={tdClass}>{user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setDialog({ kind: 'edit', user })}>
                          Sửa
                        </Button>
                        <Button variant="outline" onClick={() => setDialog({ kind: 'roles', user })}>
                          Vai trò
                        </Button>
                        <Button variant="danger-outline" onClick={() => setDialog({ kind: 'password', user })}>
                          Mật khẩu
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && (
            <p role="status" className="p-5 text-center text-sm">
              Đang tải tài khoản…
            </p>
          )}
          {!loading && !result.items.length && (
            <p className="p-5 text-center text-sm text-on-surface-variant">Không có tài khoản phù hợp.</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant/30 p-4">
          <Button variant="outline" disabled={loading || page === 0} onClick={() => setPage((value) => value - 1)}>
            Trước
          </Button>
          <span className="text-sm">
            Trang {page + 1} / {Math.max(1, result.totalPages)}
          </span>
          <Button
            variant="outline"
            disabled={loading || page + 1 >= result.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Sau
          </Button>
        </div>
      </Panel>
      {dialog?.kind === 'create' && (
        <CreateAccountDialog busy={busy} onClose={() => setDialog(null)} onSubmit={submitCreate} />
      )}
      {dialog?.kind === 'edit' && (
        <EditAccountDialog
          user={dialog.user}
          busy={busy}
          onClose={() => setDialog(null)}
          onSubmit={(edit) => submitEdit(dialog.user, edit)}
        />
      )}
      {dialog?.kind === 'roles' && (
        <RolesDialog
          user={dialog.user}
          busy={busy}
          onClose={() => setDialog(null)}
          onSubmit={(roles) => submitRoles(dialog.user, roles)}
        />
      )}
      {dialog?.kind === 'password' && (
        <PasswordDialog
          user={dialog.user}
          busy={busy}
          onClose={() => setDialog(null)}
          onSubmit={(password) => submitPassword(dialog.user, password)}
        />
      )}
    </>
  )
}
