import { describe, expect, it } from 'vitest'
import { canUsePortal, hasPermission, loginPath, portalPath, staffRoles } from './model'
import { makeUser } from '@/test/dom'

describe('canUsePortal', () => {
  it('lets an admin into the admin portal only', () => {
    const admin = makeUser({ roles: ['ADMIN'] })
    expect(canUsePortal(admin, 'admin')).toBe(true)
    expect(canUsePortal(admin, 'customer')).toBe(false)
  })

  it('lets a customer into the customer portal only', () => {
    const customer = makeUser({ roles: ['CUSTOMER'] })
    expect(canUsePortal(customer, 'customer')).toBe(true)
    expect(canUsePortal(customer, 'admin')).toBe(false)
    expect(canUsePortal(customer, 'staff')).toBe(false)
  })

  it.each(staffRoles)('lets %s into the staff portal but not admin', (role) => {
    const staff = makeUser({ roles: [role] })
    expect(canUsePortal(staff, 'staff')).toBe(true)
    expect(canUsePortal(staff, 'admin')).toBe(false)
  })

  it('refuses every portal once the account is disabled', () => {
    const disabled = makeUser({ roles: ['ADMIN'], status: 'DISABLED' })
    expect(canUsePortal(disabled, 'admin')).toBe(false)
    expect(canUsePortal(disabled, 'staff')).toBe(false)
    expect(canUsePortal(disabled, 'customer')).toBe(false)
  })

  it('refuses a user holding no roles at all', () => {
    const nobody = makeUser({ roles: [] })
    expect(canUsePortal(nobody, 'admin')).toBe(false)
    expect(canUsePortal(nobody, 'staff')).toBe(false)
    expect(canUsePortal(nobody, 'customer')).toBe(false)
  })
})

describe('hasPermission', () => {
  it('grants admins the account permissions', () => {
    const admin = makeUser({ roles: ['ADMIN'] })
    expect(hasPermission(admin, 'user:create')).toBe(true)
    expect(hasPermission(admin, 'user:assign-roles')).toBe(true)
  })

  it('keeps account management away from staff roles', () => {
    expect(hasPermission(makeUser({ roles: ['MANAGER'] }), 'user:create')).toBe(false)
    expect(hasPermission(makeUser({ roles: ['TECHNICIAN'] }), 'user:assign-roles')).toBe(false)
  })

  it('reads a permission from any one of several roles', () => {
    const hybrid = makeUser({ roles: ['OPERATOR', 'TECHNICIAN'] })
    expect(hasPermission(hybrid, 'drone:update')).toBe(true)
    expect(hasPermission(hybrid, 'area:create')).toBe(false)
  })

  it('never grants anything through the CUSTOMER role', () => {
    expect(hasPermission(makeUser({ roles: ['CUSTOMER'] }), 'area:read')).toBe(false)
  })

  it('treats a missing user as unauthorised instead of throwing', () => {
    expect(hasPermission(undefined, 'user:read')).toBe(false)
  })
})

describe('loginPath', () => {
  it('sends customers to the bare login route and staff to a prefixed one', () => {
    expect(loginPath('customer')).toBe('/dang-nhap')
    expect(loginPath('admin')).toBe('/admin/dang-nhap')
    expect(loginPath('staff')).toBe('/staff/dang-nhap')
  })
})

describe('portalPath', () => {
  it('prefixes a relative path with the portal', () => {
    expect(portalPath('staff', 'ho-so')).toBe('/staff/ho-so')
    expect(portalPath('staff', '/ho-so')).toBe('/staff/ho-so')
    expect(portalPath('admin')).toBe('/admin/')
  })

  it('leaves a path that already names a portal untouched', () => {
    expect(portalPath('staff', '/admin/tai-khoan')).toBe('/admin/tai-khoan')
    expect(portalPath('admin', '/dang-nhap')).toBe('/dang-nhap')
    expect(portalPath('admin', '/customer?tab=1')).toBe('/customer?tab=1')
  })

  it('still prefixes a path that merely starts with similar letters', () => {
    expect(portalPath('staff', '/administration')).toBe('/staff/administration')
  })
})
