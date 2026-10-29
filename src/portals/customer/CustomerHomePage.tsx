import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/authContext'
import { useOperations } from '@/features/operations/operationsContext'
import { Metrics, Panel, StatusPill } from '@/features/operations/OperationUi'
import Icon from '@/components/ui/Icon'
import WorkspaceLinks from '@/components/layout/WorkspaceLinks'
import { customerNavigation } from './navigation'
export default function CustomerHomePage() {
  const { session } = useAuth()
  const { data, customerId } = useOperations()
  const farm = data.farms.find((item) => item.customerId === customerId)
  const fields = data.fields.filter((item) => item.farmId === farm?.id)
  const tickets = data.tickets.filter((item) => item.customerId === customerId)
  return (
    <>
      <section className="workspace-welcome customer-welcome">
        <img src="/images/terraces-detail.webp" alt="Cánh đồng xanh trong không gian canh tác" />
        <p className="site-eyebrow">
          <span className="status-dot" />
          CHĂM CHÚT MÙA VỤ CỦA BẠN
        </p>
        <h1>Xin chào, {session?.user.fullName}.</h1>
        <p>
          Mỗi cánh đồng một câu chuyện.
          <br />
          Cùng bạn viết tiếp một mùa vụ mới.
        </p>
        <Link to="/customer/quan-ly-phieu?new=request" className="site-button site-button--lime">
          Tạo phiếu yêu cầu
          <Icon name="north_east" size={18} />
        </Link>
      </section>
      <Metrics
        items={[
          { label: 'Cánh đồng của tôi', value: fields.length, note: farm?.name ?? 'Chưa được gán Farm' },
          {
            label: 'Phiếu đang xử lý',
            value: tickets.filter(
              (item) => !['DRAFT', 'CLOSED', 'REJECTED', 'CANCELLED', 'RESOLVED'].includes(item.status),
            ).length,
          },
          {
            label: 'Phiếu đã hoàn tất',
            value: tickets.filter((item) => ['RESOLVED', 'CLOSED'].includes(item.status)).length,
          },
        ]}
      />
      <div className="my-7">
        <WorkspaceLinks items={customerNavigation} />
      </div>
      <Panel title="Phiếu gần đây">
        <div className="divide-y divide-outline-variant/30">
          {tickets
            .slice()
            .reverse()
            .slice(0, 5)
            .map((ticket) => (
              <Link
                key={ticket.id}
                to={`/customer/quan-ly-phieu?ticket=${ticket.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface-container-low"
              >
                <div>
                  <p className="font-semibold text-primary">{ticket.id}</p>
                  <p className="text-sm text-on-surface-variant">
                    {ticket.name || ticket.objective || 'Bản nháp chưa có nội dung'}
                  </p>
                </div>
                <StatusPill status={ticket.status} />
              </Link>
            ))}
          {!tickets.length && <p className="p-5 text-sm text-on-surface-variant">Bạn chưa có phiếu yêu cầu nào.</p>}
        </div>
      </Panel>
    </>
  )
}
