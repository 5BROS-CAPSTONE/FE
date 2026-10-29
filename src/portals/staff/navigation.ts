import type { NavItem } from '@/app/navigation'
export const staffNavigation: NavItem[] = [
  { to: '/staff', label: 'Tổng quan', icon: 'space_dashboard', exact: true },
  { to: '/staff/nhiem-vu', label: 'Nhiệm vụ', icon: 'assignment', roles: ['MANAGER', 'EXPERT', 'OPERATOR'] },
  { to: '/staff/lap-ke-hoach', label: 'Lập kế hoạch', icon: 'calendar_month', roles: ['MANAGER'] },
  {
    to: '/staff/danh-gia-kha-thi',
    label: 'Đánh giá khả thi',
    icon: 'psychology',
    tag: 'DSS',
    roles: ['MANAGER', 'EXPERT'],
  },
  {
    label: 'Đội drone',
    icon: 'flight',
    children: [
      { to: '/staff/uav-profiles', label: 'UAV Profile', permission: 'uav-profile:read' },
      { to: '/staff/drones', label: 'Danh sách drone', permission: 'drone:read' },
    ],
  },
  { to: '/staff/pin', label: 'Pin', icon: 'battery_charging_full', roles: ['TECHNICIAN'] },
  { to: '/staff/khu-vuc-canh-tac', label: 'Khu vực canh tác', icon: 'crop_free', permission: 'area:read' },
  { to: '/staff/quan-ly-phieu', label: 'Quản lý phiếu', icon: 'description', roles: ['MANAGER'] },
  { to: '/staff/du-lieu-moi-truong', label: 'Dữ liệu môi trường', icon: 'thermostat', roles: ['EXPERT', 'ANALYST'] },
  { to: '/staff/bao-cao', label: 'Báo cáo', icon: 'bar_chart', roles: ['MANAGER', 'ANALYST'] },
  { to: '/staff/ho-so', label: 'Hồ sơ của tôi', icon: 'person' },
]
