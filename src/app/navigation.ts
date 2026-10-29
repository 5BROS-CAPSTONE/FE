import { adminNavigation } from '@/portals/admin/navigation'
import { staffNavigation } from '@/portals/staff/navigation'
import { customerNavigation } from '@/portals/customer/navigation'
import { hasPermission, type AppRole, type AuthUser, type Permission, type Portal } from '@/auth/model'

export interface NavLeaf {
  to: string
  label: string
  icon?: string
  tag?: string
  exact?: boolean
  roles?: AppRole[]
  permission?: Permission
}

export interface NavGroup {
  label: string
  icon: string
  children: NavLeaf[]
}

export type NavItem = NavLeaf | NavGroup

export const isGroup = (item: NavItem): item is NavGroup => 'children' in item

export const flattenNavigation = (items: NavItem[]) => items.flatMap((item) => (isGroup(item) ? item.children : [item]))

export function navigationFor(portal: Portal, user?: AuthUser): NavItem[] {
  const items = { admin: adminNavigation, staff: staffNavigation, customer: customerNavigation }[portal]
  const allowed = (item: NavLeaf) =>
    (!item.roles || user?.roles.some((role) => item.roles!.includes(role))) &&
    (!item.permission || hasPermission(user, item.permission))
  return items.reduce<NavItem[]>((result, item) => {
    if (isGroup(item)) {
      const children = item.children.filter(allowed)
      if (children.length) result.push({ ...item, children })
    } else if (allowed(item)) result.push(item)
    return result
  }, [])
}

/** Breadcrumb for the header: [group, leaf] or [leaf] for the current path. */
export function findNavTrail(pathname: string, items: NavItem[]): { group?: NavGroup; leaf: NavLeaf } | null {
  const matches = (leaf: NavLeaf) =>
    leaf.exact ? pathname === leaf.to : pathname === leaf.to || pathname.startsWith(`${leaf.to}/`)
  for (const item of items) {
    if (isGroup(item)) {
      const leaf = item.children.find(matches)
      if (leaf) return { group: item, leaf }
    } else if (matches(item)) {
      return { leaf: item }
    }
  }
  return null
}
