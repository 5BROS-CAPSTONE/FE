import { createContext, useContext } from 'react'
import type { Battery, Drone, Mission, MissionNotification, ProfileSpecs, UavProfile } from '../types'

export interface DroneInput {
  name: string
  serial: string
  profileId: string
  note: string
}

export type ReopenResult = { ok: true } | { ok: false; attached: number; required: number }

export interface FleetStore {
  profiles: UavProfile[]
  drones: Drone[]
  batteries: Battery[]
  missions: Mission[]
  /** Notifications sent to the Mission Manager (DC.1). */
  notifications: MissionNotification[]
  toast: string | null
  notify: (message: string) => void

  getProfile: (id: string) => UavProfile | undefined
  getDrone: (id: string) => Drone | undefined
  /** Batteries currently attached to a drone. */
  batteriesOf: (droneId: string) => Battery[]
  /** Drones of a profile that are not retired. */
  activeDronesOf: (profileId: string) => Drone[]
  /** Missions not flown yet (Assessed / Approved) whose assessment goes STALE if these drones change. */
  affectedMissions: (droneIds: string[]) => Mission[]

  createProfile: (specs: ProfileSpecs) => UavProfile
  updateProfile: (id: string, specs: ProfileSpecs, note: string) => void
  retireProfile: (id: string) => void

  createDrone: (input: DroneInput) => Drone
  updateDrone: (id: string, input: Omit<DroneInput, 'serial'>) => void
  markUnavailable: (id: string, reason: string) => void
  reopenDrone: (id: string) => ReopenResult
  retireDrone: (id: string) => void
}

export const FleetContext = createContext<FleetStore | null>(null)

export function useFleet() {
  const store = useContext(FleetContext)
  if (!store) throw new Error('useFleet must be used inside FleetProvider')
  return store
}
