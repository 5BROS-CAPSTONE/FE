export type Portal = 'admin' | 'staff' | 'customer'
export const loginPath = (portal: Portal) => (portal === 'customer' ? '/dang-nhap' : `/${portal}/dang-nhap`)
export const staffRoles = ['MANAGER', 'EXPERT', 'OPERATOR', 'TECHNICIAN', 'ANALYST'] as const
export type BackendRole = 'ADMIN' | (typeof staffRoles)[number]
export type AppRole = BackendRole | 'CUSTOMER'
export type Permission =
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:assign-roles'
  | 'area:read'
  | 'area:create'
  | 'area:update'
  | 'uav-profile:read'
  | 'uav-profile:create'
  | 'uav-profile:update'
  | 'drone:read'
  | 'drone:create'
  | 'drone:update'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  roles: AppRole[]
  status: 'ACTIVE' | 'DISABLED'
  createdAt: string
  updatedAt: string
  customerId?: string
}

export interface AuthSession {
  accessToken: string
  expiresAt: string
  user: AuthUser
  portal: Portal
  mode: 'demo' | 'api'
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  expiresAt: string
  user: AuthUser
}

export const portalInfo: Record<Portal, { label: string; shortLabel: string; icon: string; description: string }> = {
  admin: {
    label: 'Cổng quản trị',
    shortLabel: 'Quản trị',
    icon: 'admin_panel_settings',
    description: 'Quản lý tài khoản và quyền truy cập hệ thống.',
  },
  staff: {
    label: 'Cổng nhân viên',
    shortLabel: 'Staff',
    icon: 'engineering',
    description: 'Điều phối hoạt động và quản lý đội bay nông nghiệp.',
  },
  customer: {
    label: 'Cổng khách hàng',
    shortLabel: 'Khách hàng',
    icon: 'agriculture',
    description: 'Quản lý khu vực canh tác và theo dõi phiếu yêu cầu.',
  },
}

export const roleLabels: Record<AppRole, string> = {
  ADMIN: 'Quản trị hệ thống',
  MANAGER: 'Quản lý vận hành',
  EXPERT: 'Chuyên gia an toàn',
  OPERATOR: 'Điều khiển drone',
  TECHNICIAN: 'Kỹ thuật viên bảo trì',
  ANALYST: 'Chuyên viên phân tích',
  CUSTOMER: 'Khách hàng',
}

export const rolePermissions: Record<BackendRole, Permission[]> = {
  ADMIN: [
    'user:read',
    'user:create',
    'user:update',
    'user:assign-roles',
    'area:read',
    'area:create',
    'area:update',
    'uav-profile:read',
    'uav-profile:create',
    'uav-profile:update',
    'drone:read',
    'drone:create',
    'drone:update',
  ],
  MANAGER: ['area:read', 'area:create', 'area:update', 'uav-profile:read', 'drone:read'],
  EXPERT: ['uav-profile:read', 'uav-profile:create', 'uav-profile:update'],
  OPERATOR: [],
  TECHNICIAN: ['uav-profile:read', 'drone:read', 'drone:create', 'drone:update'],
  ANALYST: [],
}

export function canUsePortal(user: AuthUser, portal: Portal) {
  if (user.status !== 'ACTIVE') return false
  if (portal === 'admin') return user.roles.includes('ADMIN')
  if (portal === 'customer') return user.roles.includes('CUSTOMER')
  return user.roles.some((role) => (staffRoles as readonly string[]).includes(role))
}

export function hasPermission(user: AuthUser | undefined, permission: Permission) {
  return user?.roles.some((role) => role !== 'CUSTOMER' && rolePermissions[role]?.includes(permission)) ?? false
}

export function portalPath(portal: Portal, path = '') {
  if (/^\/(admin|staff|customer|dang-nhap)(\/|\?|$)/.test(path)) return path
  return `/${portal}${path.startsWith('/') ? path : `/${path}`}`
}
