import type { FieldAction, TicketStatus } from './operationsModel'

export const ticketStatusText: Record<TicketStatus, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Mới gửi',
  UNDER_REVIEW: 'Đang xem xét',
  NEEDS_INFO: 'Cần bổ sung',
  INFO_UPDATED: 'Đã bổ sung',
  ACCEPTED: 'Đã tiếp nhận',
  IN_PROGRESS: 'Đang thực hiện',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

export const actionText: Record<FieldAction, string> = {
  CREATE: 'Thêm Field',
  UPDATE: 'Sửa Field',
  DEACTIVATE: 'Ngưng Field',
}
