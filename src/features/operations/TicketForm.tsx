import { useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { provinces, validatePolygon, type Point } from './geometry'
import { BoundaryMap, inputClass, labelClass, Notice, PageIntro, Panel, textareaClass } from './OperationUi'
import {
  addEvent,
  customerName,
  demoCustomerId,
  newTicket,
  now,
  type FieldAction,
  type Ticket,
  type TicketType,
} from './operationsModel'
import { useOperations } from './operationsContext'

function todayLocal() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function TicketForm() {
  const { data, update } = useOperations()
  const [params, setParams] = useSearchParams()
  const existing = data.tickets.find(
    (ticket) => ticket.id === params.get('edit') && ticket.status === 'DRAFT' && ticket.customerId === demoCustomerId,
  )
  const type: TicketType = existing?.type ?? (params.get('new') === 'mission' ? 'MISSION_REQUEST' : 'FIELD_REQUEST')
  const action: FieldAction = existing?.action ?? (params.get('action') as FieldAction) ?? 'CREATE'
  const fieldId = existing?.fieldId ?? params.get('field') ?? null
  const field = data.fields.find((item) => item.id === fieldId)
  const farm = data.farms.find((item) => item.customerId === demoCustomerId)
  const [name, setName] = useState(existing?.name ?? (action === 'CREATE' ? '' : (field?.name ?? '')))
  const [province, setProvince] = useState(existing?.province ?? field?.province ?? 'Hà Nội')
  const [location, setLocation] = useState(existing?.location ?? field?.location ?? '')
  const [polygon, setPolygon] = useState<Point[]>(
    existing?.polygon ?? (action === 'UPDATE' ? (field?.polygon ?? []) : []),
  )
  const [changeBoundary, setChangeBoundary] = useState(action === 'CREATE' || !!existing?.polygon.length)
  const [evidenceType, setEvidenceType] = useState(existing?.evidenceType ?? 'USE_RIGHT')
  const [attachments, setAttachments] = useState<string[]>(existing?.attachments ?? [])
  const [attested, setAttested] = useState(existing?.attested ?? false)
  const [reason, setReason] = useState(existing?.reason ?? '')
  const [objective, setObjective] = useState(existing?.objective ?? '')
  const [preferredDate, setPreferredDate] = useState(existing?.preferredDate ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [selectedField, setSelectedField] = useState(existing?.fieldId ?? '')
  const [aiMessage, setAiMessage] = useState('')
  const [aiTab, setAiTab] = useState(false)
  const [error, setError] = useState('')
  const saving = useRef(false)
  const allowedFields = data.fields.filter(
    (item) =>
      item.farmId === farm?.id &&
      item.status === 'ACTIVE' &&
      item.verification === 'VERIFIED' &&
      farm?.status === 'ACTIVE',
  )
  const needsBoundary = type === 'FIELD_REQUEST' && (action === 'CREATE' || (action === 'UPDATE' && changeBoundary))

  if (!farm) return <Notice tone="warning">Customer chưa được gán Farm.</Notice>
  if (existing === undefined && params.has('edit'))
    return <Notice tone="error">Không tìm thấy bản nháp trong phạm vi của bạn.</Notice>
  if (type === 'FIELD_REQUEST' && action !== 'CREATE' && (!field || field.farmId !== farm.id))
    return <Notice tone="error">Field không thuộc Farm của bạn.</Notice>

  const save = (event: FormEvent, send: boolean) => {
    event.preventDefault()
    if (saving.current) return
    setError('')
    if (send && type === 'FIELD_REQUEST') {
      if (action === 'DEACTIVATE' && !reason.trim()) return setError('Cần nhập lý do ngưng Field.')
      if (action !== 'DEACTIVATE' && (!name.trim() || !location.trim() || !province))
        return setError('Nhập tên, tỉnh và mô tả vị trí Field.')
      if (needsBoundary) {
        const invalid = validatePolygon(polygon)
        if (invalid) return setError(invalid)
        if (!attachments.length) return setError('Chọn tệp minh chứng trước khi gửi.')
        if (!attested) return setError('Cần xác nhận cam kết thông tin trước khi gửi.')
      }
    }
    if (send && type === 'MISSION_REQUEST') {
      if (!allowedFields.some((item) => item.id === selectedField))
        return setError('Chỉ chọn Field đang hoạt động và đã xác minh thuộc Farm của bạn.')
      if (!objective.trim() || !preferredDate) return setError('Chọn Field, mục tiêu và ngày mong muốn.')
      if (preferredDate < todayLocal()) return setError('Ngày mong muốn không thể ở quá khứ.')
    }
    saving.current = true
    let savedId = existing?.id ?? ''
    update((draft) => {
      let ticket = draft.tickets.find((item) => item.id === existing?.id && item.status === 'DRAFT')
      if (!ticket) {
        ticket = newTicket(draft, type)
        draft.tickets.push(ticket)
      }
      savedId = ticket.id
      const patch: Partial<Ticket> =
        type === 'FIELD_REQUEST'
          ? {
              action,
              fieldId: action === 'CREATE' ? null : fieldId,
              name: action === 'DEACTIVATE' ? (field?.name ?? '') : name.trim(),
              province,
              location: location.trim(),
              polygon: needsBoundary ? structuredClone(polygon) : [],
              evidenceType: needsBoundary ? evidenceType : '',
              attachments,
              attested: needsBoundary && attested,
              reason: reason.trim(),
            }
          : {
              action: null,
              fieldId: selectedField || null,
              objective: objective.trim(),
              preferredDate,
              description: description.trim(),
              attachments,
            }
      Object.assign(ticket, patch, { status: send ? 'SUBMITTED' : 'DRAFT', updatedAt: now() })
      if (send)
        addEvent(
          ticket,
          customerName(demoCustomerId),
          type === 'FIELD_REQUEST'
            ? `Gửi phiếu ${action === 'CREATE' ? 'thêm' : action === 'UPDATE' ? 'sửa' : 'ngưng'} Field để Manager xem xét.`
            : `Gửi yêu cầu bay: ${objective.trim()}.`,
        )
    })
    setParams({ ticket: savedId })
  }

  const suggest = () => {
    const message = aiMessage.trim()
    if (!message) return setError('Nhập nhu cầu trước khi tạo gợi ý.')
    const matching = allowedFields.find((item) => message.toLowerCase().includes(item.name.toLowerCase()))
    if (matching) setSelectedField(matching.id)
    setObjective(message.slice(0, 90))
    setDescription(message)
    setAiTab(false)
    setError('')
  }

  return (
    <>
      <PageIntro
        eyebrow="S8.1 · Customer"
        title={
          type === 'MISSION_REQUEST'
            ? 'Yêu cầu nhiệm vụ bay'
            : action === 'CREATE'
              ? 'Yêu cầu thêm Field'
              : action === 'UPDATE'
                ? 'Đề xuất sửa Field'
                : 'Yêu cầu ngưng Field'
        }
        description={
          type === 'FIELD_REQUEST'
            ? `Farm ${farm.name} được điền sẵn. Manager sẽ kiểm tra đề xuất trước khi thay đổi Field chính thức.`
            : 'Chọn Field chính thức của bạn. Gợi ý biểu mẫu chỉ là bản nháp để bạn kiểm tra.'
        }
        actions={
          <Button variant="outline" onClick={() => setParams({})}>
            ← Phiếu của tôi
          </Button>
        }
      />
      {needsBoundary && (
        <Notice tone="warning">
          Nhấp các đỉnh liên tiếp trên lưới để vẽ ranh giới. Tối thiểu 3 đỉnh, không tự cắt. Tệp minh chứng hiện chỉ lưu
          tên trong bản demo.
        </Notice>
      )}
      {type === 'MISSION_REQUEST' && (
        <Notice>
          Chỉ Field đang hoạt động và đã xác minh trong Farm của bạn mới được chọn. Gửi phiếu chưa tạo mission hoặc cho
          phép bay.
        </Notice>
      )}
      <Panel title={type === 'MISSION_REQUEST' ? 'Thông tin phiếu mission' : 'Thông tin đề xuất'} aside={type}>
        <form className="space-y-5 p-5" onSubmit={(event) => save(event, true)}>
          {type === 'MISSION_REQUEST' ? (
            <>
              <div className="flex gap-2 border-b border-outline-variant/40 pb-3">
                <Button variant={aiTab ? 'outline' : 'primary'} onClick={() => setAiTab(false)}>
                  Biểu mẫu
                </Button>
                <Button variant={aiTab ? 'primary' : 'outline'} onClick={() => setAiTab(true)}>
                  Hỗ trợ soạn nháp
                </Button>
              </div>
              {aiTab ? (
                <>
                  <Notice>
                    Nhập nhu cầu bằng ngôn ngữ tự nhiên. Gợi ý sẽ điền mục tiêu và mô tả; bạn tự chọn Field và ngày rồi
                    kiểm tra trước khi gửi.
                  </Notice>
                  <div>
                    <label htmlFor="ai-message" className={labelClass}>
                      Bạn muốn thực hiện công việc gì?
                    </label>
                    <textarea
                      id="ai-message"
                      className={textareaClass}
                      value={aiMessage}
                      onChange={(event) => setAiMessage(event.target.value)}
                      placeholder="Ví dụ: khảo sát Ruộng Hà Nội để kiểm tra tình trạng cây trồng…"
                    />
                  </div>
                  <Button onClick={suggest}>Gợi ý biểu mẫu</Button>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="mission-field">
                      Field chính thức *
                    </label>
                    <select
                      id="mission-field"
                      className={inputClass}
                      value={selectedField}
                      onChange={(event) => setSelectedField(event.target.value)}
                    >
                      <option value="">Chọn Field của tôi</option>
                      {allowedFields.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} · {item.province} ({item.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="mission-date">
                      Ngày mong muốn *
                    </label>
                    <input
                      id="mission-date"
                      type="date"
                      min={todayLocal()}
                      className={inputClass}
                      value={preferredDate}
                      onChange={(event) => setPreferredDate(event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="mission-objective">
                      Mục tiêu *
                    </label>
                    <input
                      id="mission-objective"
                      className={inputClass}
                      value={objective}
                      onChange={(event) => setObjective(event.target.value)}
                      placeholder="Ví dụ: khảo sát tình trạng cây trồng"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="mission-description">
                      Mô tả / yêu cầu thêm
                    </label>
                    <textarea
                      id="mission-description"
                      className={textareaClass}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="mission-file">
                      Tệp kèm theo
                    </label>
                    <input
                      id="mission-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className={inputClass}
                      onChange={(event) =>
                        setAttachments(event.target.files?.[0] ? [event.target.files[0].name] : attachments)
                      }
                    />
                    {attachments.length > 0 && (
                      <p className="mt-1 text-xs text-on-surface-variant">{attachments.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Farm của bạn</label>
                <input className={inputClass} value={`${farm.name} (${farm.id})`} readOnly />
              </div>
              <div>
                <label className={labelClass}>Hành động</label>
                <input
                  className={inputClass}
                  value={
                    action === 'CREATE'
                      ? 'Thêm Field mới'
                      : action === 'UPDATE'
                        ? `Sửa ${field?.name}`
                        : `Ngưng ${field?.name}`
                  }
                  readOnly
                />
              </div>
              {action !== 'DEACTIVATE' && (
                <>
                  <div>
                    <label className={labelClass} htmlFor="request-name">
                      Tên Field *
                    </label>
                    <input
                      id="request-name"
                      className={inputClass}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="request-province">
                      Tỉnh / thành *
                    </label>
                    <select
                      id="request-province"
                      className={inputClass}
                      value={province}
                      onChange={(event) => {
                        setProvince(event.target.value)
                        setPolygon([])
                      }}
                    >
                      {provinces.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass} htmlFor="request-location">
                      Mô tả vị trí *
                    </label>
                    <input
                      id="request-location"
                      className={inputClass}
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                  </div>
                </>
              )}
              {action === 'UPDATE' && (
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="change-boundary">
                    Có thay đổi ranh giới?
                  </label>
                  <select
                    id="change-boundary"
                    className={inputClass}
                    value={changeBoundary ? 'yes' : 'no'}
                    onChange={(event) => setChangeBoundary(event.target.value === 'yes')}
                  >
                    <option value="no">Không · chỉ sửa thông tin</option>
                    <option value="yes">Có · gửi ranh giới đề xuất mới</option>
                  </select>
                </div>
              )}
              {needsBoundary && (
                <>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Vẽ đa giác đề xuất *</label>
                    <BoundaryMap points={polygon} province={province} onChange={setPolygon} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="evidence-type">
                      Loại bằng chứng *
                    </label>
                    <select
                      id="evidence-type"
                      className={inputClass}
                      value={evidenceType}
                      onChange={(event) => setEvidenceType(event.target.value)}
                    >
                      <option value="USE_RIGHT">Quyền sử dụng đất</option>
                      <option value="AUTHORIZATION">Được cho phép tác nghiệp</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="evidence-file">
                      Tệp bằng chứng *
                    </label>
                    <input
                      id="evidence-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className={inputClass}
                      onChange={(event) =>
                        setAttachments(event.target.files?.[0] ? [event.target.files[0].name] : attachments)
                      }
                    />
                    {attachments.length > 0 && (
                      <p className="mt-1 text-xs text-on-surface-variant">{attachments.join(', ')}</p>
                    )}
                  </div>
                  <label className="flex gap-2 text-sm md:col-span-2">
                    <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} />
                    Tôi xác nhận thông tin ranh giới và quyền sử dụng/cho phép tác nghiệp là đúng để Manager kiểm tra.
                  </label>
                </>
              )}
              {action === 'DEACTIVATE' && (
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="deactivate-file">
                    Tệp thêm (tùy chọn)
                  </label>
                  <input
                    id="deactivate-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={inputClass}
                    onChange={(event) =>
                      setAttachments(event.target.files?.[0] ? [event.target.files[0].name] : attachments)
                    }
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="request-reason">
                  {action === 'DEACTIVATE' ? 'Lý do *' : 'Lý do / ghi chú'}
                </label>
                <textarea
                  id="request-reason"
                  className={textareaClass}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={(event) => save(event, false)}>
              Lưu nháp
            </Button>
            <Button type="submit">Gửi phiếu</Button>
          </div>
        </form>
      </Panel>
    </>
  )
}
