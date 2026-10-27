import type { DroneStatus, MissionStatus } from '../types'

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

/**
 * Drone status labels. The manual status is "Unavailable" per the BPMN; the function list (FLT-10)
 * calls it "Maintenance" — change the label here if the team picks that name.
 */
export const droneStatusLabel: Record<DroneStatus | 'new', string> = {
  new: 'Tạo mới',
  available: 'Available',
  'in-mission': 'In-mission',
  unavailable: 'Unavailable',
  retired: 'Ngưng sử dụng',
}

export const missionStatusLabel: Record<MissionStatus, string> = {
  Draft: 'Bản nháp',
  Defined: 'Đã xác định',
  Planned: 'Đã lập kế hoạch',
  Assessed: 'Đã đánh giá',
  Approved: 'Đã phê duyệt',
  Blocked: 'Bị chặn',
  'In-flight': 'Đang bay',
  Completed: 'Hoàn thành',
  Aborted: 'Hủy giữa chừng',
  Closed: 'Đã đóng',
}

export const formatNumber = (n: number, digits = 1) => n.toFixed(digits)
