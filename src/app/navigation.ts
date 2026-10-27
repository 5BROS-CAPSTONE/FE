/**
 * Sidebar menu. Add a module here and register its pages in `routes.tsx`;
 * a menu item without routes automatically shows the "coming soon" page.
 */
export interface NavLeaf {
  to: string
  label: string
  icon?: string
  tag?: string
}

export interface NavGroup {
  label: string
  icon: string
  children: NavLeaf[]
}

export type NavItem = NavLeaf | NavGroup

export const isGroup = (item: NavItem): item is NavGroup => 'children' in item

export const navigation: NavItem[] = [
  { to: '/nhiem-vu', label: 'Nhiệm vụ', icon: 'assignment' },
  { to: '/lap-ke-hoach', label: 'Lập kế hoạch', icon: 'calendar_month' },
  { to: '/danh-gia-kha-thi', label: 'Đánh giá khả thi', icon: 'psychology', tag: 'DSS' },
  {
    label: 'Đội drone',
    icon: 'flight',
    children: [
      { to: '/uav-profiles', label: 'UAV Profile' },
      { to: '/drones', label: 'Danh sách drone' },
    ],
  },
  { to: '/pin', label: 'Pin', icon: 'battery_charging_full' },
  { to: '/khu-vuc-canh-tac', label: 'Khu vực canh tác', icon: 'crop_free' },
  { to: '/du-lieu-moi-truong', label: 'Dữ liệu môi trường', icon: 'thermostat' },
  { to: '/bao-cao', label: 'Báo cáo', icon: 'bar_chart' },
  { to: '/cau-hinh', label: 'Cấu hình', icon: 'settings' },
]

/** All menu leaves, flattened. */
export const navLeaves: NavLeaf[] = navigation.flatMap((item) => (isGroup(item) ? item.children : [item]))

/** Breadcrumb for the header: [group, leaf] or [leaf] for the current path. */
export function findNavTrail(pathname: string): { group?: NavGroup; leaf: NavLeaf } | null {
  for (const item of navigation) {
    if (isGroup(item)) {
      const leaf = item.children.find((c) => pathname.startsWith(c.to))
      if (leaf) return { group: item, leaf }
    } else if (pathname.startsWith(item.to)) {
      return { leaf: item }
    }
  }
  return null
}
