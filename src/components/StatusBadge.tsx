import type { DroneStatus } from '../types'
import { droneStatusLabel } from '../utils/format'

const styles: Record<DroneStatus, { pill: string; dot: string }> = {
  available: { pill: 'bg-surface-container-low text-primary-container', dot: 'bg-primary-container' },
  'in-mission': { pill: 'bg-tertiary-fixed text-tertiary', dot: 'bg-tertiary' },
  unavailable: { pill: 'bg-warning-container text-on-warning-container ring-1 ring-warning-outline', dot: 'bg-warning' },
  retired: { pill: 'bg-surface-container text-outline', dot: 'bg-outline' },
}

export function DroneStatusBadge({ status }: { status: DroneStatus }) {
  const s = styles[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold ${s.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {droneStatusLabel[status]}
    </span>
  )
}

export function ProfileStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-fixed/60 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed-variant">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      Đang hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-outline">
      <span className="h-1.5 w-1.5 rounded-full bg-outline" />
      Ngưng sử dụng
    </span>
  )
}

export function VersionTag({ version, muted = false }: { version: number; muted?: boolean }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-label-sm text-label-sm ${
        muted ? 'bg-surface-container text-outline' : 'bg-surface-container-high text-on-surface'
      }`}
    >
      v{version}
    </span>
  )
}

/** Small tag describing what happens to a mission (STALE, back to Planned, drone released). */
export function EffectTag({ kind }: { kind: 'stale' | 'planned' | 'release' }) {
  const map = {
    stale: ['bg-secondary-container text-on-secondary-container', 'Đánh giá STALE'],
    planned: ['bg-tertiary-fixed text-on-tertiary-fixed', 'Về Planned'],
    release: ['bg-error-container text-on-error-container', 'Giải phóng drone'],
  } as const
  const [cls, label] = map[kind]
  return <span className={`rounded-md px-2 py-0.5 font-label-sm text-label-sm font-medium ${cls}`}>{label}</span>
}
