import { apiRequest } from '@/auth/api'
import { demoAccounts } from '@/auth/demoAccounts'
import { staffRoles, type AuthUser, type BackendRole } from '@/auth/model'

export const backendRoles: BackendRole[] = ['ADMIN', ...staffRoles]

// Giữ khớp với PasswordPolicy bên backend. Lệch hai con số này thì người dùng
// điền xong mới biết sai, mà lỗi lại hiện bằng tiếng Anh từ máy chủ.
export const passwordMinLength = 8
export const passwordMaxBytes = 72

export interface AccountPage {
  items: AuthUser[]
  totalElements: number
  totalPages: number
}

export interface AccountQuery {
  search: string
  status: string
  page: number
  size: number
}

export interface NewAccount {
  email: string
  fullName: string
  password: string
  roles: BackendRole[]
}

export interface AccountEdit {
  email: string
  fullName: string
  status: AuthUser['status']
}

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length

/** Trả về lời giải thích đầu tiên tìm được, hoặc null khi mật khẩu dùng được. */
export function passwordProblem(password: string): string | null {
  if (password.length < passwordMinLength) return `Mật khẩu cần ít nhất ${passwordMinLength} ký tự.`
  if (utf8Bytes(password) > passwordMaxBytes) return `Mật khẩu quá dài, tối đa ${passwordMaxBytes} byte UTF-8.`
  return null
}

/** Kiểm tra tại chỗ trước khi gọi máy chủ. Backend vẫn kiểm lại, đây chỉ để phản hồi nhanh. */
export function newAccountProblem(account: NewAccount): string | null {
  if (!account.email.trim()) return 'Chưa nhập email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim())) return 'Email không đúng định dạng.'
  if (!account.fullName.trim()) return 'Chưa nhập họ và tên.'
  if (account.roles.length !== 1) return 'Chọn một vai trò.'
  return passwordProblem(account.password)
}

// Chế độ demo không có máy chủ, nên giữ một bản sao trong bộ nhớ để các thao tác
// tạo và sửa hiện ra ngay. Dữ liệu mất khi tải lại trang, đúng tính chất bản demo.
let demoStore: AuthUser[] = demoAccounts.filter((user) => !user.roles.includes('CUSTOMER'))

export function resetDemoStore() {
  demoStore = demoAccounts.filter((user) => !user.roles.includes('CUSTOMER'))
}

const now = () => new Date().toISOString()

const demoFind = (id: string) => {
  const user = demoStore.find((item) => item.id === id)
  if (!user) throw new Error('Không tìm thấy tài khoản trong dữ liệu demo.')
  return user
}

const demoReplace = (id: string, patch: Partial<AuthUser>) => {
  const updated = { ...demoFind(id), ...patch, updatedAt: now() }
  demoStore = demoStore.map((item) => (item.id === id ? updated : item))
  return updated
}

export async function listAccounts(mode: string, token: string | undefined, query: AccountQuery): Promise<AccountPage> {
  if (mode === 'demo') {
    const keyword = query.search.trim().toLowerCase()
    const items = demoStore.filter(
      (user) =>
        `${user.email} ${user.fullName}`.toLowerCase().includes(keyword) &&
        (!query.status || user.status === query.status),
    )
    return { items, totalElements: items.length, totalPages: 1 }
  }
  const params = new URLSearchParams({ search: query.search, page: String(query.page), size: String(query.size) })
  if (query.status) params.set('status', query.status)
  return apiRequest<AccountPage>(`/users?${params}`, token)
}

export async function createAccount(mode: string, token: string | undefined, account: NewAccount): Promise<AuthUser> {
  if (mode === 'demo') {
    const email = account.email.trim().toLowerCase()
    if (demoStore.some((user) => user.email.toLowerCase() === email))
      throw new Error('Email này đã được cấp cho một tài khoản khác.')
    const created: AuthUser = {
      id: `demo-${Date.now()}`,
      email,
      fullName: account.fullName.trim(),
      roles: account.roles,
      status: 'ACTIVE',
      createdAt: now(),
      updatedAt: now(),
    }
    demoStore = [created, ...demoStore]
    return created
  }
  return apiRequest<AuthUser>('/users', token, {
    method: 'POST',
    body: JSON.stringify({
      email: account.email.trim(),
      fullName: account.fullName.trim(),
      password: account.password,
      roles: account.roles,
    }),
  })
}

export async function updateAccount(
  mode: string,
  token: string | undefined,
  id: string,
  edit: AccountEdit,
): Promise<AuthUser> {
  if (mode === 'demo')
    return demoReplace(id, {
      email: edit.email.trim().toLowerCase(),
      fullName: edit.fullName.trim(),
      status: edit.status,
    })
  return apiRequest<AuthUser>(`/users/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify({ email: edit.email.trim(), fullName: edit.fullName.trim(), status: edit.status }),
  })
}

export async function assignRoles(
  mode: string,
  token: string | undefined,
  id: string,
  roles: BackendRole[],
): Promise<AuthUser> {
  if (mode === 'demo') return demoReplace(id, { roles })
  return apiRequest<AuthUser>(`/users/${id}/roles`, token, { method: 'PUT', body: JSON.stringify({ roles }) })
}

export async function resetAccountPassword(
  mode: string,
  token: string | undefined,
  id: string,
  password: string,
): Promise<AuthUser> {
  if (mode === 'demo') return demoReplace(id, {})
  return apiRequest<AuthUser>(`/users/${id}/password`, token, { method: 'PUT', body: JSON.stringify({ password }) })
}
