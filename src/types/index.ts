export type DroneStatus = 'active' | 'maintenance' | 'inactive'

export interface UavProfile {
  id: string
  name: string
  manufacturer: string
  maxPayloadKg: number
  flightTimeMin: number
  status: 'active' | 'inactive'
}

export interface Drone {
  id: string
  serialNumber: string
  name: string
  profileId: string
  status: DroneStatus
  flightHours: number
}
