import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppLayout from './AppLayout'
import { installMatchMedia, renderWorkspace, setDesktop } from '@/test/dom'

// gsap drives the page transition off a real layout, which jsdom has none of.
vi.mock('@/motion/PageTransition', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// The drawer carries aria-hidden while closed, which keeps it out of the
// accessibility tree, so it is queried by id rather than by role.
const drawer = () => document.getElementById('workspace-navigation') as HTMLElement
const isClosed = () => drawer().className.includes('-translate-x-full')
const overlay = () => screen.queryByRole('button', { name: 'Đóng menu' })

describe('AppLayout drawer', () => {
  beforeEach(() => installMatchMedia(false))

  it('starts closed and inert on mobile', () => {
    render(renderWorkspace(<AppLayout portal="admin" />))

    expect(isClosed()).toBe(true)
    expect(drawer().hasAttribute('inert')).toBe(true)
    expect(drawer().getAttribute('aria-hidden')).toBe('true')
    expect(drawer().getAttribute('role')).toBe('dialog')
  })

  it('opens from the header button and locks background scrolling', async () => {
    render(renderWorkspace(<AppLayout portal="admin" />))

    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }))

    expect(isClosed()).toBe(false)
    expect(drawer().hasAttribute('inert')).toBe(false)
    expect(drawer().getAttribute('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes on Escape, restores scrolling and returns focus to the opener', async () => {
    render(renderWorkspace(<AppLayout portal="admin" />))
    const opener = screen.getByRole('button', { name: 'Mở menu' })
    await userEvent.click(opener)

    await userEvent.keyboard('{Escape}')

    expect(isClosed()).toBe(true)
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
  })

  it('closes when the overlay is clicked', async () => {
    render(renderWorkspace(<AppLayout portal="admin" />))
    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }))

    await userEvent.click(overlay() as HTMLElement)

    expect(isClosed()).toBe(true)
    expect(document.body.style.overflow).toBe('')
  })

  /**
   * Regression guard: the reset used to run as setMenuOpen() inside an effect,
   * which cascaded an extra render on every breakpoint change. It now happens
   * during render, and the drawer must still be closed after going back down to
   * mobile rather than reappearing.
   */
  it('drops the open drawer when the viewport grows to desktop', async () => {
    render(renderWorkspace(<AppLayout portal="admin" />))
    await userEvent.click(screen.getByRole('button', { name: 'Mở menu' }))
    expect(document.body.style.overflow).toBe('hidden')

    setDesktop(true)

    expect(drawer().getAttribute('role')).toBe('complementary')
    expect(drawer().getAttribute('aria-modal')).toBeNull()
    expect(drawer().hasAttribute('inert')).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(overlay()).toBeNull()

    setDesktop(false)

    expect(isClosed()).toBe(true)
    expect(overlay()).toBeNull()
  })
})
