import { demoPolygon, type Point } from './geometry'

export type Role = 'manager' | 'customer'
export type EntityStatus = 'ACTIVE' | 'INACTIVE'
export type Verification = 'VERIFIED' | 'UNVERIFIED'
export type TicketStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFO'
  | 'INFO_UPDATED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'
export type FieldAction = 'CREATE' | 'UPDATE' | 'DEACTIVATE'
export type TicketType = 'FIELD_REQUEST' | 'MISSION_REQUEST'

export interface Farm {
  id: string
  customerId: string
  name: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export interface Field {
  id: string
  farmId: string
  name: string
  province: string
  location: string
  polygon: Point[]
  status: EntityStatus
  verification: Verification
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  actor: string
  at: string
  message: string
  public: boolean
}

export interface Ticket {
  id: string
  type: TicketType
  action: FieldAction | null
  customerId: string
  farmId: string
  fieldId: string | null
  status: TicketStatus
  name: string
  province: string
  location: string
  polygon: Point[]
  evidenceType: string
  attachments: string[]
  attested: boolean
  reason: string
  objective: string
  preferredDate: string
  description: string
  createdAt: string
  updatedAt: string
  publicResponse: string
  internalNote: string
  decisionReason: string
  resultFieldId: string | null
  resultMissionId: string | null
  c1Completed: boolean
  c1Result: string
  cancellationRequested: boolean
  events: TimelineEvent[]
}

export interface AuditEntry {
  entity: string
  actor: string
  at: string
  message: string
}

export interface OperationsData {
  farms: Farm[]
  fields: Field[]
  tickets: Ticket[]
  audit: AuditEntry[]
  assessmentsStale: { fieldId?: string; farmId?: string; at: string; reason: string }[]
}

export const customers = [
  { id: 'KH-0928', name: 'Nguyễn Văn An' },
  { id: 'KH-0412', name: 'Lê Thị Mai' },
  { id: 'KH-0771', name: 'Trần Hữu Nam' },
  { id: 'KH-0505', name: 'Phạm Minh Khoa' },
]
export const demoCustomerId = 'KH-0928'
export const customerName = (id: string) => customers.find((customer) => customer.id === id)?.name ?? id
export const now = () => new Date().toLocaleString('vi-VN', { hour12: false })
export const nextId = (prefix: string, records: { id: string }[]) =>
  `${prefix}-${String(1 + Math.max(0, ...records.map((record) => Number(record.id.split('-').pop()) || 0))).padStart(3, '0')}`

export function addEvent(ticket: Ticket, actor: string, message: string, isPublic = true) {
  ticket.events.push({ actor, at: now(), message, public: isPublic })
  ticket.updatedAt = now()
}

export function newTicket(data: OperationsData, type: TicketType, customerId = demoCustomerId): Ticket {
  const farm = data.farms.find((item) => item.customerId === customerId)
  if (!farm) throw new Error('Customer chưa được gán Farm.')
  const at = now()
  return {
    id: nextId('REQ', data.tickets),
    type,
    action: type === 'FIELD_REQUEST' ? 'CREATE' : null,
    customerId,
    farmId: farm.id,
    fieldId: null,
    status: 'DRAFT',
    name: '',
    province: 'Hà Nội',
    location: '',
    polygon: [],
    evidenceType: 'USE_RIGHT',
    attachments: [],
    attested: false,
    reason: '',
    objective: '',
    preferredDate: '',
    description: '',
    createdAt: at,
    updatedAt: at,
    publicResponse: '',
    internalNote: '',
    decisionReason: '',
    resultFieldId: null,
    resultMissionId: null,
    c1Completed: false,
    c1Result: '',
    cancellationRequested: false,
    events: [],
  }
}

export function seedOperations(): OperationsData {
  return {
    farms: [
      {
        id: 'FARM-01',
        customerId: 'KH-0928',
        name: 'Nông trại An',
        status: 'ACTIVE',
        createdAt: '18/10/2026 09:20',
        updatedAt: '22/10/2026 08:30',
      },
      {
        id: 'FARM-02',
        customerId: 'KH-0412',
        name: 'Nông trại Sen Tháp Mười',
        status: 'ACTIVE',
        createdAt: '19/10/2026 10:15',
        updatedAt: '21/10/2026 15:30',
      },
      {
        id: 'FARM-03',
        customerId: 'KH-0771',
        name: 'Nông trại Tri Tôn',
        status: 'ACTIVE',
        createdAt: '20/10/2026 08:10',
        updatedAt: '20/10/2026 08:10',
      },
    ],
    fields: [
      {
        id: 'FLD-01',
        farmId: 'FARM-01',
        name: 'Ruộng Hà Nội',
        province: 'Hà Nội',
        location: 'Xã Đông Thọ, gần kênh tưới số 2',
        polygon: demoPolygon(105.728, 21.193),
        status: 'ACTIVE',
        verification: 'VERIFIED',
        createdAt: '19/10/2026 10:20',
        updatedAt: '19/10/2026 10:20',
      },
      {
        id: 'FLD-02',
        farmId: 'FARM-01',
        name: 'Ruộng Tháp Mười',
        province: 'Đồng Tháp',
        location: 'Khu A, Tháp Mười',
        polygon: demoPolygon(105.733, 10.611, 0.0032, 0.0022),
        status: 'ACTIVE',
        verification: 'VERIFIED',
        createdAt: '20/10/2026 09:00',
        updatedAt: '20/10/2026 09:00',
      },
      {
        id: 'FLD-03',
        farmId: 'FARM-02',
        name: 'Ruộng Sen Cửu Long',
        province: 'Đồng Tháp',
        location: 'Xã Mỹ Hòa, Tháp Mười',
        polygon: demoPolygon(105.746, 10.604),
        status: 'ACTIVE',
        verification: 'VERIFIED',
        createdAt: '21/10/2026 14:15',
        updatedAt: '21/10/2026 14:15',
      },
      {
        id: 'FLD-04',
        farmId: 'FARM-03',
        name: 'Ruộng Bờ Bao Vĩnh Tế',
        province: 'An Giang',
        location: 'Gần kênh Vĩnh Tế, Tri Tôn',
        polygon: demoPolygon(105.082, 10.387),
        status: 'ACTIVE',
        verification: 'VERIFIED',
        createdAt: '21/10/2026 08:10',
        updatedAt: '21/10/2026 08:10',
      },
    ],
    tickets: [
      {
        id: 'REQ-001',
        type: 'FIELD_REQUEST',
        action: 'CREATE',
        customerId: 'KH-0928',
        farmId: 'FARM-01',
        fieldId: null,
        status: 'SUBMITTED',
        name: 'Ruộng Bắc Ninh đề xuất',
        province: 'Bắc Ninh',
        location: 'Khu Yên Phong, gần đường nội đồng',
        polygon: demoPolygon(106.105, 21.183),
        evidenceType: 'USE_RIGHT',
        attachments: ['Minh_chung_quyen_su_dung.pdf'],
        attested: true,
        reason: 'Đề nghị thêm khu đất để quản lý.',
        objective: '',
        preferredDate: '',
        description: '',
        createdAt: '26/10/2026 08:30',
        updatedAt: '26/10/2026 08:30',
        publicResponse: '',
        internalNote: '',
        decisionReason: '',
        resultFieldId: null,
        resultMissionId: null,
        c1Completed: false,
        c1Result: '',
        cancellationRequested: false,
        events: [
          {
            actor: 'Nguyễn Văn An',
            at: '26/10/2026 08:30',
            message: 'Gửi phiếu thêm Field kèm ranh giới đề xuất và minh chứng.',
            public: true,
          },
        ],
      },
    ],
    audit: [{ entity: 'FARM-01', at: '18/10/2026 09:20', actor: 'Manager', message: 'Tạo Farm cho Nguyễn Văn An.' }],
    assessmentsStale: [],
  }
}
