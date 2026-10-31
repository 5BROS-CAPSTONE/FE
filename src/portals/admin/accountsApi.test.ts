import { beforeEach, describe, expect, it } from 'vitest'
import {
  backendRoles,
  createAccount,
  listAccounts,
  newAccountProblem,
  passwordMaxBytes,
  passwordMinLength,
  passwordProblem,
  resetDemoStore,
  updateAccount,
} from './accountsApi'

const good = {
  email: 'nhanvien@5bros.local',
  fullName: 'Nguyễn Văn A',
  password: 'MatKhau@123',
  roles: ['MANAGER'] as const,
}

describe('passwordProblem', () => {
  it('đòi đủ độ dài tối thiểu', () => {
    expect(passwordProblem('a'.repeat(passwordMinLength - 1))).toContain(String(passwordMinLength))
    expect(passwordProblem('a'.repeat(passwordMinLength))).toBeNull()
  })

  it('đếm theo byte UTF-8 chứ không theo ký tự', () => {
    // Mỗi chữ cái có dấu chiếm nhiều hơn một byte, nên chuỗi ngắn vẫn có thể vượt giới hạn.
    const vietnamese = 'ế'.repeat(30)
    expect(vietnamese.length).toBeLessThan(passwordMaxBytes)
    expect(new TextEncoder().encode(vietnamese).length).toBeGreaterThan(passwordMaxBytes)
    expect(passwordProblem(vietnamese)).toContain('byte')
  })

  it('chấp nhận chuỗi dài đúng bằng giới hạn', () => {
    expect(passwordProblem('a'.repeat(passwordMaxBytes))).toBeNull()
    expect(passwordProblem('a'.repeat(passwordMaxBytes + 1))).toContain('byte')
  })
})

describe('newAccountProblem', () => {
  it('cho qua tài khoản hợp lệ', () => {
    expect(newAccountProblem({ ...good, roles: [...good.roles] })).toBeNull()
  })

  it.each([
    ['email trống', { email: '  ' }, 'email'],
    ['email sai định dạng', { email: 'khong-phai-email' }, 'định dạng'],
    ['thiếu họ tên', { fullName: '   ' }, 'họ và tên'],
    ['chưa chọn vai trò', { roles: [] }, 'vai trò'],
    ['chọn hai vai trò', { roles: ['MANAGER' as const, 'ANALYST' as const] }, 'vai trò'],
    ['mật khẩu quá ngắn', { password: 'abc' }, 'ký tự'],
  ])('bắt được %s', (_name, patch, phrase) => {
    const problem = newAccountProblem({ ...good, roles: [...good.roles], ...patch })
    expect(problem?.toLowerCase()).toContain(phrase)
  })

  it('báo lỗi email trước khi báo lỗi mật khẩu', () => {
    const problem = newAccountProblem({ ...good, roles: [...good.roles], email: '', password: 'x' })
    expect(problem?.toLowerCase()).toContain('email')
  })
})

describe('đúng một vai trò mỗi tài khoản', () => {
  // BPMN "S5 - Người dùng & Phân quyền / Phân quyền" ghi rõ bước "Chọn 1 role".
  it('nhận đúng một vai trò', () => {
    expect(newAccountProblem({ ...good, roles: ['OPERATOR'] })).toBeNull()
  })

  it('từ chối nhiều hơn một vai trò', () => {
    expect(newAccountProblem({ ...good, roles: ['OPERATOR', 'MANAGER'] })).toBe('Chọn một vai trò.')
  })
})

describe('backendRoles', () => {
  it('liệt kê đúng sáu vai trò backend và không có CUSTOMER', () => {
    expect(backendRoles).toEqual(['ADMIN', 'MANAGER', 'EXPERT', 'OPERATOR', 'TECHNICIAN', 'ANALYST'])
  })
})

describe('chế độ demo', () => {
  beforeEach(resetDemoStore)

  it('không liệt kê tài khoản khách hàng', async () => {
    const result = await listAccounts('demo', undefined, { search: '', status: '', page: 0, size: 20 })
    expect(result.items.every((user) => !user.roles.includes('CUSTOMER'))).toBe(true)
  })

  it('tài khoản vừa tạo xuất hiện trong danh sách', async () => {
    await createAccount('demo', undefined, { ...good, roles: [...good.roles] })
    const result = await listAccounts('demo', undefined, { search: 'nhanvien', status: '', page: 0, size: 20 })
    expect(result.items.map((user) => user.email)).toContain(good.email)
  })

  it('từ chối email đã tồn tại, không phân biệt hoa thường', async () => {
    await createAccount('demo', undefined, { ...good, roles: [...good.roles] })
    await expect(
      createAccount('demo', undefined, { ...good, roles: [...good.roles], email: 'NHANVIEN@5bros.local' }),
    ).rejects.toThrow(/đã được cấp/)
  })

  it('lọc theo trạng thái sau khi khóa một tài khoản', async () => {
    const created = await createAccount('demo', undefined, { ...good, roles: [...good.roles] })
    await updateAccount('demo', undefined, created.id, {
      email: created.email,
      fullName: created.fullName,
      status: 'DISABLED',
    })
    const disabled = await listAccounts('demo', undefined, { search: '', status: 'DISABLED', page: 0, size: 20 })
    expect(disabled.items.map((user) => user.id)).toContain(created.id)
    const active = await listAccounts('demo', undefined, { search: '', status: 'ACTIVE', page: 0, size: 20 })
    expect(active.items.map((user) => user.id)).not.toContain(created.id)
  })
})
