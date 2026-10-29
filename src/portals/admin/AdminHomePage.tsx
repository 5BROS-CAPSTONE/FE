import { useAuth } from '@/auth/authContext'
import { adminNavigation } from './navigation'
import { Metrics } from '@/features/operations/OperationUi'
import Icon from '@/components/ui/Icon'
import WorkspaceLinks from '@/components/layout/WorkspaceLinks'
export default function AdminHomePage() {
  const { session } = useAuth()
  return (
    <>
      <section className="workspace-welcome">
        <p className="site-eyebrow">
          <span className="status-dot" />
          SYSTEM CONTROL CENTER
        </p>
        <h1>
          Chào quản trị viên,
          <br />
          {session?.user.fullName}.
        </h1>
        <p>Chăm chút từng kết nối. Kiểm soát từng quyền truy cập.</p>
        <div className="workspace-welcome-icon">
          <Icon name="verified_user" size={45} />
        </div>
      </section>
      <Metrics
        items={[
          { label: 'Vai trò nội bộ', value: 6, note: 'Theo mô hình phân quyền hiện tại' },
          { label: 'Cổng ứng dụng', value: 3, note: 'Quản trị · Staff · Khách hàng' },
          { label: 'Trạng thái tài khoản', value: 'Hoạt động' },
        ]}
      />
      <h2 className="mb-4 mt-7 text-lg font-semibold">Không gian quản trị</h2>
      <WorkspaceLinks items={adminNavigation} />
    </>
  )
}
