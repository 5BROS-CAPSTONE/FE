import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { ApiError, apiRequest, errorMessage } from '@/auth/api'
import { demoAccounts } from '@/auth/demoAccounts'
import { roleLabels, type AuthUser } from '@/auth/model'
import { inputClass, Notice, PageIntro, Panel, tableClass, tdClass, thClass } from '@/features/operations/OperationUi'
import Button from '@/components/ui/Button'

interface AccountPage {
  items: AuthUser[]
  totalElements: number
  totalPages: number
}
export default function AccountsPage() {
  const { session, expire } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<AccountPage>({ items: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const token = session?.accessToken
  const mode = session?.mode
  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        let next: AccountPage
        if (mode === 'demo') {
          const users = demoAccounts.filter(
            (user) =>
              !user.roles.includes('CUSTOMER') &&
              `${user.email} ${user.fullName}`.toLowerCase().includes(search.toLowerCase()) &&
              (!status || user.status === status),
          )
          next = { items: users, totalElements: users.length, totalPages: 1 }
        } else {
          const query = new URLSearchParams({ search, page: String(page), size: '20' })
          if (status) query.set('status', status)
          next = await apiRequest<AccountPage>(`/users?${query}`, token)
        }
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
  return (
    <>
      <PageIntro
        eyebrow="Quản trị"
        title="Tài khoản nội bộ"
        description="Tra cứu tài khoản, trạng thái và vai trò đã được cấp."
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
        </div>
        {error ? (
          <div className="px-4">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  {['Họ và tên', 'Email', 'Vai trò', 'Trạng thái'].map((label) => (
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
        )}
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
    </>
  )
}
