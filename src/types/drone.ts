export type DroneStatus = 'available' | 'in-mission' | 'unavailable' | 'retired'

export interface StatusChange {
  at: string
  by: string
  from: DroneStatus | 'new'
  to: DroneStatus
  reason: string
}

export interface Drone {
  id: string
  name: string
  serial: string
  profileId: string
  status: DroneStatus
  unavailableReason: string | null
  addedAt: string
  note: string
  history: StatusChange[]
}
