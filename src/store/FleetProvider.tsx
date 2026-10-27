import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { CURRENT_USER, seedDrones, seedMissions, seedProfiles } from '../mocks/data'
import type { Drone, DroneStatus, Mission, ProfileSpecs, UavProfile } from '../types'
import { nowIso } from '../utils/format'
import { FleetContext, type FleetStore } from './fleetContext'

// In-memory store implementing the fleet business rules; swap for API calls once the BE is ready.
export function FleetProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UavProfile[]>(seedProfiles)
  const [drones, setDrones] = useState<Drone[]>(seedDrones)
  const [missions, setMissions] = useState<Mission[]>(seedMissions)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }, [])

  const store = useMemo<FleetStore>(() => {
    const getProfile = (id: string) => profiles.find((p) => p.id === id)
    const getDrone = (id: string) => drones.find((d) => d.id === id)
    const activeDronesOf = (profileId: string) =>
      drones.filter((d) => d.profileId === profileId && d.status !== 'retired')
    const heldMissionsOf = (droneId: string) =>
      missions.filter((m) => m.droneId === droneId && m.state !== 'in-flight')
    const missionsAffectedByProfile = (profileId: string) => {
      const ids = new Set(activeDronesOf(profileId).map((d) => d.id))
      return missions.filter((m) => m.droneId && ids.has(m.droneId) && m.state !== 'in-flight')
    }

    const changeStatus = (id: string, to: DroneStatus, reason: string, patch: Partial<Drone> = {}) =>
      setDrones((list) =>
        list.map((d) =>
          d.id === id
            ? {
                ...d,
                ...patch,
                status: to,
                history: [{ at: nowIso(), by: CURRENT_USER.name, from: d.status, to, reason }, ...d.history],
              }
            : d,
        ),
      )

    // Taking a drone out of service frees its held missions: assessment goes STALE, mission back to Planned.
    const releaseMissions = (droneId: string) =>
      setMissions((list) =>
        list.map((m) =>
          m.droneId === droneId && m.state !== 'in-flight'
            ? { ...m, droneId: null, state: 'planned', assessmentStale: true }
            : m,
        ),
      )

    const markStale = (missionIds: string[]) =>
      setMissions((list) => list.map((m) => (missionIds.includes(m.id) ? { ...m, assessmentStale: true } : m)))

    return {
      profiles,
      drones,
      missions,
      toast,
      notify,
      getProfile,
      getDrone,
      activeDronesOf,
      heldMissionsOf,
      missionsAffectedByProfile,

      createProfile: (specs: ProfileSpecs) => {
        const at = nowIso()
        const profile: UavProfile = {
          ...specs,
          id: `p-${Date.now()}`,
          version: 1,
          status: 'active',
          updatedAt: at,
          versions: [{ version: 1, createdAt: at, createdBy: CURRENT_USER.name, note: 'Tạo mới' }],
        }
        setProfiles((list) => [...list, profile])
        return profile
      },

      updateProfile: (id, specs, note) => {
        markStale(missionsAffectedByProfile(id).map((m) => m.id))
        const at = nowIso()
        setProfiles((list) =>
          list.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...specs,
                  version: p.version + 1,
                  updatedAt: at,
                  versions: [{ version: p.version + 1, createdAt: at, createdBy: CURRENT_USER.name, note }, ...p.versions],
                }
              : p,
          ),
        )
      },

      retireProfile: (id) =>
        setProfiles((list) => list.map((p) => (p.id === id ? { ...p, status: 'retired', updatedAt: nowIso() } : p))),

      createDrone: (input) => {
        const at = nowIso()
        // A new drone has no battery yet, so it always starts as Unavailable
        const drone: Drone = {
          ...input,
          id: `d-${Date.now()}`,
          status: 'unavailable',
          batteries: [],
          addedAt: at,
          history: [{ at, by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' }],
        }
        setDrones((list) => [...list, drone])
        return drone
      },

      updateDrone: (id, input) => {
        const drone = getDrone(id)
        if (drone && drone.profileId !== input.profileId) markStale(heldMissionsOf(id).map((m) => m.id))
        setDrones((list) => list.map((d) => (d.id === id ? { ...d, ...input } : d)))
      },

      markUnavailable: (id, reason) => {
        releaseMissions(id)
        changeStatus(id, 'unavailable', reason)
      },

      reopenDrone: (id) => {
        const drone = getDrone(id)
        const required = drone ? (getProfile(drone.profileId)?.batteriesPerDrone ?? 1) : 1
        const attached = drone?.batteries.length ?? 0
        if (attached < required) return { ok: false, attached, required }
        changeStatus(id, 'available', 'Mở lại sau khi kiểm tra đủ pin')
        return { ok: true }
      },

      retireDrone: (id) => {
        releaseMissions(id)
        changeStatus(id, 'retired', 'Ngưng sử dụng', { batteries: [] })
      },
    }
  }, [profiles, drones, missions, toast, notify])

  return <FleetContext.Provider value={store}>{children}</FleetContext.Provider>
}
