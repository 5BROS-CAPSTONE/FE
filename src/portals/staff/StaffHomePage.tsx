import { useAuth } from '@/auth/authContext'
import { roleLabels } from '@/auth/model'
import { navigationFor } from '@/app/navigation'
import WorkspaceLinks from '@/components/layout/WorkspaceLinks'
import { PageIntro } from '@/features/operations/OperationUi'
import Icon from '@/components/ui/Icon'
export default function StaffHomePage() {
  const { session } = useAuth()
  return (
    <>
      <section className="workspace-welcome">
        <p className="site-eyebrow">
          <span className="status-dot" />
          OPERATIONS WORKSPACE
        </p>
        <h1>Xin chào, {session?.user.fullName}.</h1>
        <p>Một khởi đầu sẵn sàng. Một ngày vận hành hiệu quả.</p>
        <span className="role-badge">{session?.user.roles.map((role) => roleLabels[role] ?? role).join(' · ')}</span>
        <div className="workspace-welcome-icon">
          <Icon name="flight" size={45} />
        </div>
      </section>
      <PageIntro
        eyebrow="Dành cho bạn"
        title="Không gian làm việc"
        description="Các công cụ được sắp xếp theo vai trò và quyền truy cập của bạn."
      />
      <WorkspaceLinks items={navigationFor('staff', session?.user)} />
    </>
  )
}
