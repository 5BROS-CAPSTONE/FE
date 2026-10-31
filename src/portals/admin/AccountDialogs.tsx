import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal, { InfoNote, ModalSectionLabel } from '@/components/ui/Modal'
import { Notice, inputClass, labelClass } from '@/features/operations/OperationUi'
import { roleLabels, type AuthUser, type BackendRole } from '@/auth/model'
import {
  backendRoles,
  newAccountProblem,
  passwordMinLength,
  passwordProblem,
  type AccountEdit,
  type NewAccount,
} from './accountsApi'

// Mỗi tài khoản đúng một vai trò, theo BPMN "S5 - Người dùng & Phân quyền / Phân quyền"
// (bước "Chọn 1 role"). Dùng radio để người dùng thấy ngay là chỉ chọn được một.
function RolePicker({
  name,
  selected,
  onChange,
}: {
  name: string
  selected: BackendRole | null
  onChange: (role: BackendRole) => void
}) {
  return (
    <fieldset className="mt-4">
      <legend className={labelClass}>Vai trò</legend>
      <div className="flex flex-col gap-2">
        {backendRoles.map((role) => (
          <label key={role} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              aria-label={roleLabels[role]}
              checked={selected === role}
              onChange={() => onChange(role)}
            />
            <span>{roleLabels[role]}</span>
            <span className="text-xs text-on-surface-variant">{role}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function CreateAccountDialog({
  busy,
  onClose,
  onSubmit,
}: {
  busy: boolean
  onClose: () => void
  onSubmit: (account: NewAccount) => void
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<BackendRole | null>(null)
  const [problem, setProblem] = useState('')

  const submit = () => {
    const account: NewAccount = { email, fullName, password, roles: role ? [role] : [] }
    const found = newAccountProblem(account)
    if (found) {
      setProblem(found)
      return
    }
    setProblem('')
    onSubmit(account)
  }

  return (
    <Modal
      tone="info"
      title="Cấp tài khoản nội bộ"
      description="Người được cấp dùng ngay email và mật khẩu này để đăng nhập."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? 'Đang tạo…' : 'Cấp tài khoản'}
          </Button>
        </>
      }
    >
      {problem && <Notice tone="error">{problem}</Notice>}
      <label className="mt-3 block">
        <span className={labelClass}>Email</span>
        <input
          className={inputClass}
          type="email"
          autoComplete="off"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="mt-3 block">
        <span className={labelClass}>Họ và tên</span>
        <input
          className={inputClass}
          maxLength={120}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>
      <label className="mt-3 block">
        <span className={labelClass}>Mật khẩu</span>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <RolePicker name="vai-tro-moi" selected={role} onChange={setRole} />
      <div className="mt-4">
        <InfoNote>
          Mật khẩu cần ít nhất {passwordMinLength} ký tự. Hãy gửi cho người dùng qua kênh riêng và nhắc họ đổi lại trong
          mục Hồ sơ.
        </InfoNote>
      </div>
    </Modal>
  )
}

export function EditAccountDialog({
  user,
  busy,
  onClose,
  onSubmit,
}: {
  user: AuthUser
  busy: boolean
  onClose: () => void
  onSubmit: (edit: AccountEdit) => void
}) {
  const [email, setEmail] = useState(user.email)
  const [fullName, setFullName] = useState(user.fullName)
  const [status, setStatus] = useState<AuthUser['status']>(user.status)

  return (
    <Modal
      tone="info"
      title="Sửa tài khoản"
      description={user.email}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button onClick={() => onSubmit({ email, fullName, status })} disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          className={inputClass}
          type="email"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="mt-3 block">
        <span className={labelClass}>Họ và tên</span>
        <input
          className={inputClass}
          maxLength={120}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>
      <label className="mt-3 block">
        <span className={labelClass}>Trạng thái</span>
        <select
          className={inputClass}
          value={status}
          onChange={(event) => setStatus(event.target.value as AuthUser['status'])}
        >
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="DISABLED">Đã khóa</option>
        </select>
      </label>
      <div className="mt-4">
        <InfoNote icon="lock">Khóa tài khoản sẽ thu hồi mọi phiên đăng nhập hiện có của người đó.</InfoNote>
      </div>
    </Modal>
  )
}

export function RolesDialog({
  user,
  busy,
  onClose,
  onSubmit,
}: {
  user: AuthUser
  busy: boolean
  onClose: () => void
  onSubmit: (roles: BackendRole[]) => void
}) {
  const current = user.roles.filter((item) => item !== 'CUSTOMER') as BackendRole[]
  const [role, setRole] = useState<BackendRole | null>(current[0] ?? null)
  const [problem, setProblem] = useState('')

  const submit = () => {
    if (!role) {
      setProblem('Chọn một vai trò.')
      return
    }
    setProblem('')
    onSubmit([role])
  }

  return (
    <Modal
      tone="info"
      title="Vai trò"
      description={user.fullName}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu vai trò'}
          </Button>
        </>
      }
    >
      {problem && <Notice tone="error">{problem}</Notice>}
      <ModalSectionLabel>Thay vai trò hiện tại</ModalSectionLabel>
      <RolePicker name="vai-tro-thay-the" selected={role} onChange={setRole} />
    </Modal>
  )
}

export function PasswordDialog({
  user,
  busy,
  onClose,
  onSubmit,
}: {
  user: AuthUser
  busy: boolean
  onClose: () => void
  onSubmit: (password: string) => void
}) {
  const [password, setPassword] = useState('')
  const [problem, setProblem] = useState('')

  const submit = () => {
    const found = passwordProblem(password)
    if (found) {
      setProblem(found)
      return
    }
    setProblem('')
    onSubmit(password)
  }

  return (
    <Modal
      tone="warning"
      title="Đặt lại mật khẩu"
      description={user.email}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={submit} disabled={busy}>
            {busy ? 'Đang đặt lại…' : 'Đặt lại'}
          </Button>
        </>
      }
    >
      {problem && <Notice tone="error">{problem}</Notice>}
      <label className="mt-3 block">
        <span className={labelClass}>Mật khẩu mới</span>
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <div className="mt-4">
        <InfoNote icon="warning">
          Mọi phiên đăng nhập của tài khoản này sẽ bị thu hồi. Người dùng phải đăng nhập lại bằng mật khẩu mới.
        </InfoNote>
      </div>
    </Modal>
  )
}
