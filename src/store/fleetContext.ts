import { createContext, useContext } from 'react'
import type { Drone, Mission, ProfileSpecs, UavProfile } from '../types'

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
  missions: Mission[]
  toast: string | null
  notify: (message: string) => void

  getProfile: (id: string) => UavProfile | undefined
  getDrone: (id: string) => Drone | undefined
  /** Drones of a profile that are not retired. */
  activeDronesOf: (profileId: string) => Drone[]
  /** Missions holding a drone that are not flying yet. */
  heldMissionsOf: (droneId: string) => Mission[]
  /** Missions whose DSS assessment goes STALE when the profile's specs change. */
  missionsAffectedByProfile: (profileId: string) => Mission[]

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
