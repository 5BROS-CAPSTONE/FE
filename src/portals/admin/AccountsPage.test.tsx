import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { installMatchMedia, renderWorkspace } from '@/test/dom'
import { resetDemoStore } from './accountsApi'
import AccountsPage from './AccountsPage'

const openCreateDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Cấp tài khoản' }))
  return screen.getByRole('dialog')
}

describe('AccountsPage', () => {
  beforeEach(() => {
    installMatchMedia(true)
    resetDemoStore()
  })

  it('hiện danh sách tài khoản nội bộ và không có khách hàng', async () => {
    render(renderWorkspace(<AccountsPage />))
    expect(await screen.findByText('admin@5bros.demo')).toBeTruthy()
    expect(screen.queryByText(/khachhang/i)).toBeNull()
  })

  it('chặn gửi khi chưa chọn vai trò, và không đóng hộp thoại', async () => {
    const user = userEvent.setup()
    render(renderWorkspace(<AccountsPage />))
    await screen.findByText('admin@5bros.demo')

    const dialog = await openCreateDialog(user)
    await user.type(within(dialog).getByLabelText('Email'), 'moi@5bros.local')
    await user.type(within(dialog).getByLabelText('Họ và tên'), 'Người Mới')
    await user.type(within(dialog).getByLabelText('Mật khẩu'), 'MatKhau@123')
    await user.click(within(dialog).getByRole('button', { name: 'Cấp tài khoản' }))

    expect(within(dialog).getByText('Chọn một vai trò.')).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('báo mật khẩu quá ngắn trước khi gọi máy chủ', async () => {
    const user = userEvent.setup()
    render(renderWorkspace(<AccountsPage />))
    await screen.findByText('admin@5bros.demo')

    const dialog = await openCreateDialog(user)
    await user.type(within(dialog).getByLabelText('Email'), 'moi@5bros.local')
    await user.type(within(dialog).getByLabelText('Họ và tên'), 'Người Mới')
    await user.type(within(dialog).getByLabelText('Mật khẩu'), 'ngan')
    await user.click(within(dialog).getByLabelText('Quản lý vận hành'))
    await user.click(within(dialog).getByRole('button', { name: 'Cấp tài khoản' }))

    // Khớp nguyên văn: phần ghi chú phía dưới cũng nhắc tới số 8 ký tự.
    expect(within(dialog).getByText('Mật khẩu cần ít nhất 8 ký tự.')).toBeTruthy()
  })

  it('chỉ giữ một vai trò: chọn vai trò sau thì bỏ vai trò trước', async () => {
    const user = userEvent.setup()
    render(renderWorkspace(<AccountsPage />))
    await screen.findByText('admin@5bros.demo')

    const dialog = await openCreateDialog(user)
    await user.click(within(dialog).getByLabelText('Quản lý vận hành'))
    await user.click(within(dialog).getByLabelText('Điều khiển drone'))

    expect((within(dialog).getByLabelText('Điều khiển drone') as HTMLInputElement).checked).toBe(true)
    expect((within(dialog).getByLabelText('Quản lý vận hành') as HTMLInputElement).checked).toBe(false)
  })

  it('cấp tài khoản xong thì đóng hộp thoại và hiện trong danh sách', async () => {
    const user = userEvent.setup()
    render(renderWorkspace(<AccountsPage />))
    await screen.findByText('admin@5bros.demo')

    const dialog = await openCreateDialog(user)
    await user.type(within(dialog).getByLabelText('Email'), 'phicong@5bros.local')
    await user.type(within(dialog).getByLabelText('Họ và tên'), 'Trần Phi Công')
    await user.type(within(dialog).getByLabelText('Mật khẩu'), 'BayCao@2026')
    await user.click(within(dialog).getByLabelText('Điều khiển drone'))
    await user.click(within(dialog).getByRole('button', { name: 'Cấp tài khoản' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(await screen.findByText(/Đã cấp tài khoản cho phicong@5bros.local/)).toBeTruthy()
    expect(await screen.findByText('phicong@5bros.local')).toBeTruthy()
  })

  it('từ chối email trùng và giữ hộp thoại để sửa lại', async () => {
    const user = userEvent.setup()
    render(renderWorkspace(<AccountsPage />))
    await screen.findByText('admin@5bros.demo')

    const dialog = await openCreateDialog(user)
    await user.type(within(dialog).getByLabelText('Email'), 'admin@5bros.demo')
    await user.type(within(dialog).getByLabelText('Họ và tên'), 'Trùng Email')
    await user.type(within(dialog).getByLabelText('Mật khẩu'), 'MatKhau@123')
    await user.click(within(dialog).getByLabelText('Quản lý vận hành'))
    await user.click(within(dialog).getByRole('button', { name: 'Cấp tài khoản' }))

    expect(await screen.findByText(/đã được cấp cho một tài khoản khác/)).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})
