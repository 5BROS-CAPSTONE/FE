import type { NavItem } from '@/app/navigation'
export const adminNavigation: NavItem[] = [
  { to: '/admin', label: 'Tổng quan', icon: 'space_dashboard', exact: true },
  { to: '/admin/tai-khoan', label: 'Tài khoản nội bộ', icon: 'manage_accounts' },
  { to: '/admin/vai-tro', label: 'Vai trò và quyền', icon: 'verified_user' },
  { to: '/admin/ho-so', label: 'Hồ sơ của tôi', icon: 'person' },
]
