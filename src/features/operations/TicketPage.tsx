import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import {
  BoundaryMap,
  inputClass,
  labelClass,
  LabeledValue,
  Metrics,
  Notice,
  PageIntro,
  Panel,
  RolePicker,
  StatusPill,
  tableClass,
  tdClass,
  TextLink,
  textareaClass,
  thClass,
} from './OperationUi'
import { actionText, ticketStatusText } from './operationLabels'
import { addEvent, customerName, demoCustomerId, type Ticket, type TicketStatus } from './operationsModel'
import { useOperations } from './operationsContext'
import TicketForm from './TicketForm'

const managerStatuses: TicketStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_INFO',
  'INFO_UPDATED',
  'ACCEPTED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
]
const customerStatuses: TicketStatus[] = ['DRAFT', ...managerStatuses]

export default function TicketPage() {
  const { data, role, update } = useOperations()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const selected = data.tickets.find((ticket) => ticket.id === params.get('ticket'))
  const scope =
    role === 'manager'
      ? data.tickets.filter((ticket) => ticket.status !== 'DRAFT')
      : data.tickets.filter((ticket) => ticket.customerId === demoCustomerId)
  const list = scope
    .filter(
      (ticket) =>
        `${ticket.id} ${ticket.name} ${ticket.objective} ${customerName(ticket.customerId)}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === 'ALL' || ticket.status === filter),
    )
    .slice()
    .reverse()

  const openTicket = (ticket: Ticket) => {
    if (role === 'manager' && ticket.status === 'SUBMITTED')
      update((draft) => {
        const current = draft.tickets.find((item) => item.id === ticket.id)
        if (current && current.status === 'SUBMITTED') {
          current.status = 'UNDER_REVIEW'
          addEvent(current, 'Manager', 'Bắt đầu xem xét phiếu.')
        }
      })
    setParams({ ticket: ticket.id })
  }

  return (
    <>
      <RolePicker />
      {params.has('new') || params.has('edit') ? (
        <TicketForm key={`${params.get('new')}:${params.get('edit')}:${params.get('action')}:${params.get('field')}`} />
      ) : selected && (role === 'manager' ? selected.status !== 'DRAFT' : selected.customerId === demoCustomerId) ? (
        <TicketDetail
          key={`${selected.id}:${role}`}
          ticket={selected}
          onBack={() => setParams({})}
          onEditDraft={() => setParams({ edit: selected.id })}
        />
      ) : (
        <>
          <PageIntro
            eyebrow={role === 'manager' ? 'S8 · Manager' : 'S8 · Customer'}
            title={role === 'manager' ? 'Hàng đợi phiếu yêu cầu' : 'Phiếu của tôi'}
            description={
              role === 'manager'
                ? 'Xem xét phiếu Field và phiếu yêu cầu bay; tiếp nhận chưa đồng nghĩa hoàn tất.'
                : 'Theo dõi trạng thái, bổ sung thông tin trên cùng phiếu và xem kết quả.'
            }
            actions={
              role === 'customer' && <Button onClick={() => setParams({ new: 'request' })}>Tạo phiếu yêu cầu</Button>
            }
          />
          <Metrics
            items={[
              { label: 'Tổng phiếu', value: scope.length, note: 'Trong phạm vi vai trò' },
              { label: 'Cần bổ sung', value: scope.filter((ticket) => ticket.status === 'NEEDS_INFO').length },
              {
                label: 'Đã tiếp nhận',
                value: scope.filter((ticket) => ['ACCEPTED', 'IN_PROGRESS'].includes(ticket.status)).length,
              },
              {
                label: 'Đã hoàn tất',
                value: scope.filter((ticket) => ['RESOLVED', 'CLOSED'].includes(ticket.status)).length,
              },
            ]}
          />
          <Panel title={role === 'manager' ? 'Hàng đợi thẩm định' : 'Danh sách phiếu'} aside={`${list.length} kết quả`}>
            <div className="flex flex-wrap gap-3 p-4">
              <input
                aria-label="Tìm phiếu"
                className={`${inputClass} !w-auto min-w-[240px] flex-1`}
                placeholder="Tìm mã phiếu, Field hoặc khách…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                aria-label="Lọc trạng thái phiếu"
                className={`${inputClass} !w-auto`}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                {(role === 'manager' ? managerStatuses : customerStatuses).map((status) => (
                  <option key={status} value={status}>
                    {ticketStatusText[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    {['Phiếu', 'Customer', 'Đối tượng / nội dung', 'Trạng thái', 'Cập nhật', ''].map((heading) => (
                      <th key={heading} className={thClass}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className={tdClass}>
                        <TextLink onClick={() => openTicket(ticket)}>{ticket.id}</TextLink>
                        <small className="block text-on-surface-variant">
                          {ticket.type === 'FIELD_REQUEST' ? actionText[ticket.action ?? 'CREATE'] : 'Yêu cầu bay'}
                        </small>
                      </td>
                      <td className={tdClass}>{customerName(ticket.customerId)}</td>
                      <td className={tdClass}>
                        {ticket.name || ticket.objective || 'Chưa nhập nội dung'}
                        <small className="block text-on-surface-variant">
                          {ticket.type === 'FIELD_REQUEST'
                            ? ticket.province
                            : data.fields.find((field) => field.id === ticket.fieldId)?.name || 'Chưa chọn Field'}
                        </small>
                      </td>
                      <td className={tdClass}>
                        <StatusPill status={ticket.status} />
                      </td>
                      <td className={tdClass}>{ticket.updatedAt}</td>
                      <td className={tdClass}>
                        <TextLink onClick={() => openTicket(ticket)}>
                          {role === 'manager' ? 'Xử lý' : 'Xem chi tiết'} →
                        </TextLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!list.length && <p className="p-5 text-center text-on-surface-variant">Không có phiếu phù hợp.</p>}
            </div>
          </Panel>
        </>
      )}
    </>
  )
}

function TicketDetail({
  ticket,
  onBack,
  onEditDraft,
}: {
  ticket: Ticket
  onBack: () => void
  onEditDraft: () => void
}) {
  const { data, role, update } = useOperations()
  const navigate = useNavigate()
  const [decision, setDecision] = useState<'needs' | 'reject' | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [internalNote, setInternalNote] = useState(ticket.internalNote)
  const [supplement, setSupplement] = useState('')
  const [supplementFile, setSupplementFile] = useState('')
  const [publicResponse, setPublicResponse] = useState(ticket.publicResponse)
  const [c1Result, setC1Result] = useState(ticket.c1Result)
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState('')
  const isManager = role === 'manager'
  const field = data.fields.find((item) => item.id === ticket.fieldId)
  const resultField = data.fields.find((item) => item.id === ticket.resultFieldId)
  const farm = data.farms.find((item) => item.id === ticket.farmId)
  const reviewable = ['SUBMITTED', 'UNDER_REVIEW', 'INFO_UPDATED'].includes(ticket.status)
  const workable = ['ACCEPTED', 'IN_PROGRESS'].includes(ticket.status)
  const events = ticket.events.filter((event) => isManager || event.public)

  const change = (apply: (current: Ticket) => void) =>
    update((draft) => {
      const current = draft.tickets.find((item) => item.id === ticket.id)
      if (current) apply(current)
    })
  const decide = (event: FormEvent) => {
    event.preventDefault()
    if (!decision || !reviewable || !decisionReason.trim()) return setError('Nội dung phản hồi là bắt buộc.')
    change((current) => {
      current.status = decision === 'needs' ? 'NEEDS_INFO' : 'REJECTED'
      current.decisionReason = decisionReason.trim()
      current.internalNote = internalNote.trim()
      addEvent(current, 'Manager', `${decision === 'needs' ? 'Yêu cầu bổ sung' : 'Từ chối'}: ${decisionReason.trim()}`)
      if (internalNote.trim()) addEvent(current, 'Manager', internalNote.trim(), false)
    })
    setDecision(null)
    setError('')
  }
  const accept = () => {
    if (!reviewable) return
    change((current) => {
      current.status = 'ACCEPTED'
      addEvent(current, 'Manager', 'Tiếp nhận phiếu. Chuyển đến bước thực hiện tương ứng.')
    })
  }
  const supplementTicket = (event: FormEvent) => {
    event.preventDefault()
    if (!supplement.trim()) return setError('Cần nhập nội dung bổ sung.')
    if (ticket.status !== 'NEEDS_INFO') return
    change((current) => {
      current.status = 'INFO_UPDATED'
      if (supplementFile) current.attachments.push(supplementFile)
      addEvent(
        current,
        customerName(current.customerId),
        `Bổ sung: ${supplement.trim()}${supplementFile ? ` · Tệp ${supplementFile}` : ''}`,
      )
    })
    setSupplement('')
    setError('')
  }
  const handoff = () => {
    if (ticket.type !== 'MISSION_REQUEST' || ticket.status !== 'ACCEPTED' || ticket.resultMissionId) return
    update((draft) => {
      const current = draft.tickets.find((item) => item.id === ticket.id)
      if (!current || current.resultMissionId) return
      current.resultMissionId = `MIS-${String(101 + draft.tickets.filter((item) => item.resultMissionId).length)}`
      current.status = 'IN_PROGRESS'
      addEvent(
        current,
        'Manager',
        `Bàn giao C1; tạo hồ sơ mission ${current.resultMissionId} từ phiếu. Chưa phải phê duyệt bay.`,
      )
    })
  }
  const completeC1 = (event: FormEvent) => {
    event.preventDefault()
    if (!ticket.resultMissionId || !c1Result.trim()) return setError('Cần ghi kết quả từ C1.')
    change((current) => {
      current.c1Completed = true
      current.c1Result = c1Result.trim()
      addEvent(current, 'Manager', `Nhận kết quả C1 cho ${current.resultMissionId}: ${current.c1Result}`)
    })
    setError('')
  }
  const resolve = (event: FormEvent, pending: boolean) => {
    event.preventDefault()
    if (!workable || !publicResponse.trim()) return setError('Cần ghi kết quả hoặc lý do gửi Customer.')
    if (!pending && ticket.type === 'FIELD_REQUEST' && !ticket.resultFieldId)
      return setError('Cần thực hiện S7 trước khi đánh dấu đã giải quyết.')
    if (!pending && ticket.type === 'MISSION_REQUEST' && (!ticket.resultMissionId || !ticket.c1Completed))
      return setError('Cần có kết quả hoàn tất C1 trước khi đánh dấu đã giải quyết.')
    change((current) => {
      current.publicResponse = publicResponse.trim()
      current.internalNote = internalNote.trim()
      current.status = pending ? 'IN_PROGRESS' : 'RESOLVED'
      addEvent(
        current,
        'Manager',
        `${pending ? 'Chưa thể hoàn tất' : 'Đã giải quyết và thông báo kết quả'}: ${publicResponse.trim()}`,
      )
      if (internalNote.trim()) addEvent(current, 'Manager', internalNote.trim(), false)
    })
    setError('')
  }
  const requestCancel = (event: FormEvent) => {
    event.preventDefault()
    if (!cancelReason.trim()) return setError('Cần ghi lý do yêu cầu hủy.')
    change((current) => {
      current.cancellationRequested = true
      addEvent(current, customerName(current.customerId), `Yêu cầu hủy mission: ${cancelReason.trim()}`)
    })
    setCancelReason('')
    setError('')
  }
  const cancel = (event: FormEvent) => {
    event.preventDefault()
    if (!cancelReason.trim()) return setError('Cần ghi lý do hủy.')
    change((current) => {
      current.status = 'CANCELLED'
      current.decisionReason = cancelReason.trim()
      current.cancellationRequested = false
      addEvent(current, 'Manager', `Đã xác nhận hủy yêu cầu: ${cancelReason.trim()}`)
    })
    setError('')
  }
  const applyField = () => {
    if (ticket.action === 'DEACTIVATE')
      navigate(`/khu-vuc-canh-tac?view=field&id=${ticket.fieldId}&ticket=${ticket.id}`)
    else
      navigate(
        `/khu-vuc-canh-tac?view=form&id=${ticket.action === 'UPDATE' ? ticket.fieldId : ticket.farmId}&ticket=${ticket.id}`,
      )
  }

  return (
    <>
      <PageIntro
        eyebrow={isManager ? 'S8.2 · Manager' : 'S8 · Customer'}
        title={`${ticket.id} · ${ticket.type === 'FIELD_REQUEST' ? actionText[ticket.action ?? 'CREATE'] : 'Yêu cầu bay'}`}
        description={
          isManager
            ? 'Đối chiếu đề xuất, bằng chứng và dữ liệu hiện có trước khi tiếp nhận.'
            : 'Xem nội dung đã gửi, phản hồi và kết quả được chia sẻ.'
        }
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              ← {isManager ? 'Hàng đợi' : 'Phiếu của tôi'}
            </Button>
            {!isManager && ticket.status === 'DRAFT' && <Button onClick={onEditDraft}>Tiếp tục chỉnh sửa</Button>}
          </>
        }
      />
      {ticket.status === 'DRAFT' && (
        <Notice>Phiếu đang là bản nháp. Bạn có thể tiếp tục chỉnh sửa trước khi gửi.</Notice>
      )}
      {ticket.cancellationRequested && (
        <Notice tone="warning">Khách hàng đã yêu cầu hủy mission. Manager cần xem xét theo giai đoạn xử lý.</Notice>
      )}
      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <Panel title="Nội dung phiếu" aside={<StatusPill status={ticket.status} />}>
            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <LabeledValue label="Mã phiếu" value={ticket.id} />
              <LabeledValue label="Customer" value={customerName(ticket.customerId)} />
              <LabeledValue label="Farm" value={farm?.name} />
              <LabeledValue
                label="Loại phiếu"
                value={ticket.type === 'FIELD_REQUEST' ? 'Yêu cầu Field' : 'Yêu cầu bay'}
              />
              {ticket.type === 'FIELD_REQUEST' ? (
                <>
                  <LabeledValue label="Hành động" value={actionText[ticket.action ?? 'CREATE']} />
                  <LabeledValue label="Field liên quan" value={field?.name} />
                  <LabeledValue label="Tên Field đề xuất" value={ticket.name} />
                  <LabeledValue label="Tỉnh" value={ticket.province} />
                  <LabeledValue label="Vị trí" value={ticket.location} />
                  <LabeledValue label="Lý do" value={ticket.reason} />
                  <LabeledValue
                    label="Loại bằng chứng"
                    value={
                      ticket.evidenceType === 'USE_RIGHT'
                        ? 'Quyền sử dụng đất'
                        : ticket.evidenceType === 'AUTHORIZATION'
                          ? 'Được cho phép tác nghiệp'
                          : '—'
                    }
                  />
                  <LabeledValue label="Tệp minh chứng" value={ticket.attachments.join(', ')} />
                </>
              ) : (
                <>
                  <LabeledValue label="Field chính thức" value={field ? `${field.name} (${field.id})` : 'Chưa chọn'} />
                  <LabeledValue label="Ngày mong muốn" value={ticket.preferredDate} />
                  <LabeledValue label="Mục tiêu" value={ticket.objective} />
                  <LabeledValue label="Mô tả" value={ticket.description} />
                  <LabeledValue label="Tệp kèm theo" value={ticket.attachments.join(', ')} />
                </>
              )}
              <LabeledValue label="Ngày gửi / tạo" value={ticket.createdAt} />
              <LabeledValue label="Cập nhật" value={ticket.updatedAt} />
              {ticket.resultFieldId && (
                <LabeledValue label="Field đã xử lý" value={resultField?.name ?? ticket.resultFieldId} />
              )}
              {ticket.resultMissionId && <LabeledValue label="Hồ sơ C1" value={ticket.resultMissionId} />}
              {ticket.c1Completed && <LabeledValue label="Kết quả C1" value={ticket.c1Result} />}
              {ticket.publicResponse && (
                <div className="sm:col-span-2">
                  <LabeledValue label="Kết quả gửi Customer" value={ticket.publicResponse} />
                </div>
              )}
              {ticket.decisionReason && (
                <div className="sm:col-span-2">
                  <LabeledValue label="Lý do quyết định" value={ticket.decisionReason} />
                </div>
              )}
              {isManager && ticket.internalNote && (
                <div className="sm:col-span-2">
                  <LabeledValue label="Ghi chú nội bộ" value={ticket.internalNote} />
                </div>
              )}
            </dl>
          </Panel>
          {ticket.type === 'FIELD_REQUEST' && ticket.polygon.length >= 3 && (
            <Panel title="Ranh giới đề xuất" aside="Chưa là Field chính thức nếu chưa qua S7">
              <div className="p-5">
                <BoundaryMap points={ticket.polygon} province={ticket.province} title="Ranh giới khách đề xuất" />
              </div>
            </Panel>
          )}
        </div>
        <Panel title="Trao đổi & lịch sử">
          <div className="space-y-4 p-5">
            {events.map((event, index) => (
              <div key={index} className="border-l-2 border-primary/30 pl-3">
                <div className="text-sm font-semibold">
                  {event.actor}
                  <span className="ml-2 text-xs font-normal text-on-surface-variant">{event.at}</span>
                  {isManager && !event.public && <span className="ml-2 text-xs text-warning">Nội bộ</span>}
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">{event.message}</p>
              </div>
            ))}
            {!events.length && <p className="text-on-surface-variant">Chưa có trao đổi.</p>}
          </div>
        </Panel>
      </div>
      {error && (
        <Notice tone="error">
          <span role="alert">{error}</span>
        </Notice>
      )}
      {!isManager && ticket.status === 'NEEDS_INFO' && (
        <Panel title="Bổ sung trên cùng phiếu" className="mb-5">
          <form onSubmit={supplementTicket} className="space-y-4 p-5">
            <div>
              <label className={labelClass} htmlFor="supplement-message">
                Nội dung bổ sung *
              </label>
              <textarea
                id="supplement-message"
                className={textareaClass}
                value={supplement}
                onChange={(event) => setSupplement(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="supplement-file">
                Tệp bổ sung
              </label>
              <input
                id="supplement-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={inputClass}
                onChange={(event) => setSupplementFile(event.target.files?.[0]?.name ?? '')}
              />
            </div>
            <Button type="submit">Gửi bổ sung</Button>
          </form>
        </Panel>
      )}
      {!isManager &&
        ticket.type === 'MISSION_REQUEST' &&
        !ticket.cancellationRequested &&
        !['DRAFT', 'CLOSED', 'REJECTED', 'CANCELLED'].includes(ticket.status) && (
          <Panel title="Yêu cầu hủy mission" className="mb-5">
            <form onSubmit={requestCancel} className="space-y-3 p-5">
              <p className="text-sm text-on-surface-variant">
                Manager sẽ xem xét yêu cầu theo giai đoạn xử lý. Thao tác này chưa tự hủy mission.
              </p>
              <label className={labelClass} htmlFor="cancel-request-reason">
                Lý do *
              </label>
              <textarea
                id="cancel-request-reason"
                className={textareaClass}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              />
              <Button variant="outline" type="submit">
                Gửi yêu cầu hủy
              </Button>
            </form>
          </Panel>
        )}
      {isManager && (
        <>
          {reviewable && (
            <Panel title="Quyết định / bàn giao" aside={<StatusPill status={ticket.status} />} className="mb-5">
              <div className="p-5">
                <p className="mb-4 text-sm text-on-surface-variant">
                  Tiếp nhận chỉ cho phép xử lý bước tiếp theo. Phiếu Field chuyển S7; phiếu bay bàn giao C1.
                </p>
                {decision ? (
                  <form onSubmit={decide} className="space-y-3">
                    <label className={labelClass} htmlFor="decision-reason">
                      {decision === 'needs' ? 'Nội dung cần bổ sung' : 'Lý do từ chối'} *
                    </label>
                    <textarea
                      id="decision-reason"
                      className={textareaClass}
                      value={decisionReason}
                      onChange={(event) => setDecisionReason(event.target.value)}
                    />
                    <label className={labelClass} htmlFor="decision-note">
                      Ghi chú nội bộ
                    </label>
                    <textarea
                      id="decision-note"
                      className={textareaClass}
                      value={internalNote}
                      onChange={(event) => setInternalNote(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setDecision(null)}>
                        Hủy
                      </Button>
                      <Button type="submit" variant={decision === 'reject' ? 'danger' : 'primary'}>
                        Xác nhận
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDecision('needs')
                        setError('')
                      }}
                    >
                      Yêu cầu bổ sung
                    </Button>
                    <Button
                      variant="danger-outline"
                      onClick={() => {
                        setDecision('reject')
                        setError('')
                      }}
                    >
                      Từ chối
                    </Button>
                    <Button onClick={accept}>Tiếp nhận phiếu</Button>
                  </div>
                )}
              </div>
            </Panel>
          )}
          {ticket.status === 'NEEDS_INFO' && <Notice tone="warning">Đang chờ Customer bổ sung trên cùng phiếu.</Notice>}
          {workable && (
            <Panel title="Thực hiện yêu cầu" className="mb-5">
              <div className="flex flex-wrap gap-2 p-5">
                {ticket.type === 'FIELD_REQUEST' ? (
                  ticket.resultFieldId ? (
                    <Notice>
                      Field {ticket.resultFieldId} đã được xử lý trong S7. Ghi kết quả công khai để hoàn tất phiếu.
                    </Notice>
                  ) : (
                    <Button onClick={applyField}>Thực hiện tại S7</Button>
                  )
                ) : ticket.resultMissionId ? (
                  <Notice>
                    Đã bàn giao C1: {ticket.resultMissionId}. Cần ghi kết quả C1 trước khi giải quyết phiếu.
                  </Notice>
                ) : (
                  <Button onClick={handoff}>Bàn giao C1</Button>
                )}
              </div>
            </Panel>
          )}
          {workable && ticket.type === 'MISSION_REQUEST' && ticket.resultMissionId && !ticket.c1Completed && (
            <Panel title="Kết quả từ C1" className="mb-5">
              <form onSubmit={completeC1} className="space-y-3 p-5">
                <label className={labelClass} htmlFor="c1-result">
                  Kết quả từ C1 *
                </label>
                <textarea
                  id="c1-result"
                  className={textareaClass}
                  value={c1Result}
                  onChange={(event) => setC1Result(event.target.value)}
                />
                <Button type="submit">Xác nhận kết quả C1</Button>
              </form>
            </Panel>
          )}
          {workable && (
            <Panel title="Kết quả & đóng phiếu" className="mb-5">
              <form onSubmit={(event) => resolve(event, false)} className="space-y-4 p-5">
                <div>
                  <label className={labelClass} htmlFor="public-result">
                    Kết quả gửi Customer *
                  </label>
                  <textarea
                    id="public-result"
                    className={textareaClass}
                    value={publicResponse}
                    onChange={(event) => setPublicResponse(event.target.value)}
                  />
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Nếu công việc còn dang dở, ghi lý do và giữ trạng thái đang thực hiện.
                  </p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="internal-note">
                    Ghi chú nội bộ Manager
                  </label>
                  <textarea
                    id="internal-note"
                    className={textareaClass}
                    value={internalNote}
                    onChange={(event) => setInternalNote(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={(event) => resolve(event, true)}>
                    Lưu lý do, giữ đang thực hiện
                  </Button>
                  <Button type="submit">Xác nhận đã giải quyết</Button>
                </div>
              </form>
            </Panel>
          )}
          {ticket.status === 'RESOLVED' && (
            <Panel title="Đóng phiếu" className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <p className="text-sm">Kết quả đã được ghi và hiển thị cho Customer.</p>
                <Button
                  onClick={() =>
                    change((current) => {
                      current.status = 'CLOSED'
                      addEvent(current, 'Manager', 'Xác nhận đóng phiếu sau khi đã giải quyết.')
                    })
                  }
                >
                  Xác nhận đóng phiếu
                </Button>
              </div>
            </Panel>
          )}
          {ticket.cancellationRequested && !['CANCELLED', 'CLOSED', 'REJECTED'].includes(ticket.status) && (
            <Panel title="Xử lý yêu cầu hủy" className="mb-5">
              <form onSubmit={cancel} className="space-y-3 p-5">
                <p className="text-sm text-on-surface-variant">
                  Kiểm tra giai đoạn mission trước khi xác nhận. Bản FE demo chưa giải phóng nguồn lực backend.
                </p>
                <label className={labelClass} htmlFor="manager-cancel-reason">
                  Lý do quyết định *
                </label>
                <textarea
                  id="manager-cancel-reason"
                  className={textareaClass}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
                <Button type="submit" variant="danger">
                  Xác nhận hủy yêu cầu
                </Button>
              </form>
            </Panel>
          )}
        </>
      )}
    </>
  )
}
