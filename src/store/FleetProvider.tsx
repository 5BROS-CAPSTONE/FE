import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { CURRENT_USER, seedBatteries, seedDrones, seedMissions, seedProfiles } from '../mocks/data'
import type { Battery, Drone, DroneStatus, Mission, MissionNotification, ProfileSpecs, UavProfile } from '../types'
import { nowIso } from '../utils/format'
import { FleetContext, type FleetStore } from './fleetContext'

const SYSTEM = 'Hệ thống'

/** Only missions not flown yet with a DSS result are affected by fleet changes. */
const isAffected = (m: Mission, droneIds: string[]) =>
  !!m.droneId && droneIds.includes(m.droneId) && (m.status === 'Assessed' || m.status === 'Approved')

// In-memory store implementing the S1 business rules; swap for API calls once the BE is ready.
export function FleetProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UavProfile[]>(seedProfiles)
  const [drones, setDrones] = useState<Drone[]>(seedDrones)
  const [batteries, setBatteries] = useState<Battery[]>(seedBatteries)
  const [missions, setMissions] = useState<Mission[]>(seedMissions)
  const [notifications, setNotifications] = useState<MissionNotification[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3500)
  }, [])

  const store = useMemo<FleetStore>(() => {
    const getProfile = (id: string) => profiles.find((p) => p.id === id)
    const getDrone = (id: string) => drones.find((d) => d.id === id)
    const batteriesOf = (droneId: string) => batteries.filter((b) => b.droneId === droneId && b.status === 'attached')
    const activeDronesOf = (profileId: string) =>
      drones.filter((d) => d.profileId === profileId && d.status !== 'retired')
    const affectedMissions = (droneIds: string[]) => missions.filter((m) => isAffected(m, droneIds))

    /**
     * Shared subprocess DC.1. The assessment goes STALE; DSS is never re-run here.
     * stillUsable = false also sends the mission back to Planned and releases the drone.
     */
    const markStale = (droneIds: string[], stillUsable: boolean) => {
      const hit = affectedMissions(droneIds)
      if (hit.length === 0) return
      setMissions((list) =>
        list.map((m) => {
          if (!isAffected(m, droneIds)) return m
          const assessment = m.assessment && { ...m.assessment, status: 'STALE' as const }
          return stillUsable ? { ...m, assessment } : { ...m, assessment, status: 'Planned', droneId: null }
        }),
      )
      const at = nowIso()
      setNotifications((list) => [
        ...hit.map((m) => ({
          at,
          missionId: m.id,
          message: stillUsable
            ? `${m.name}: đánh giá STALE, cần chạy lại DSS`
            : `${m.name}: đánh giá STALE, về Planned, cần chọn drone khác`,
        })),
        ...list,
      ])
    }

    const changeStatus = (id: string, to: DroneStatus, reason: string, unavailableReason: string | null) =>
      setDrones((list) =>
        list.map((d) =>
          d.id === id
            ? {
                ...d,
                status: to,
                unavailableReason,
                history: [{ at: nowIso(), by: CURRENT_USER.name, from: d.status, to, reason }, ...d.history],
              }
            : d,
        ),
      )

    return {
      profiles,
      drones,
      batteries,
      missions,
      notifications,
      toast,
      notify,
      getProfile,
      getDrone,
      batteriesOf,
      activeDronesOf,
      affectedMissions,

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

      // Never overwrites: a new version is created and old assessments keep referencing the old one (BR-04)
      updateProfile: (id, specs, note) => {
        markStale(activeDronesOf(id).map((d) => d.id), true)
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

      retireProfile: (id) => {
        if (activeDronesOf(id).length > 0) return
        setProfiles((list) => list.map((p) => (p.id === id ? { ...p, status: 'retired', updatedAt: nowIso() } : p)))
      },

      createDrone: (input) => {
        const at = nowIso()
        // A new drone has no battery yet, so it always starts as Unavailable
        const drone: Drone = {
          ...input,
          id: `d-${Date.now()}`,
          status: 'unavailable',
          unavailableReason: 'Chưa gắn pin',
          addedAt: at,
          history: [{ at, by: SYSTEM, from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' }],
        }
        setDrones((list) => [...list, drone])
        return drone
      },

      updateDrone: (id, input) => {
        const drone = getDrone(id)
        if (!drone) return
        const profileChanged = drone.profileId !== input.profileId
        if (profileChanged && drone.status === 'in-mission') return
        if (profileChanged) markStale([id], true)
        setDrones((list) => list.map((d) => (d.id === id ? { ...d, ...input } : d)))
      },

      markUnavailable: (id, reason) => {
        if (getDrone(id)?.status === 'in-mission') return
        markStale([id], false)
        changeStatus(id, 'unavailable', reason, reason)
      },

      // The only way back to Available: enough batteries attached for the profile
      reopenDrone: (id) => {
        const drone = getDrone(id)
        const required = drone ? (getProfile(drone.profileId)?.batteriesPerDrone ?? 1) : 1
        const attached = batteriesOf(id).length
        if (!drone || attached < required) return { ok: false, attached, required }
        changeStatus(id, 'available', 'Mở lại – đủ pin theo UAV Profile', null)
        return { ok: true }
      },

      retireDrone: (id) => {
        if (getDrone(id)?.status === 'in-mission') return
        markStale([id], false)
        setBatteries((list) =>
          list.map((b) => (b.droneId === id ? { ...b, droneId: null, attachedAt: null, status: 'unassigned' } : b)),
        )
        changeStatus(id, 'retired', 'Ngưng sử dụng', null)
      },
    }
  }, [profiles, drones, batteries, missions, notifications, toast, notify])

  return <FleetContext.Provider value={store}>{children}</FleetContext.Provider>
}
