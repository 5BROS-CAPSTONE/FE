import type { NavItem } from '@/app/navigation'
export const customerNavigation: NavItem[] = [
  { to: '/customer', label: 'Tổng quan', icon: 'space_dashboard', exact: true },
  { to: '/customer/khu-vuc-canh-tac', label: 'Khu vực canh tác của tôi', icon: 'crop_free' },
  { to: '/customer/quan-ly-phieu', label: 'Phiếu yêu cầu của tôi', icon: 'description' },
  { to: '/customer/ho-so', label: 'Hồ sơ của tôi', icon: 'person' },
]
