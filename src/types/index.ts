export type ProfileStatus = 'active' | 'retired'

export interface ProfileVersion {
  version: number
  createdAt: string
  createdBy: string
  note: string
}

/** Technical specs of a UAV Profile, taken from the manufacturer's datasheet. */
export interface ProfileSpecs {
  manufacturer: string
  model: string
  emptyWeightKg: number
  maxPayloadKg: number
  mtowKg: number
  batteryCapacityAh: number
  batteryEnergyWh: number | null
  batteriesPerDrone: number
  maxWindMs: number
  minTempC: number
  maxTempC: number
  maxSpeedMs: number
  maxFlightTimeMin: number
}

export interface UavProfile extends ProfileSpecs {
  id: string
  version: number
  status: ProfileStatus
  updatedAt: string
  versions: ProfileVersion[]
}

export type DroneStatus = 'available' | 'in-mission' | 'unavailable' | 'retired'

export interface Battery {
  code: string
  capacityAh: number
  attachedAt: string
}

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
  batteries: Battery[]
  addedAt: string
  note: string
  history: StatusChange[]
}

export type MissionState = 'planned' | 'evaluated' | 'approved' | 'in-flight'

export interface Mission {
  id: string
  name: string
  date: string
  droneId: string | null
  state: MissionState
  assessmentStale: boolean
}
