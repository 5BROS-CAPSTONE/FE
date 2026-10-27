import type { DroneStatus, MissionState } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

export function formatDate(iso: string) {
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Local ISO timestamp without timezone suffix, matching the mock data format. */
export function nowIso() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

export const droneStatusLabel: Record<DroneStatus | 'new', string> = {
  new: 'Tạo mới',
  available: 'Available',
  'in-mission': 'In-mission',
  unavailable: 'Unavailable',
  retired: 'Ngưng sử dụng',
}

export const missionStateLabel: Record<MissionState, string> = {
  planned: 'Planned',
  evaluated: 'Đã đánh giá',
  approved: 'Đã phê duyệt',
  'in-flight': 'Đang bay',
}

export const formatNumber = (n: number, digits = 1) => n.toFixed(digits)
