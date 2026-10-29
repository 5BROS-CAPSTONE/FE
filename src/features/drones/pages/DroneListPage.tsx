import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePortalNavigate } from '@/app/usePortalNavigation'
import { useAuth } from '@/auth/authContext'
import Button from '@/components/ui/Button'
import {
  EmptyRow,
  IconButton,
  RowMenu,
  TableCard,
  TableFooter,
  Th,
  theadRowClass,
  type MenuItem,
} from '@/components/ui/DataTable'
import Icon from '@/components/ui/Icon'
import PageHeading from '@/components/ui/PageHeading'
import StatCard from '@/components/ui/StatCard'
import { DroneStatusBadge, VersionTag } from '@/components/ui/StatusBadge'
import { useFleet } from '@/store/fleetContext'
import type { Drone, DroneStatus } from '@/types'
import { formatDate, droneStatusLabel } from '@/utils/format'
import DroneActionDialog, { type DroneAction } from '@/features/drones/components/DroneActionDialog'

const statusIconColor: Record<DroneStatus, string> = {
  available: 'text-primary-container',
  'in-mission': 'text-tertiary',
  unavailable: 'text-warning',
  retired: 'text-outline',
}

export default function DroneListPage() {
  const navigate = usePortalNavigate()
  const { can } = useAuth()
  const [params, setParams] = useSearchParams()
  const { drones, profiles, missions, getProfile, batteriesOf } = useFleet()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<DroneStatus | ''>('')
  const [pending, setPending] = useState<{ drone: Drone; action: DroneAction } | null>(null)
  const profileFilter = params.get('profile') ?? ''

  const setProfileFilter = (value: string) => setParams(value ? { profile: value } : {}, { replace: true })
  const count = (s: DroneStatus) => drones.filter((d) => d.status === s).length
  const q = query.trim().toLowerCase()
  const rows = drones.filter(
    (d) =>
      (!status || d.status === status) &&
      (!profileFilter || d.profileId === profileFilter) &&
      (d.name.toLowerCase().includes(q) || d.serial.toLowerCase().includes(q)),
  )

  const menuFor = (d: Drone): MenuItem[] => {
    const open = (action: DroneAction) => () => setPending({ drone: d, action })
    const first: MenuItem =
      d.status === 'unavailable'
        ? { label: 'Mở lại', onClick: open('reopen') }
        : { label: 'Chuyển Unavailable', onClick: open('unavailable') }
    return [first, { label: 'Ngưng sử dụng', danger: true, onClick: open('retire') }]
  }

  return (
    <>
      <PageHeading
        title="Danh sách drone"
        subtitle="Quản lý từng drone vật lý thuộc các UAV Profile"
        actions={
          can('drone:create') && (
            <Button icon="add" onClick={() => navigate('/drones/new')}>
              Thêm drone
            </Button>
          )
        }
      />

      <div className="mb-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available / Sẵn sàng"
          value={count('available')}
          icon="check_circle"
          iconClass="bg-surface-container-low text-primary-container"
        />
        <StatCard
          label="In-mission / Đang làm nhiệm vụ"
          value={count('in-mission')}
          icon="flight_takeoff"
          iconClass="bg-tertiary-fixed text-tertiary"
        />
        <StatCard
          label="Unavailable / Không khả dụng"
          value={count('unavailable')}
          icon="pause_circle"
          iconClass="bg-warning-container text-warning"
        />
        <StatCard
          label="Ngưng sử dụng"
          value={count('retired')}
          icon="do_not_disturb_on"
          iconClass="bg-surface-container text-outline"
        />
      </div>

      <div className="mb-space-lg flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-space-sm sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-[38px] w-full rounded-lg bg-surface-container-low pl-9 pr-3 placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
              placeholder="Tìm theo tên hoặc serial..."
            />
          </div>
          <FilterSelect
            value={status}
            onChange={(v) => setStatus(v as DroneStatus | '')}
            options={[
              { value: '', label: 'Trạng thái: Tất cả' },
              ...(['available', 'in-mission', 'unavailable', 'retired'] as const).map((s) => ({
                value: s,
                label: droneStatusLabel[s],
              })),
            ]}
          />
          <FilterSelect
            value={profileFilter}
            onChange={setProfileFilter}
            options={[
              { value: '', label: 'UAV Profile: Tất cả' },
              ...profiles.map((p) => ({ value: p.id, label: p.model })),
            ]}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setQuery('')
            setStatus('')
            setProfileFilter('')
          }}
          className="inline-flex items-center gap-1 self-end rounded-lg px-2 py-1.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary-container md:self-auto"
        >
          <Icon name="restart_alt" size={16} /> Đặt lại bộ lọc
        </button>
      </div>

      <TableCard footer={<TableFooter shown={rows.length} total={drones.length} unit="drone" />}>
        <thead>
          <tr className={theadRowClass}>
            <Th>Tên drone</Th>
            <Th>Serial</Th>
            <Th>UAV Profile</Th>
            <Th>Pin đang gắn</Th>
            <Th>Trạng thái</Th>
            <Th>Nhiệm vụ đang giữ chỗ</Th>
            <Th align="right">Thao tác</Th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md text-on-surface">
          {rows.length === 0 && <EmptyRow colSpan={7} text="Không có drone phù hợp bộ lọc" />}
          {rows.map((d) => {
            const profile = getProfile(d.profileId)
            const retired = d.status === 'retired'
            const required = profile?.batteriesPerDrone ?? 1
            const attached = batteriesOf(d.id).length
            const enoughBattery = attached >= required
            const mission = missions.find((m) => m.droneId === d.id)
            return (
              <tr
                key={d.id}
                className={`h-12 transition-colors ${retired ? 'bg-surface-container-low/50 opacity-50' : 'hover:bg-surface-container-low/70'}`}
              >
                <td className="px-space-md py-2">
                  <div className="flex items-center gap-space-xs whitespace-nowrap font-title-sm text-title-sm">
                    <Icon name="flight" size={18} className={statusIconColor[d.status]} />
                    {d.name}
                  </div>
                </td>
                <td className="px-space-md py-2 font-mono text-body-sm text-on-surface-variant">{d.serial}</td>
                <td className="px-space-md py-2">
                  <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    {profile?.model}
                    {profile && <VersionTag version={profile.version} muted={retired} />}
                  </div>
                </td>
                <td className="px-space-md py-2">
                  <span
                    className={`inline-flex items-center gap-1 font-label-md text-label-md ${
                      enoughBattery ? 'text-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    <Icon name={enoughBattery ? 'battery_charging_full' : 'battery_alert'} size={16} />
                    {attached}/{required}
                  </span>
                </td>
                <td className="px-space-md py-2">
                  <DroneStatusBadge status={d.status} />
                </td>
                <td className="px-space-md py-2 text-on-surface-variant">
                  {mission ? (
                    <span className="text-on-surface">
                      {mission.name} – {mission.status === 'In-flight' ? '(đang bay)' : formatDate(mission.date)}
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
                <td className="px-space-md py-2 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <IconButton
                      icon="visibility"
                      title="Xem chi tiết"
                      muted={retired}
                      onClick={() => navigate(`/drones/${d.id}`)}
                    />
                    {!retired && can('drone:update') && (
                      <>
                        <IconButton icon="edit" title="Chỉnh sửa" onClick={() => navigate(`/drones/${d.id}/edit`)} />
                        {d.status === 'in-mission' ? (
                          // Status actions are blocked while flying; the dimmed ⋮ explains why
                          <IconButton
                            icon="more_vert"
                            title="Không thể thay đổi trạng thái"
                            muted
                            onClick={() => setPending({ drone: d, action: 'unavailable' })}
                          />
                        ) : (
                          <RowMenu items={menuFor(d)} />
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableCard>

      {pending && <DroneActionDialog drone={pending.drone} action={pending.action} onClose={() => setPending(null)} />}
    </>
  )
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <div className="relative min-w-[190px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[38px] w-full cursor-pointer appearance-none rounded-lg bg-surface-container-low pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-container"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        size={18}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  )
}
