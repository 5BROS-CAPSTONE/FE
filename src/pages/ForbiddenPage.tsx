import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import Icon from '@/components/ui/Icon'

export default function ForbiddenPage() {
  const { session } = useAuth()
  return (
    <div className="grid min-h-[65vh] place-items-center px-5">
      <div className="max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-10 text-center shadow-sm">
        <Icon name="lock" size={40} className="text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Bạn không có quyền truy cập</h1>
        <p className="my-4 text-sm text-on-surface-variant">Tài khoản hiện tại chưa được cấp quyền cho khu vực này.</p>
        <Link to={session ? `/${session.portal}` : '/dang-nhap'} className="font-semibold text-primary hover:underline">
          Về không gian của tôi →
        </Link>
      </div>
    </div>
  )
}
