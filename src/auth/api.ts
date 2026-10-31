export const authMode = import.meta.env.VITE_AUTH_MODE === 'api' ? 'api' : 'demo'
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  ACCOUNT_DISABLED: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
  CURRENT_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không đúng.',
  ACCESS_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  EMAIL_ALREADY_EXISTS: 'Email này đã được cấp cho một tài khoản khác.',
  USER_NOT_FOUND: 'Không tìm thấy tài khoản. Có thể ai đó vừa xoá hoặc đổi email.',
  LAST_ADMIN_REQUIRED: 'Hệ thống phải còn ít nhất một Quản trị viên đang hoạt động.',
  ACCOUNT_ROLES_REQUIRED: 'Tài khoản phải có một vai trò mới kích hoạt được.',
}

export async function apiRequest<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: options.signal ?? controller.signal,
      credentials: 'omit',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    if (!response.ok) {
      if (response.status === 401 && token) {
        window.dispatchEvent(new CustomEvent('smartdronehub:unauthorized', { detail: token }))
      }
      const problem = (await response.json().catch(() => ({}))) as { code?: string; detail?: string }
      throw new ApiError(
        errorMessages[problem.code ?? ''] ??
          (response.status === 401
            ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            : problem.detail || 'Không thể thực hiện yêu cầu. Vui lòng thử lại.'),
        response.status,
      )
    }
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new Error('Không thể kết nối máy chủ. Kiểm tra BE, địa chỉ API và cấu hình CORS rồi thử lại.')
  } finally {
    window.clearTimeout(timer)
  }
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.'
