import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { EmptyRow, IconButton, TableCard, TableFooter, Th, theadRowClass } from '../../components/DataTable'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import PageHeading from '../../components/PageHeading'
import StatCard from '../../components/StatCard'
import { DroneStatusBadge, ProfileStatusBadge, VersionTag } from '../../components/StatusBadge'
import { useFleet } from '../../store/fleetContext'
import type { UavProfile } from '../../types'
import { formatDateTime, formatNumber } from '../../utils/format'

type Tab = 'all' | 'active' | 'retired'

export default function UavProfileListPage() {
  const navigate = useNavigate()
  const { profiles, drones, activeDronesOf, retireProfile, notify } = useFleet()
  const [query, setQuery] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [retiring, setRetiring] = useState<UavProfile | null>(null)

  const manufacturers = [...new Set(profiles.map((p) => p.manufacturer))]
  const byManufacturer = profiles.filter((p) => !manufacturer || p.manufacturer === manufacturer)
  const counts = {
    all: byManufacturer.length,
    active: byManufacturer.filter((p) => p.status === 'active').length,
    retired: byManufacturer.filter((p) => p.status === 'retired').length,
  }

  const rows = byManufacturer.filter(
    (p) => (tab === 'all' || p.status === tab) && p.model.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const activeCount = profiles.filter((p) => p.status === 'active').length
  const assignedDrones = drones.filter((d) => d.status !== 'retired').length

  return (
    <>
      <PageHeading
        title="UAV Profile"
        badge={
          <span className="rounded-md bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm font-semibold uppercase text-on-secondary-fixed-variant">
            Quy chuẩn DSS
          </span>
        }
        subtitle="Hồ sơ thông số theo dòng drone – dùng cho luật an toàn và ước tính năng lượng"
        actions={
          <>
            <Button variant="outline" icon="download" onClick={() => notify('Chức năng xuất Excel sẽ nối với API báo cáo')}>
              Xuất báo cáo (Excel)
            </Button>
            <Button icon="add" onClick={() => navigate('/uav-profiles/new')}>
              Tạo UAV Profile
            </Button>
          </>
        }
      />

      <div className="mb-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <StatCard
          label="Tổng số UAV Profile"
          value={profiles.length}
          icon="stacks"
          iconClass="bg-surface-container-low text-primary-container"
          footer={
            <span className="flex items-center gap-1 font-label-md text-label-md text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {activeCount} đang hoạt động
            </span>
          }
        />
        <StatCard
          label="Drone đang dùng các profile"
          value={assignedDrones}
          icon="flight_takeoff"
          iconClass="bg-tertiary-fixed text-tertiary"
          footer={<span className="font-label-md text-label-md text-on-surface-variant">Tổng thiết bị gán profile</span>}
        />
      </div>

      <div className="mb-space-lg flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-space-sm sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-[38px] w-full rounded-lg bg-surface-container-low pl-9 pr-3 placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
              placeholder="Tìm kiếm theo model (ví dụ: Agras T20P)"
            />
          </div>
          <div className="relative min-w-[180px]">
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="h-[38px] w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Hãng: Tất cả</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  Hãng: {m}
                </option>
              ))}
            </select>
            <Icon name="expand_more" size={18} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setManufacturer('')
              setTab('all')
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary-container"
          >
            <Icon name="restart_alt" size={16} /> Đặt lại bộ lọc
          </button>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-surface-container-low p-1">
          {(
            [
              ['all', 'Tất cả'],
              ['active', 'Đang hoạt động'],
              ['retired', 'Ngưng sử dụng'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-label-md text-label-md transition-colors ${
                tab === key ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {key === 'active' && tab === key && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              {label}
              <span className="rounded-full bg-surface-container px-1.5 font-label-sm text-label-sm">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <TableCard footer={<TableFooter shown={rows.length} total={profiles.length} unit="hồ sơ" />}>
        <thead>
          <tr className={theadRowClass}>
            <Th>Tên model</Th>
            <Th>Hãng</Th>
            <Th>Version</Th>
            <Th align="right">Tải trọng tối đa</Th>
            <Th align="right">Gió tối đa</Th>
            <Th>Số pin / drone</Th>
            <Th>Số drone đang dùng</Th>
            <Th>Trạng thái</Th>
            <Th>Cập nhật lần cuối</Th>
            <Th align="right">Thao tác</Th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md text-on-surface">
          {rows.length === 0 && <EmptyRow colSpan={10} text="Không có UAV Profile phù hợp bộ lọc" />}
          {rows.map((p) => {
            const retired = p.status === 'retired'
            return (
              <tr key={p.id} className={`h-14 transition-colors hover:bg-surface-container-low/70 ${retired ? 'opacity-60' : ''}`}>
                <td className="px-space-md py-2">
                  <div className="flex items-center gap-space-sm font-title-sm text-title-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary-container">
                      <Icon name="precision_manufacturing" size={18} />
                    </span>
                    {p.model}
                  </div>
                </td>
                <td className="px-space-md py-2">{p.manufacturer}</td>
                <td className="px-space-md py-2">
                  <VersionTag version={p.version} />
                </td>
                <td className="whitespace-nowrap px-space-md py-2 text-right">{p.maxPayloadKg} kg</td>
                <td className="whitespace-nowrap px-space-md py-2 text-right">{formatNumber(p.maxWindMs)} m/s</td>
                <td className="whitespace-nowrap px-space-md py-2">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="battery_full" size={16} className="text-tertiary" /> {p.batteriesPerDrone} pin
                  </span>
                </td>
                <td className="px-space-md py-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/drones?profile=${p.id}`)}
                    className="whitespace-nowrap rounded-full bg-secondary-container px-2.5 py-1 font-label-md text-label-md text-on-secondary-fixed-variant hover:bg-surface-container-highest"
                  >
                    {activeDronesOf(p.id).length} drone
                  </button>
                </td>
                <td className="px-space-md py-2">
                  <ProfileStatusBadge active={!retired} />
                </td>
                <td className="whitespace-nowrap px-space-md py-2 text-on-surface-variant">{formatDateTime(p.updatedAt)}</td>
                <td className="px-space-md py-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    <IconButton icon="visibility" title="Xem / chỉnh sửa" onClick={() => navigate(`/uav-profiles/${p.id}/edit`)} />
                    {!retired && (
                      <>
                        <IconButton icon="edit" title="Chỉnh sửa" onClick={() => navigate(`/uav-profiles/${p.id}/edit`)} />
                        <IconButton icon="block" title="Ngưng sử dụng" onClick={() => setRetiring(p)} />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableCard>

      {retiring && (
        <RetireProfileDialog
          profile={retiring}
          onClose={() => setRetiring(null)}
          onConfirm={() => {
            retireProfile(retiring.id)
            notify(`Đã ngưng sử dụng ${retiring.model}`)
            setRetiring(null)
          }}
        />
      )}
    </>
  )
}

interface RetireProfileDialogProps {
  profile: UavProfile
  onClose: () => void
  onConfirm: () => void
}

function RetireProfileDialog({ profile, onClose, onConfirm }: RetireProfileDialogProps) {
  const navigate = useNavigate()
  const { activeDronesOf } = useFleet()
  const blocking = activeDronesOf(profile.id)

  if (blocking.length > 0) {
    return (
      <Modal
        tone="error"
        title={`Không thể ngưng sử dụng UAV Profile ${profile.model}`}
        description={`Còn ${blocking.length} drone chưa ngưng sử dụng thuộc profile này. Hãy ngưng sử dụng các drone này hoặc đổi UAV Profile cho chúng trước.`}
        onClose={onClose}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={() => navigate(`/drones?profile=${profile.id}`)}>
              Đi tới danh sách drone <Icon name="arrow_forward" size={18} />
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-2">
          {blocking.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
              <span className="flex items-center gap-2 font-title-sm text-title-sm">
                <Icon name="flight" size={18} className="text-on-surface-variant" />
                {d.name} – <span className="font-mono font-normal text-on-surface-variant">{d.serial}</span>
              </span>
              <DroneStatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      </Modal>
    )
  }

  return (
    <Modal
      title={`Ngưng sử dụng UAV Profile ${profile.model}?`}
      description="Profile sẽ chuyển sang Ngưng sử dụng, không bị xóa. Lịch sử version và các đánh giá cũ tham chiếu profile vẫn được giữ nguyên. Không thể chọn profile này khi thêm drone mới."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Xác nhận ngưng
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 font-title-sm text-title-sm text-primary">
        <Icon name="check_circle" size={18} filled /> Drone thuộc profile: 0
      </div>
    </Modal>
  )
}
