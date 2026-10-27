export type ProfileStatus = 'active' | 'retired'

export interface ProfileVersion {
  version: number
  createdAt: string
  createdBy: string
  note: string
}

/** The 13 technical fields of a UAV Profile, taken from the manufacturer's datasheet. */
export interface ProfileSpecs {
  manufacturer: string
  model: string
  emptyWeightKg: number
  mtowKg: number
  maxPayloadKg: number
  batteryCapacityAh: number
  /** Only optional field: some datasheets (e.g. Agras T30) do not publish it. */
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

export type BatteryStatus = 'attached' | 'unassigned' | 'retired'

export interface Battery {
  code: string
  capacityAh: number
  droneId: string | null
  attachedAt: string | null
  status: BatteryStatus
}

export type MissionStatus =
  | 'Draft'
  | 'Defined'
  | 'Planned'
  | 'Assessed'
  | 'Approved'
  | 'Blocked'
  | 'In-flight'
  | 'Completed'
  | 'Aborted'
  | 'Closed'

/** DSS assessment of a mission; it references the profile version used at assessment time. */
export interface Assessment {
  status: 'Valid' | 'STALE'
  profileVersion: number
}

export interface Mission {
  id: string
  name: string
  date: string
  droneId: string | null
  status: MissionStatus
  assessment: Assessment | null
}

export interface MissionNotification {
  at: string
  missionId: string
  message: string
}
