import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthContext, type AuthStore } from '@/auth/authContext'
import { FleetContext } from '@/store/fleetContext'
import type { FleetStore } from '@/store/fleetContext'
import type { AuthSession, AuthUser, Portal } from '@/auth/model'

let matches = false
const listeners = new Set<() => void>()

/** jsdom ships no layout engine, so window.matchMedia has to be stubbed. */
export function installMatchMedia(desktop = false) {
  matches = desktop
  listeners.clear()
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return matches
    },
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => void listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => void listeners.delete(listener),
    addListener: (listener: () => void) => void listeners.add(listener),
    removeListener: (listener: () => void) => void listeners.delete(listener),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

/** Crosses the breakpoint the way a real resize would, notifying subscribers. */
export function setDesktop(desktop: boolean) {
  act(() => {
    matches = desktop
    listeners.forEach((listener) => listener())
  })
}

export function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  const timestamp = '2026-10-01T00:00:00.000Z'
  return {
    id: 'user-1',
    email: 'admin@5bros.demo',
    fullName: 'Quản trị 5BROS',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  }
}

function makeSession(portal: Portal): AuthSession {
  return {
    accessToken: 'test-token',
    expiresAt: '2099-01-01T00:00:00.000Z',
    user: makeUser(),
    portal,
    mode: 'demo',
  }
}

/**
 * Renders a workspace subtree with the two contexts AppLayout reaches for.
 * Only the fields under test are real; the rest of each store stays absent on
 * purpose, so a component quietly growing a new dependency fails loudly here.
 */
export function renderWorkspace(ui: ReactNode, { portal = 'admin' as Portal, route = '/admin' } = {}) {
  const auth = {
    portal,
    session: makeSession(portal),
    loading: false,
    notice: '',
    login: async () => makeSession(portal),
    logout: async () => {},
    expire: () => {},
    can: () => true,
  } satisfies AuthStore

  const fleet = { toast: null } as unknown as FleetStore

  return (
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={auth}>
        <FleetContext.Provider value={fleet}>{ui}</FleetContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}
