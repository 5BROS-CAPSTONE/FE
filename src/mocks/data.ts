import type { Drone, UavProfile } from '../types'

// Mock data until the backend API is available
export const uavProfiles: UavProfile[] = [
  { id: 'p1', name: 'DJI Agras T20', manufacturer: 'DJI', maxPayloadKg: 20, flightTimeMin: 15, status: 'active' },
  { id: 'p2', name: 'DJI Agras T40', manufacturer: 'DJI', maxPayloadKg: 40, flightTimeMin: 18, status: 'active' },
  { id: 'p3', name: 'XAG P100', manufacturer: 'XAG', maxPayloadKg: 40, flightTimeMin: 17, status: 'inactive' },
]

export const drones: Drone[] = [
  { id: 'd1', serialNumber: 'T20-0001', name: 'Drone Cánh Đồng A', profileId: 'p1', status: 'active', flightHours: 124 },
  { id: 'd2', serialNumber: 'T40-0002', name: 'Drone Cánh Đồng B', profileId: 'p2', status: 'maintenance', flightHours: 86 },
  { id: 'd3', serialNumber: 'P100-0003', name: 'Drone Vườn Cây', profileId: 'p3', status: 'inactive', flightHours: 42 },
]
