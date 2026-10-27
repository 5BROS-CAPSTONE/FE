export type BatteryStatus = 'attached' | 'unassigned' | 'retired'

export interface Battery {
  code: string
  capacityAh: number
  droneId: string | null
  attachedAt: string | null
  status: BatteryStatus
}
