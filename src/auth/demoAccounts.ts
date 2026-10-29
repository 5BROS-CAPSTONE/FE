import { type AuthUser, type Portal, canUsePortal } from './model'

// Public fixture credentials. These are only used when VITE_AUTH_MODE=demo.
export const demoPassword = 'Demo@123'
const createdAt = '2026-10-01T00:00:00.000Z'
export const demoAccounts: AuthUser[] = [
  {
    id: 'demo-admin',
    email: 'admin@5bros.demo',
    fullName: 'Quản trị 5BROS',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-manager',
    email: 'manager@5bros.demo',
    fullName: 'Trần Minh Quân',
    roles: ['MANAGER'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-expert',
    email: 'expert@5bros.demo',
    fullName: 'Lê Hoàng Anh',
    roles: ['EXPERT'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-operator',
    email: 'operator@5bros.demo',
    fullName: 'Phạm Quốc Huy',
    roles: ['OPERATOR'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-technician',
    email: 'technician@5bros.demo',
    fullName: 'Võ Minh Thành',
    roles: ['TECHNICIAN'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-analyst',
    email: 'analyst@5bros.demo',
    fullName: 'Nguyễn Ngọc Linh',
    roles: ['ANALYST'],
    status: 'ACTIVE',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'demo-customer',
    email: 'customer@5bros.demo',
    fullName: 'Nguyễn Văn An',
    roles: ['CUSTOMER'],
    status: 'ACTIVE',
    customerId: 'KH-0928',
    createdAt,
    updatedAt: createdAt,
  },
]

export function demoLogin(email: string, password: string, portal: Portal) {
  const user = demoAccounts.find((account) => account.email === email.trim().toLowerCase())
  if (!user || password !== demoPassword) throw new Error('Email hoặc mật khẩu không chính xác.')
  if (!canUsePortal(user, portal)) throw new Error('Tài khoản này không có quyền truy cập cổng đã chọn.')
  return structuredClone(user)
}
