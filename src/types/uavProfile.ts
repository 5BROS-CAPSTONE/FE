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
