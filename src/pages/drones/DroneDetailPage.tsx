import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Icon from '../../components/Icon'
import PageHeading from '../../components/PageHeading'
import { DroneStatusBadge } from '../../components/StatusBadge'
import { useFleet } from '../../store/fleetContext'
import type { DroneStatus } from '../../types'
import { droneStatusLabel, formatDate, formatDateTime, missionStatusLabel } from '../../utils/format'
import ComingSoonPage from '../ComingSoonPage'
import DroneActionDialog, { type DroneAction } from './DroneActionDialog'

const chipClass: Record<DroneStatus | 'new', string> = {
  new: 'bg-secondary-container text-on-secondary-fixed-variant',
  available: 'bg-primary-fixed text-on-primary-fixed-variant',
  'in-mission': 'bg-tertiary-fixed text-on-tertiary-fixed',
  unavailable: 'bg-warning-container text-on-warning-container',
  retired: 'bg-surface-container text-outline',
}

function Card({ icon, title, aside, children }: { icon: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
      <div className="mb-space-md flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-space-sm font-title-lg text-title-lg">
          <Icon name={icon} className="text-primary" /> {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export default function DroneDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getDrone, getProfile, missions, batteriesOf } = useFleet()
  const [action, setAction] = useState<DroneAction | null>(null)
  const drone = getDrone(id)
  if (!drone) return <ComingSoonPage title="Không tìm thấy drone" />

  const profile = getProfile(drone.profileId)
  const required = profile?.batteriesPerDrone ?? 1
  const attached = batteriesOf(drone.id)
  const held = missions.filter((m) => m.droneId === drone.id)
  const retired = drone.status === 'retired'

  return (
    <>
      <PageHeading
        crumbs={[{ label: 'Đội drone' }, { label: 'Danh sách drone', to: '/drones' }, { label: drone.name }]}
        title={drone.name}
        badge={<DroneStatusBadge status={drone.status} />}
        subtitle={`Drone vật lý thuộc dòng ${profile?.model ?? '–'}`}
        actions={
          !retired && (
            <>
              <Button variant="outline" icon="edit" onClick={() => navigate(`/drones/${drone.id}/edit`)}>
                Chỉnh sửa
              </Button>
              {drone.status === 'unavailable' ? (
                <Button variant="outline" icon="play_circle" onClick={() => setAction('reopen')}>
                  Mở lại
                </Button>
              ) : (
                <Button variant="outline" icon="pause_circle" onClick={() => setAction('unavailable')}>
                  Chuyển Unavailable
                </Button>
              )}
              <Button variant="danger-outline" icon="do_not_disturb_on" onClick={() => setAction('retire')}>
                Ngưng sử dụng
              </Button>
            </>
          )
        }
      />

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2">
        <Card icon="info" title="Thông tin chung">
          <dl className="flex flex-col">
            {[
              ['Serial', <span className="font-mono font-semibold">{drone.serial}</span>],
              [
                'UAV Profile',
                <Link to={`/uav-profiles/${drone.profileId}`} className="inline-flex items-center gap-1 font-title-sm text-title-sm text-primary hover:underline">
                  {profile?.model} – v{profile?.version} <Icon name="open_in_new" size={16} />
                </Link>,
              ],
              ['Ngày thêm', formatDate(drone.addedAt)],
              ...(drone.status === 'unavailable' && drone.unavailableReason ? [['Lý do Unavailable', drone.unavailableReason]] : []),
              ['Ghi chú', drone.note ? drone.note : <span className="italic text-on-surface-variant">Không có ghi chú</span>],
            ].map(([label, value], i) => (
              <div key={label as string} className={`flex items-center justify-between gap-4 rounded-lg px-space-sm py-3 ${i % 2 === 0 ? 'bg-surface-container-low/60' : ''}`}>
                <dt className="font-label-md text-label-md text-on-surface-variant">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card
          icon="battery_charging_full"
          title="Bộ pin"
          aside={
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold ${
                attached.length >= required ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'
              }`}
            >
              <Icon name={attached.length >= required ? 'check_circle' : 'error'} size={14} />
              {attached.length}/{required} pin theo UAV Profile
            </span>
          }
        >
          {attached.length === 0 ? (
            <p className="rounded-lg bg-surface-container-low p-space-md text-on-surface-variant">Chưa gắn pin cho drone này.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="h-10 bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th className="px-space-sm">Mã pin</th>
                    <th className="px-space-sm">Dung lượng danh định</th>
                    <th className="px-space-sm text-right">Gắn từ</th>
                  </tr>
                </thead>
                <tbody>
                  {attached.map((b) => (
                    <tr key={b.code} className="h-12">
                      <td className="px-space-sm">
                        <span className="flex items-center gap-2 whitespace-nowrap font-mono font-semibold">
                          <Icon name="battery_full" size={18} filled className="text-primary" /> {b.code}
                        </span>
                      </td>
                      <td className="px-space-sm font-title-sm text-title-sm">{b.capacityAh} Ah</td>
                      <td className="px-space-sm text-right">{b.attachedAt ? formatDate(b.attachedAt) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card icon="event_upcoming" title="Nhiệm vụ đang giữ chỗ">
          {held.length === 0 ? (
            <p className="rounded-lg bg-surface-container-low p-space-md text-on-surface-variant">Không có nhiệm vụ nào giữ chỗ drone.</p>
          ) : (
            <div className="flex flex-col gap-space-sm">
              {held.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low p-space-md">
                  <div className="flex items-center gap-space-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-lowest text-tertiary">
                      <Icon name="agriculture" />
                    </span>
                    <div>
                      <p className="font-title-md text-title-md">{m.name}</p>
                      <p className="flex items-center gap-1 text-on-surface-variant">
                        <Icon name="calendar_today" size={14} /> {formatDate(m.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-md text-label-md text-on-tertiary-fixed">
                      <Icon name={m.status === 'In-flight' ? 'flight_takeoff' : 'task_alt'} size={16} /> {missionStatusLabel[m.status]}
                    </span>
                    {m.assessment?.status === 'STALE' && (
                      <span className="rounded-full bg-warning-container px-2.5 py-1 font-label-md text-label-md text-on-warning-container ring-1 ring-warning-outline">
                        Đánh giá STALE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          icon="history"
          title="Lịch sử trạng thái"
          aside={<span className="font-label-md text-label-md text-on-surface-variant">{drone.history.length} bản ghi</span>}
        >
          <ol className="relative flex flex-col gap-space-md border-l-2 border-surface-container pl-space-md">
            {drone.history.map((h, i) => (
              <li key={h.at + h.to} className="relative">
                <span
                  className={`absolute -left-[23px] top-4 h-3 w-3 rounded-full ring-4 ring-surface-container-lowest ${
                    i === 0 ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
                <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-on-surface-variant">{formatDateTime(h.at)}</span>
                    <span className="rounded bg-surface-container-lowest px-2 py-0.5 font-label-md text-label-md">{h.by}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 font-label-md text-label-md ${chipClass[h.from]}`}>{droneStatusLabel[h.from]}</span>
                    <Icon name="arrow_forward" size={16} className="text-on-surface-variant" />
                    <span className={`rounded px-2 py-0.5 font-label-md text-label-md ${chipClass[h.to]}`}>{droneStatusLabel[h.to]}</span>
                  </div>
                  <p className="flex items-center gap-1 text-on-surface-variant">
                    <Icon name="chat_bubble" size={16} /> Lý do: “{h.reason}”
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {action && <DroneActionDialog drone={drone} action={action} onClose={() => setAction(null)} />}
    </>
  )
}
