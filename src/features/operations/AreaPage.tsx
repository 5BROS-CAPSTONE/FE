import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePortalNavigate } from '@/app/usePortalNavigation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { formatArea, measurePolygon, provinces, validatePolygon, type Point } from './geometry'
import {
  BoundaryMap,
  inputClass,
  labelClass,
  LabeledValue,
  Metrics,
  Notice,
  PageIntro,
  Panel,
  StatusPill,
  tableClass,
  tdClass,
  TextLink,
  thClass,
} from './OperationUi'
import { addEvent, customerName, customers, nextId, now, type Field, type Farm } from './operationsModel'
import { useOperations } from './operationsContext'

type Dialog = { kind: 'farm'; farmId?: string } | { kind: 'deactivate'; entity: 'farm' | 'field'; id: string } | null

export default function AreaPage() {
  const { data, role, customerId, actor, update } = useOperations()
  const navigate = usePortalNavigate()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [farmName, setFarmName] = useState('')
  const [farmCustomer, setFarmCustomer] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const view = params.get('view') ?? 'list'
  const id = params.get('id') ?? ''
  const sourceTicketId = params.get('ticket') ?? ''
  const selectedFarm = data.farms.find((farm) => farm.id === id)
  const selectedField = data.fields.find((field) => field.id === id)
  const customerFarm = data.farms.find((farm) => farm.customerId === customerId)
  const fieldsOf = (farmId: string) => data.fields.filter((field) => field.farmId === farmId)
  const areaOf = (farmId: string) =>
    fieldsOf(farmId).reduce((sum, field) => sum + measurePolygon(field.polygon).area, 0)

  const go = (nextView = 'list', nextId = '') => {
    setError('')
    const next = new URLSearchParams()
    if (nextView !== 'list') next.set('view', nextView)
    if (nextId) next.set('id', nextId)
    setParams(next)
  }
  const ticketLink = (query: string) => navigate(`/quan-ly-phieu?${query}`)
  const audit = (entity: string) =>
    data.audit
      .filter((entry) => entry.entity === entity)
      .slice()
      .reverse()

  const openFarmDialog = (farm?: Farm) => {
    setFarmName(farm?.name ?? '')
    setFarmCustomer(
      farm?.customerId ??
        customers.find((customer) => !data.farms.some((item) => item.customerId === customer.id))?.id ??
        '',
    )
    setError('')
    setDialog({ kind: 'farm', farmId: farm?.id })
  }

  const saveFarm = (event: FormEvent) => {
    event.preventDefault()
    if (!farmName.trim()) return setError('Nhập tên Farm.')
    if (!farmCustomer) return setError('Không còn Customer chưa có Farm.')
    if (!dialog || dialog.kind !== 'farm') return
    const farmId = dialog.farmId
    if (data.farms.some((farm) => farm.customerId === farmCustomer && farm.id !== farmId))
      return setError('Customer này đã có Farm.')
    const original = data.farms.find((farm) => farm.id === farmId)
    if (
      original &&
      original.customerId !== farmCustomer &&
      data.tickets.some(
        (ticket) => ticket.farmId === original.id && !['CLOSED', 'REJECTED', 'CANCELLED'].includes(ticket.status),
      )
    ) {
      return setError('Farm còn phiếu chưa đóng. Hãy xử lý xong trước khi đổi Customer.')
    }
    let savedId = farmId ?? ''
    update((draft) => {
      if (farmId) {
        const farm = draft.farms.find((item) => item.id === farmId)
        if (!farm) return
        const previousCustomer = farm.customerId
        farm.name = farmName.trim()
        farm.customerId = farmCustomer
        farm.updatedAt = now()
        draft.audit.push({
          entity: farm.id,
          actor,
          at: now(),
          message:
            previousCustomer === farmCustomer
              ? 'Sửa tên Farm.'
              : `Chuyển Farm từ ${customerName(previousCustomer)} sang ${customerName(farmCustomer)}.`,
        })
      } else {
        const farm: Farm = {
          id: nextId('FARM', draft.farms),
          customerId: farmCustomer,
          name: farmName.trim(),
          status: 'ACTIVE',
          createdAt: now(),
          updatedAt: now(),
        }
        savedId = farm.id
        draft.farms.push(farm)
        draft.audit.push({
          entity: farm.id,
          actor,
          at: now(),
          message: `Tạo Farm cho ${customerName(farmCustomer)}.`,
        })
      }
    })
    setDialog(null)
    go('farm', savedId)
  }

  const openDeactivate = (entity: 'farm' | 'field', entityId: string) => {
    setReason('')
    setError('')
    setDialog({ kind: 'deactivate', entity, id: entityId })
  }

  const blockers =
    dialog?.kind === 'deactivate'
      ? data.tickets.filter(
          (ticket) =>
            ticket.type === 'MISSION_REQUEST' &&
            ['ACCEPTED', 'IN_PROGRESS'].includes(ticket.status) &&
            (dialog.entity === 'field'
              ? ticket.fieldId === dialog.id
              : fieldsOf(dialog.id).some((field) => field.id === ticket.fieldId)),
        )
      : []

  const confirmDeactivate = (event: FormEvent) => {
    event.preventDefault()
    if (!dialog || dialog.kind !== 'deactivate') return
    if (!reason.trim()) return setError('Cần ghi lý do ngưng sử dụng.')
    if (blockers.length) return setError(`Còn phiếu bay đang xử lý: ${blockers.map((ticket) => ticket.id).join(', ')}`)
    const { entity, id: entityId } = dialog
    update((draft) => {
      const record =
        entity === 'farm'
          ? draft.farms.find((item) => item.id === entityId)
          : draft.fields.find((item) => item.id === entityId)
      if (!record) return
      record.status = 'INACTIVE'
      record.updatedAt = now()
      draft.audit.push({ entity: entityId, actor, at: now(), message: `Ngưng sử dụng: ${reason.trim()}` })
      draft.assessmentsStale.push({
        ...(entity === 'field' ? { fieldId: entityId } : { farmId: entityId }),
        at: now(),
        reason: 'Ngưng sử dụng; cần rà soát kế hoạch và đánh giá liên quan.',
      })
      const ticket = draft.tickets.find((item) => item.id === sourceTicketId && item.action === 'DEACTIVATE')
      if (ticket) {
        ticket.resultFieldId = entityId
        ticket.status = 'IN_PROGRESS'
        addEvent(ticket, actor, `S7 đã ngưng Field ${entityId}. Chờ ghi kết quả S8.`)
      }
    })
    setDialog(null)
    if (sourceTicketId) ticketLink(`ticket=${sourceTicketId}`)
  }

  const detailActions = (farm: Farm) =>
    role === 'manager' ? (
      <>
        <Button variant="outline" onClick={() => go()}>
          ← Danh sách
        </Button>
        <Button variant="outline" onClick={() => openFarmDialog(farm)}>
          Sửa Farm
        </Button>
        <Button onClick={() => go('form', farm.id)}>Thêm Field</Button>
        {farm.status === 'ACTIVE' && (
          <Button variant="danger-outline" onClick={() => openDeactivate('farm', farm.id)}>
            Ngưng sử dụng
          </Button>
        )}
      </>
    ) : (
      <Button onClick={() => ticketLink('new=field&action=CREATE')}>Yêu cầu thêm Field</Button>
    )

  const renderFarm = (farm: Farm) => {
    const fields = fieldsOf(farm.id)
    return (
      <>
        <PageIntro
          eyebrow="S7 · Chi tiết Farm"
          title={farm.name}
          description={`${farm.id} · Customer ${customerName(farm.customerId)} · Farm logic, không gắn địa chỉ`}
          actions={detailActions(farm)}
        />
        <div className="mb-5 grid gap-5 lg:grid-cols-2">
          <Panel title="Thông tin Farm" aside={<StatusPill status={farm.status} />}>
            <dl className="grid grid-cols-2 gap-5 p-5">
              <LabeledValue label="Mã Farm" value={farm.id} />
              <LabeledValue label="Customer" value={`${customerName(farm.customerId)} (${farm.customerId})`} />
              <LabeledValue label="Ngày tạo" value={farm.createdAt} />
              <LabeledValue label="Cập nhật" value={farm.updatedAt} />
              <LabeledValue label="Số Field" value={fields.length} />
              <LabeledValue label="Tổng diện tích" value={`${formatArea(areaOf(farm.id))} ha`} />
            </dl>
          </Panel>
          <Panel title="Lịch sử">
            <div className="space-y-3 p-5">
              {audit(farm.id).length ? (
                audit(farm.id).map((entry, index) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-3">
                    <p className="font-semibold">
                      {entry.actor} <span className="font-normal text-on-surface-variant">· {entry.at}</span>
                    </p>
                    <p className="text-sm">{entry.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant">Chưa có thay đổi.</p>
              )}
            </div>
          </Panel>
        </div>
        <Panel title="Field thuộc Farm" aside={`${fields.length} Field · có thể ở các tỉnh khác nhau`}>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  {['Field', 'Tỉnh / vị trí', 'Diện tích', 'Trạng thái', 'Xác minh', ''].map((heading) => (
                    <th key={heading} className={thClass}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id}>
                    <td className={tdClass}>
                      <TextLink onClick={() => go('field', field.id)}>{field.name}</TextLink>
                      <small className="block text-on-surface-variant">{field.id}</small>
                    </td>
                    <td className={tdClass}>
                      {field.province}
                      <small className="block text-on-surface-variant">{field.location}</small>
                    </td>
                    <td className={tdClass}>{formatArea(measurePolygon(field.polygon).area)} ha</td>
                    <td className={tdClass}>
                      <StatusPill status={field.status} />
                    </td>
                    <td className={tdClass}>
                      <StatusPill status={field.verification} />
                    </td>
                    <td className={tdClass}>
                      <TextLink onClick={() => go('field', field.id)}>Xem Field →</TextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!fields.length && <p className="p-5 text-center text-on-surface-variant">Farm chưa có Field.</p>}
          </div>
        </Panel>
      </>
    )
  }

  const renderField = (field: Field) => {
    const farm = data.farms.find((item) => item.id === field.farmId)
    if (!farm || (role === 'customer' && farm.customerId !== customerId))
      return <Notice tone="error">Không tìm thấy Field trong phạm vi của bạn.</Notice>
    const related = data.tickets.filter((ticket) => ticket.fieldId === field.id || ticket.resultFieldId === field.id)
    const measurement = measurePolygon(field.polygon)
    return (
      <>
        <PageIntro
          eyebrow="S7 · Chi tiết Field"
          title={field.name}
          description={`${field.id} · ${field.province} · Farm ${farm.name}`}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => go(role === 'manager' ? 'farm' : 'list', role === 'manager' ? farm.id : '')}
              >
                ← Về Farm
              </Button>
              {role === 'manager' ? (
                <>
                  <Button onClick={() => go('form', field.id)}>Sửa Field</Button>
                  {field.status === 'ACTIVE' && (
                    <Button variant="danger-outline" onClick={() => openDeactivate('field', field.id)}>
                      Ngưng Field
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={() => ticketLink(`new=field&action=UPDATE&field=${field.id}`)}>
                    Đề xuất sửa Field
                  </Button>
                  <Button variant="outline" onClick={() => ticketLink(`new=field&action=DEACTIVATE&field=${field.id}`)}>
                    Yêu cầu ngưng
                  </Button>
                </>
              )}
            </>
          }
        />
        <div className="mb-5 flex gap-2">
          <StatusPill status={field.status} />
          <StatusPill status={field.verification} />
        </div>
        <div className="mb-5 grid gap-5 xl:grid-cols-2">
          <Panel title="Ranh giới đã xác minh" aside="WGS84 · minh họa">
            <div className="p-5">
              <BoundaryMap points={field.polygon} province={field.province} />
              <p className="mt-2 text-xs text-on-surface-variant">Ranh vẽ trong phiếu Customer chỉ là đề xuất.</p>
            </div>
          </Panel>
          <Panel title="Dữ liệu Field">
            <dl className="grid grid-cols-2 gap-5 p-5">
              <LabeledValue label="Mã Field" value={field.id} />
              <LabeledValue label="Farm" value={farm.name} />
              <LabeledValue label="Tỉnh" value={field.province} />
              <LabeledValue label="Vị trí" value={field.location} />
              <LabeledValue label="Diện tích tính" value={`${formatArea(measurement.area)} ha`} />
              <LabeledValue label="Chu vi tính" value={`${formatArea(measurement.perimeter)} m`} />
              <LabeledValue label="Ngày tạo" value={field.createdAt} />
              <LabeledValue label="Cập nhật" value={field.updatedAt} />
            </dl>
          </Panel>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Lịch sử Field">
            <div className="space-y-3 p-5">
              {audit(field.id).map((entry, index) => (
                <p key={index} className="border-l-2 border-primary/30 pl-3 text-sm">
                  <strong>{entry.actor}</strong> · {entry.at}
                  <br />
                  {entry.message}
                </p>
              ))}
              {!audit(field.id).length && <p className="text-on-surface-variant">Chưa có thay đổi.</p>}
            </div>
          </Panel>
          <Panel title="Phiếu liên quan">
            <div className="space-y-2 p-5">
              {related.map((ticket) => (
                <div key={ticket.id} className="flex justify-between gap-3 text-sm">
                  <TextLink onClick={() => ticketLink(`ticket=${ticket.id}`)}>{ticket.id}</TextLink>
                  <StatusPill status={ticket.status} />
                </div>
              ))}
              {!related.length && <p className="text-on-surface-variant">Chưa có phiếu.</p>}
            </div>
          </Panel>
        </div>
      </>
    )
  }

  const renderList = () => {
    if (role === 'customer') {
      if (!customerFarm) return <Notice tone="warning">Chưa có Farm được gán cho Nguyễn Văn An.</Notice>
      const fields = fieldsOf(customerFarm.id)
      const openTickets = data.tickets.filter(
        (ticket) => ticket.customerId === customerId && !['CLOSED', 'REJECTED'].includes(ticket.status),
      )
      return (
        <>
          <PageIntro
            eyebrow="S7 · Customer"
            title="Farm của tôi"
            description="Một Farm logic; Field thuộc Farm có thể ở nhiều tỉnh thành."
            actions={
              <>
                <Button onClick={() => ticketLink('new=field&action=CREATE')}>Yêu cầu thêm Field</Button>
                <Button variant="outline" onClick={() => ticketLink('new=mission')}>
                  Tạo yêu cầu bay
                </Button>
              </>
            }
          />
          <Notice>
            Bạn chỉ thấy Farm và Field thuộc Customer của mình. Gửi đề xuất qua S8; Field chính thức được Manager xử lý
            trong S7.
          </Notice>
          <Metrics
            items={[
              { label: 'Farm của tôi', value: 1, note: customerFarm.id },
              { label: 'Field chính thức', value: fields.length, note: customerFarm.name },
              { label: 'Diện tích ranh giới', value: `${formatArea(areaOf(customerFarm.id))} ha` },
              { label: 'Phiếu đang mở', value: openTickets.length, note: 'S8 · cùng Customer' },
            ]}
          />
          <div className="mb-5 rounded-xl bg-primary px-6 py-5 text-on-primary">
            <small>
              {customerFarm.id} · {customerName(customerFarm.customerId)}
            </small>
            <h2 className="mt-1 text-xl font-bold">{customerFarm.name}</h2>
            <p className="mt-1 text-sm opacity-90">Farm là nhóm quản lý; các Field có thể ở nhiều tỉnh.</p>
            <Button variant="outline" className="mt-3" onClick={() => ticketLink('')}>
              Xem phiếu của tôi
            </Button>
          </div>
          <Panel title="Các Field của tôi" aside={`${fields.length} Field`}>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.id} className="rounded-xl border border-outline-variant/50 p-4">
                  <small className="text-on-surface-variant">
                    {field.id} · {field.province}
                  </small>
                  <h3 className="mt-1 font-semibold">{field.name}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">{field.location}</p>
                  <div className="mt-3 flex gap-2">
                    <StatusPill status={field.status} />
                    <StatusPill status={field.verification} />
                    <span className="rounded-md bg-surface-container px-2 py-1 text-xs">
                      {formatArea(measurePolygon(field.polygon).area)} ha
                    </span>
                  </div>
                  <Button variant="outline" className="mt-4" onClick={() => go('field', field.id)}>
                    Xem Field
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )
    }
    const farms = data.farms.filter(
      (farm) =>
        `${farm.id} ${farm.name} ${customerName(farm.customerId)}`.toLowerCase().includes(search.toLowerCase()) &&
        (filter === 'ALL' || farm.status === filter),
    )
    return (
      <>
        <PageIntro
          eyebrow="S7 · Quản lý khu vực canh tác"
          title="Trang trại"
          description="Một Customer có đúng một Farm. Vị trí thuộc về Field, có thể ở nhiều tỉnh khác nhau."
          actions={<Button onClick={() => openFarmDialog()}>Thêm trang trại</Button>}
        />
        <Notice>
          Farm là nhóm logic của một khách hàng. Mỗi Field có tỉnh, mô tả vị trí và ranh giới được xác minh riêng.
        </Notice>
        <Metrics
          items={[
            { label: 'Tổng Farm', value: data.farms.length, note: 'Một Farm cho mỗi Customer' },
            { label: 'Field đang hoạt động', value: data.fields.filter((field) => field.status === 'ACTIVE').length },
            {
              label: 'Diện tích ranh giới',
              value: `${formatArea(data.fields.filter((field) => field.status === 'ACTIVE').reduce((sum, field) => sum + measurePolygon(field.polygon).area, 0))} ha`,
            },
            {
              label: 'Phiếu Field cần xử lý',
              value: data.tickets.filter(
                (ticket) => ticket.type === 'FIELD_REQUEST' && !['CLOSED', 'REJECTED'].includes(ticket.status),
              ).length,
              note: 'S8 → S7',
            },
          ]}
        />
        <Panel title="Danh sách trang trại" aside={`${farms.length} / ${data.farms.length} Farm`}>
          <div className="flex flex-wrap gap-3 p-4">
            <input
              aria-label="Tìm Farm"
              className={`${inputClass} !w-auto min-w-[240px] flex-1`}
              placeholder="Tìm mã Farm, tên hoặc khách hàng…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Lọc trạng thái Farm"
              className={`${inputClass} !w-auto`}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngưng sử dụng</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  {['Farm', 'Customer', 'Field', 'Tỉnh của Field', 'Tổng diện tích', 'Trạng thái', 'Cập nhật', ''].map(
                    (heading) => (
                      <th key={heading} className={thClass}>
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr key={farm.id}>
                    <td className={tdClass}>
                      <TextLink onClick={() => go('farm', farm.id)}>{farm.name}</TextLink>
                      <small className="block text-on-surface-variant">{farm.id}</small>
                    </td>
                    <td className={tdClass}>
                      {customerName(farm.customerId)}
                      <small className="block text-on-surface-variant">{farm.customerId}</small>
                    </td>
                    <td className={tdClass}>{fieldsOf(farm.id).length}</td>
                    <td className={tdClass}>
                      {[...new Set(fieldsOf(farm.id).map((field) => field.province))].join(', ') || 'Chưa có'}
                    </td>
                    <td className={tdClass}>{formatArea(areaOf(farm.id))} ha</td>
                    <td className={tdClass}>
                      <StatusPill status={farm.status} />
                    </td>
                    <td className={tdClass}>{farm.updatedAt}</td>
                    <td className={tdClass}>
                      <TextLink onClick={() => go('farm', farm.id)}>Xem chi tiết →</TextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!farms.length && <p className="p-5 text-center text-on-surface-variant">Không có Farm phù hợp.</p>}
          </div>
        </Panel>
      </>
    )
  }

  return (
    <>
      {view === 'farm' && selectedFarm && role === 'manager' ? (
        renderFarm(selectedFarm)
      ) : view === 'field' && selectedField ? (
        renderField(selectedField)
      ) : view === 'form' && role === 'manager' ? (
        <FieldForm
          key={`${id}:${sourceTicketId}`}
          farmId={id}
          sourceTicketId={sourceTicketId}
          onBack={() =>
            sourceTicketId
              ? ticketLink(`ticket=${sourceTicketId}`)
              : go(selectedField ? 'field' : 'farm', selectedField?.id ?? id)
          }
        />
      ) : (
        renderList()
      )}
      {dialog?.kind === 'farm' && (
        <Modal
          title={dialog.farmId ? 'Sửa Farm' : 'Thêm Farm'}
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialog(null)}>
                Hủy
              </Button>
              <Button type="submit" form="farm-dialog-form" disabled={!farmCustomer}>
                {dialog.farmId ? 'Lưu thay đổi' : 'Tạo Farm'}
              </Button>
            </>
          }
        >
          <form id="farm-dialog-form" onSubmit={saveFarm} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="farm-name">
                Tên Farm *
              </label>
              <input
                id="farm-name"
                required
                className={inputClass}
                value={farmName}
                onChange={(event) => setFarmName(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="farm-customer">
                Customer *
              </label>
              <select
                id="farm-customer"
                className={inputClass}
                value={farmCustomer}
                onChange={(event) => setFarmCustomer(event.target.value)}
              >
                {!farmCustomer && <option value="">Không còn Customer chưa có Farm</option>}
                {customers
                  .filter(
                    (customer) =>
                      !data.farms.some((farm) => farm.customerId === customer.id) || customer.id === farmCustomer,
                  )
                  .map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} · {customer.id}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-on-surface-variant">
                Mỗi Customer chỉ có một Farm. Không đổi chủ khi còn phiếu đang xử lý.
              </p>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
          </form>
        </Modal>
      )}
      {dialog?.kind === 'deactivate' && (
        <Modal
          title={`Ngưng ${dialog.entity === 'farm' ? 'Farm' : 'Field'}`}
          tone={blockers.length ? 'error' : 'warning'}
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialog(null)}>
                Hủy
              </Button>
              <Button type="submit" form="deactivate-form" variant="danger" disabled={!!blockers.length}>
                Xác nhận ngưng
              </Button>
            </>
          }
        >
          <p className="text-sm text-on-surface-variant">Thao tác giữ lịch sử và liên kết phiếu.</p>
          <Notice tone={blockers.length ? 'error' : 'warning'}>
            {blockers.length
              ? `Còn yêu cầu bay đang xử lý: ${blockers.map((ticket) => ticket.id).join(', ')}.`
              : 'Đánh giá liên quan sẽ được đánh dấu cần rà soát trong dữ liệu demo.'}
          </Notice>
          <form id="deactivate-form" onSubmit={confirmDeactivate}>
            <label className={labelClass} htmlFor="deactivate-reason">
              Lý do ngưng *
            </label>
            <textarea
              id="deactivate-reason"
              required
              className={inputClass}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
          </form>
        </Modal>
      )}
    </>
  )
}

function FieldForm({ farmId, sourceTicketId, onBack }: { farmId: string; sourceTicketId: string; onBack: () => void }) {
  const { data, actor, update } = useOperations()
  const navigate = usePortalNavigate()
  const source = data.tickets.find((ticket) => ticket.id === sourceTicketId)
  const editing = data.fields.find(
    (field) => field.id === farmId || (source?.action === 'UPDATE' && field.id === source.fieldId),
  )
  const farm = data.farms.find((item) => item.id === (source?.farmId ?? editing?.farmId ?? farmId))
  const [name, setName] = useState(source?.name ?? editing?.name ?? '')
  const [province, setProvince] = useState(source?.province ?? editing?.province ?? 'Hà Nội')
  const [location, setLocation] = useState(source?.location ?? editing?.location ?? '')
  const [polygon, setPolygon] = useState<Point[]>(source?.polygon.length ? source.polygon : (editing?.polygon ?? []))
  const [verification, setVerification] = useState<'VERIFIED' | 'UNVERIFIED'>(editing?.verification ?? 'VERIFIED')
  const [error, setError] = useState('')
  if (!farm || farm.status !== 'ACTIVE') return <Notice tone="error">Farm không tồn tại hoặc đã ngưng sử dụng.</Notice>
  if (source && !['ACCEPTED', 'IN_PROGRESS'].includes(source.status))
    return <Notice tone="warning">Phiếu nguồn chưa được tiếp nhận.</Notice>
  if (source?.action === 'DEACTIVATE')
    return <Notice tone="warning">Yêu cầu ngưng Field được xử lý ở trang chi tiết phiếu.</Notice>

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !location.trim()) return setError('Nhập đủ tên, tỉnh và vị trí Field.')
    const invalid = validatePolygon(polygon)
    if (invalid) return setError(invalid)
    let savedId = editing?.id ?? ''
    update((draft) => {
      let target = draft.fields.find((field) => field.id === editing?.id)
      const before = JSON.stringify(target?.polygon)
      if (!target) {
        target = {
          id: nextId('FLD', draft.fields),
          farmId: farm.id,
          name: '',
          province: '',
          location: '',
          polygon: [],
          status: 'ACTIVE',
          verification: 'VERIFIED',
          createdAt: now(),
          updatedAt: now(),
        }
        draft.fields.push(target)
      }
      savedId = target.id
      Object.assign(target, {
        name: name.trim(),
        province,
        location: location.trim(),
        polygon,
        verification,
        updatedAt: now(),
      })
      const parent = draft.farms.find((item) => item.id === farm.id)
      if (parent) parent.updatedAt = now()
      draft.audit.push({
        entity: target.id,
        actor,
        at: now(),
        message: source ? `Áp dụng yêu cầu ${source.id}; xác minh và lưu Field.` : 'Manager tạo/sửa Field trực tiếp.',
      })
      if (before && before !== JSON.stringify(polygon))
        draft.assessmentsStale.push({
          fieldId: target.id,
          at: now(),
          reason: 'Ranh giới thay đổi; cần đánh giá lại kế hoạch liên quan.',
        })
      const ticket = draft.tickets.find((item) => item.id === source?.id)
      if (ticket) {
        ticket.resultFieldId = target.id
        ticket.status = 'IN_PROGRESS'
        addEvent(ticket, actor, `S7 đã lưu Field ${target.id}. Chờ ghi kết quả và xác nhận hoàn tất.`)
      }
    })
    navigate(source ? `/quan-ly-phieu?ticket=${source.id}` : `/khu-vuc-canh-tac?view=field&id=${savedId}`)
  }

  return (
    <>
      <PageIntro
        eyebrow="S7 · Manager xác minh"
        title="Tạo / sửa Field chính thức"
        description={
          source
            ? `Nguồn ${source.id} đã tiếp nhận. Kiểm tra trước khi áp dụng cho S7.`
            : editing
              ? `Cập nhật ${editing.id}. Thay đổi ranh có thể làm đánh giá liên quan cần rà soát.`
              : 'Tạo trực tiếp trên Farm đã chọn.'
        }
        actions={
          <Button variant="outline" onClick={onBack}>
            ← Quay lại
          </Button>
        }
      />
      <Notice tone={source ? 'warning' : 'info'}>
        {source
          ? 'Tiếp nhận phiếu S8 chưa tạo Field. Manager phải xác minh thông tin, ranh và kết quả thực hiện.'
          : 'Field là bản ghi chính thức; chỉ Manager được lưu.'}
      </Notice>
      <Panel title="Thông tin & ranh giới Field" aside={source && <StatusPill status={source.status} />}>
        <form onSubmit={save} className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Farm trực thuộc</label>
              <input className={inputClass} value={`${farm.name} (${farm.id})`} readOnly />
            </div>
            <div>
              <label className={labelClass}>Mã phiếu nguồn</label>
              <input className={inputClass} value={source?.id ?? 'Tạo/sửa trực tiếp trong S7'} readOnly />
            </div>
            <div>
              <label className={labelClass} htmlFor="field-name">
                Tên Field *
              </label>
              <input
                id="field-name"
                required
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="field-province">
                Tỉnh / thành *
              </label>
              <select
                id="field-province"
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
              <label className={labelClass} htmlFor="field-location">
                Mô tả vị trí *
              </label>
              <input
                id="field-location"
                required
                className={inputClass}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Ranh giới đa giác *</label>
            <BoundaryMap points={polygon} province={province} onChange={setPolygon} />
            <p className="mt-2 text-xs text-on-surface-variant">
              Nhấp lên lưới để đặt ít nhất 3 đỉnh. Đo đạc trên bản đồ mô phỏng chỉ phục vụ thử luồng.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="field-verification">
                Xác minh
              </label>
              <select
                id="field-verification"
                className={inputClass}
                value={verification}
                onChange={(event) => setVerification(event.target.value as 'VERIFIED' | 'UNVERIFIED')}
              >
                <option value="VERIFIED">Đã xác minh</option>
                <option value="UNVERIFIED">Chưa xác minh</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <input className={inputClass} value={editing?.status ?? 'ACTIVE'} readOnly />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>
              Hủy
            </Button>
            <Button type="submit">Lưu Field chính thức</Button>
          </div>
        </form>
      </Panel>
    </>
  )
}
