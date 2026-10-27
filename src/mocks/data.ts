import type { Drone, Mission, UavProfile } from '../types'

// Mock data mirroring the Stitch screens, used until the backend API is available
export const CURRENT_USER = { name: 'Nguyễn Văn An', role: 'Kỹ thuật viên bảo trì' }
export const COOPERATIVE = 'HTX Nông Nghiệp Tháp Mười'
export const MANUFACTURERS = ['DJI', 'XAG', 'Hylio', 'Khác']

const djiSpecs = {
  manufacturer: 'DJI',
  batteryEnergyWh: null,
  batteriesPerDrone: 1,
  minTempC: 0,
  maxTempC: 45,
  maxSpeedMs: 10,
}

export const seedProfiles: UavProfile[] = [
  {
    ...djiSpecs,
    id: 'p-t20p',
    model: 'Agras T20P',
    emptyWeightKg: 26,
    maxPayloadKg: 20,
    mtowKg: 52,
    batteryCapacityAh: 13,
    batteryEnergyWh: 679,
    maxWindMs: 6,
    maxFlightTimeMin: 14.5,
    version: 2,
    status: 'active',
    updatedAt: '2026-10-15T09:30:00',
    versions: [
      { version: 2, createdAt: '2026-10-15T09:30:00', createdBy: 'Nguyễn Văn An', note: 'Sửa dung lượng pin' },
      { version: 1, createdAt: '2026-10-01T08:00:00', createdBy: 'Nguyễn Văn An', note: 'Tạo mới' },
    ],
  },
  {
    ...djiSpecs,
    id: 'p-t25',
    model: 'Agras T25',
    emptyWeightKg: 32,
    maxPayloadKg: 20,
    mtowKg: 58,
    batteryCapacityAh: 14,
    maxWindMs: 6,
    maxFlightTimeMin: 16,
    version: 1,
    status: 'active',
    updatedAt: '2026-10-18T14:15:00',
    versions: [{ version: 1, createdAt: '2026-10-18T14:15:00', createdBy: 'Nguyễn Văn An', note: 'Tạo mới' }],
  },
  {
    ...djiSpecs,
    id: 'p-t30',
    model: 'Agras T30',
    emptyWeightKg: 36.5,
    maxPayloadKg: 30,
    mtowKg: 76.5,
    batteryCapacityAh: 29,
    maxWindMs: 8,
    maxFlightTimeMin: 20.5,
    version: 1,
    status: 'active',
    updatedAt: '2026-10-22T08:00:00',
    versions: [{ version: 1, createdAt: '2026-10-22T08:00:00', createdBy: 'Nguyễn Văn An', note: 'Tạo mới' }],
  },
  {
    ...djiSpecs,
    id: 'p-t50',
    model: 'Agras T50',
    emptyWeightKg: 39.9,
    maxPayloadKg: 40,
    mtowKg: 92,
    batteryCapacityAh: 30,
    maxWindMs: 6,
    maxFlightTimeMin: 18,
    version: 1,
    status: 'active',
    updatedAt: '2026-10-20T09:15:00',
    versions: [{ version: 1, createdAt: '2026-10-20T09:15:00', createdBy: 'Nguyễn Văn An', note: 'Tạo mới' }],
  },
]

const battery = (code: string, capacityAh: number, attachedAt: string) => [{ code, capacityAh, attachedAt }]

export const seedDrones: Drone[] = [
  {
    id: 'd-t20p-1',
    name: 'T20P(1)',
    serial: '1581F6T20P0001',
    profileId: 'p-t20p',
    status: 'available',
    batteries: battery('PIN-T20P-01', 13, '2026-10-06T09:00:00'),
    addedAt: '2026-10-05T14:00:00',
    note: '',
    history: [
      { at: '2026-10-06T09:00:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'available', reason: 'Đã gắn đủ pin' },
      { at: '2026-10-05T14:00:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t20p-2',
    name: 'T20P(2)',
    serial: '1581F6T20P0002',
    profileId: 'p-t20p',
    status: 'available',
    batteries: battery('PIN-T20P-02', 13, '2026-10-06T09:30:00'),
    addedAt: '2026-10-05T14:10:00',
    note: '',
    history: [
      { at: '2026-10-06T09:30:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'available', reason: 'Đã gắn đủ pin' },
      { at: '2026-10-05T14:10:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t20p-3',
    name: 'T20P(3)',
    serial: '1581F6T20P0003',
    profileId: 'p-t20p',
    status: 'available',
    batteries: battery('PIN-T20P-03', 13, '2026-10-07T10:00:00'),
    addedAt: '2026-10-05T14:20:00',
    note: '',
    history: [
      { at: '2026-10-07T10:00:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'available', reason: 'Đã gắn đủ pin' },
      { at: '2026-10-05T14:20:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t25-1',
    name: 'T25(1)',
    serial: '1581F6T25A0001',
    profileId: 'p-t25',
    status: 'in-mission',
    batteries: battery('PIN-T25-01', 14, '2026-10-19T08:00:00'),
    addedAt: '2026-10-18T15:00:00',
    note: '',
    history: [
      { at: '2026-10-27T06:30:00', by: 'Hệ thống', from: 'available', to: 'in-mission', reason: 'Bắt đầu Phun ruộng B' },
      { at: '2026-10-19T08:00:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'available', reason: 'Đã gắn đủ pin' },
      { at: '2026-10-18T15:00:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t25-2',
    name: 'T25(2)',
    serial: '1581F6T25A0002',
    profileId: 'p-t25',
    status: 'unavailable',
    batteries: battery('PIN-T25-02', 14, '2026-10-19T08:10:00'),
    addedAt: '2026-10-18T15:10:00',
    note: '',
    history: [
      { at: '2026-10-20T10:00:00', by: 'Nguyễn Văn An', from: 'available', to: 'unavailable', reason: 'Thay cánh quạt' },
      { at: '2026-10-19T08:10:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'available', reason: 'Đã gắn đủ pin' },
      { at: '2026-10-18T15:10:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t25-3',
    name: 'T25(3)',
    serial: '1581F6T25A0003',
    profileId: 'p-t25',
    status: 'retired',
    batteries: [],
    addedAt: '2026-10-18T15:20:00',
    note: 'Hỏng khung sau va chạm',
    history: [
      { at: '2026-10-24T16:00:00', by: 'Nguyễn Văn An', from: 'unavailable', to: 'retired', reason: 'Hỏng khung sau va chạm' },
      { at: '2026-10-18T15:20:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' },
    ],
  },
  {
    id: 'd-t30-1',
    name: 'T30(1)',
    serial: '1581F6T30A0001',
    profileId: 'p-t30',
    status: 'unavailable',
    batteries: [],
    addedAt: '2026-10-22T09:00:00',
    note: '',
    history: [{ at: '2026-10-22T09:00:00', by: 'Hệ thống', from: 'new', to: 'unavailable', reason: 'Chưa gắn pin' }],
  },
]

export const seedMissions: Mission[] = [
  { id: 'm-a', name: 'Phun ruộng A', date: '2026-10-28', droneId: 'd-t20p-2', state: 'evaluated', assessmentStale: false },
  { id: 'm-b', name: 'Phun ruộng B', date: '2026-10-27', droneId: 'd-t25-1', state: 'in-flight', assessmentStale: false },
  { id: 'm-c', name: 'Phun ruộng C', date: '2026-10-29', droneId: 'd-t20p-3', state: 'approved', assessmentStale: false },
]
