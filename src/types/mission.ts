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
