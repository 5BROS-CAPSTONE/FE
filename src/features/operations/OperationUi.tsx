import { useId, type MouseEvent, type ReactNode } from 'react'
import Button from '@/components/ui/Button'
import { formatArea, measurePolygon, provinceCenters, type Point } from './geometry'
import { ticketStatusText } from './operationLabels'
import type { TicketStatus } from './operationsModel'

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-surface-container text-on-surface-variant',
  SUBMITTED: 'bg-tertiary-fixed text-tertiary',
  UNDER_REVIEW: 'bg-warning-container text-on-warning-container',
  NEEDS_INFO: 'bg-warning-container text-on-warning-container',
  INFO_UPDATED: 'bg-warning-container text-on-warning-container',
  ACCEPTED: 'bg-primary-fixed/40 text-primary',
  IN_PROGRESS: 'bg-tertiary-fixed text-tertiary',
  RESOLVED: 'bg-primary-fixed/40 text-primary',
  CLOSED: 'bg-surface-container text-on-surface-variant',
  REJECTED: 'bg-error-container text-error',
  CANCELLED: 'bg-error-container text-error',
  ACTIVE: 'bg-primary-fixed/40 text-primary',
  INACTIVE: 'bg-error-container text-error',
  VERIFIED: 'bg-primary-fixed/40 text-primary',
  UNVERIFIED: 'bg-warning-container text-on-warning-container',
}

export function StatusPill({ status }: { status: string }) {
  const label =
    ticketStatusText[status as TicketStatus] ??
    { ACTIVE: 'Hoạt động', INACTIVE: 'Ngưng sử dụng', VERIFIED: 'Đã xác minh', UNVERIFIED: 'Chưa xác minh' }[status] ??
    status
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? statusStyles.DRAFT}`}
    >
      {label}
    </span>
  )
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="operation-intro mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' | 'error' }) {
  const style =
    tone === 'error'
      ? 'border-error/20 bg-error-container/50 text-error'
      : tone === 'warning'
        ? 'border-warning-outline bg-warning-container text-on-warning-container'
        : 'border-primary/10 bg-primary-fixed/10 text-on-surface-variant'
  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${style}`}>{children}</div>
}

export function Panel({
  title,
  aside,
  children,
  className = '',
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`operation-panel overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm ${className}`}
    >
      <div className="flex min-h-14 items-center justify-between gap-3 border-b border-outline-variant/40 px-5 py-3">
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
        {aside && <div className="text-xs text-on-surface-variant">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

export function Metrics({ items }: { items: { label: string; value: string | number; note?: string }[] }) {
  const columns = items.length === 3 ? 'xl:grid-cols-3' : items.length === 2 ? 'xl:grid-cols-2' : 'xl:grid-cols-4'
  return (
    <div className={`mb-5 grid gap-3 sm:grid-cols-2 ${columns}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="operation-metric rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-5 py-4 shadow-sm"
        >
          <p className="text-xs text-on-surface-variant">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">{item.value}</p>
          {item.note && <p className="mt-1 text-xs text-on-surface-variant">{item.note}</p>}
        </div>
      ))}
    </div>
  )
}

export const inputClass =
  'min-h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-container-low'
export const textareaClass = `${inputClass} min-h-24 resize-y`
export const labelClass = 'mb-1.5 block text-sm font-semibold text-on-surface'
export const tableClass = 'w-full min-w-[750px] text-left text-sm'
export const thClass =
  'bg-surface-container-low/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant'
export const tdClass = 'border-t border-outline-variant/30 px-4 py-3 align-top'

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left font-semibold text-primary hover:underline">
      {children}
    </button>
  )
}

export function LabeledValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-on-surface-variant">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-on-surface">{value || '—'}</dd>
    </div>
  )
}

export function BoundaryMap({
  points,
  province,
  onChange,
  title = 'Ranh giới',
}: {
  points: Point[]
  province: string
  onChange?: (points: Point[]) => void
  title?: string
}) {
  const patternId = useId().replaceAll(':', '')
  const center = onChange
    ? (provinceCenters[province] ?? provinceCenters.Khác)
    : points.length
      ? points.reduce<Point>(
          (sum, point) => [sum[0] + point[0] / points.length, sum[1] + point[1] / points.length],
          [0, 0],
        )
      : (provinceCenters[province] ?? provinceCenters.Khác)
  const coordinates = (point: Point): [number, number] => [
    320 + ((point[0] - center[0]) / 0.012) * 640,
    150 - ((point[1] - center[1]) / 0.0064) * 300,
  ]
  const polygon = points.map((point) => coordinates(point).join(',')).join(' ')
  const measurement = measurePolygon(points)

  const addPoint = (event: MouseEvent<SVGSVGElement>) => {
    if (!onChange) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 640
    const y = ((event.clientY - rect.top) / rect.height) * 300
    onChange([
      ...points,
      [
        Number((center[0] + ((x - 320) / 640) * 0.012).toFixed(7)),
        Number((center[1] - ((y - 150) / 300) * 0.0064).toFixed(7)),
      ],
    ])
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-[#eaf2e9]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#e0ecdf] px-4 py-2 text-xs font-semibold text-[#315f42]">
        <span>Lưới tọa độ WGS84 mô phỏng · {province}</span>
        {onChange ? (
          <span className="flex gap-2">
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onChange(points.slice(0, -1))}
              disabled={!points.length}
            >
              Hoàn tác
            </Button>
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => onChange([])}
              disabled={!points.length}
            >
              Vẽ lại
            </Button>
          </span>
        ) : (
          <span>{title}</span>
        )}
      </div>
      <svg
        viewBox="0 0 640 300"
        role="img"
        aria-label={onChange ? 'Nhấp để đặt đỉnh ranh giới' : title}
        className={`w-full ${onChange ? 'cursor-crosshair' : ''}`}
        onClick={addPoint}
      >
        <defs>
          <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cadbcd" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="300" fill="#eaf2e9" />
        <rect width="640" height="300" fill={`url(#${patternId})`} />
        <path d="M -20 190 Q 145 175 250 235 T 680 175" fill="none" stroke="#a6c8d5" strokeWidth="19" opacity=".48" />
        <path d="M 0 68 Q 120 95 220 55 T 640 92" fill="none" stroke="#d3dfb8" strokeWidth="15" opacity=".5" />
        {points.length >= 3 ? (
          <polygon points={polygon} fill="#1c9864" fillOpacity=".28" stroke="#128655" strokeWidth="3" />
        ) : points.length > 1 ? (
          <polyline points={polygon} fill="none" stroke="#128655" strokeWidth="3" />
        ) : null}
        {points.map((point, index) => {
          const [x, y] = coordinates(point)
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="6" fill="white" stroke="#0c7f4e" strokeWidth="3" />
              <text x={x + 10} y={y - 8} fontSize="12" fontWeight="700" fill="#24563c">
                {index + 1}
              </text>
            </g>
          )
        })}
        <text x="16" y="25" fontSize="10" fill="#5d816b">
          {center[1].toFixed(4)}°N · {center[0].toFixed(4)}°E
        </text>
        <text x="440" y="283" fontSize="10" fill="#5d816b">
          BẢN ĐỒ MÔ PHỎNG
        </text>
      </svg>
      <div className="grid grid-cols-3 border-t border-outline-variant/50 bg-surface-container-lowest text-center">
        <div className="px-2 py-3">
          <small className="block text-on-surface-variant">Số đỉnh</small>
          <strong>{points.length}</strong>
        </div>
        <div className="border-x border-outline-variant/40 px-2 py-3">
          <small className="block text-on-surface-variant">Diện tích tính</small>
          <strong>{points.length >= 3 ? `${formatArea(measurement.area)} ha` : 'Chưa khép kín'}</strong>
        </div>
        <div className="px-2 py-3">
          <small className="block text-on-surface-variant">Chu vi tính</small>
          <strong>{points.length >= 3 ? `${formatArea(measurement.perimeter)} m` : '—'}</strong>
        </div>
      </div>
      {onChange && points.length > 0 && (
        <p className="border-t border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface-variant">
          {points
            .map((point, index) => `Điểm ${index + 1}: ${point[1].toFixed(6)}°N, ${point[0].toFixed(6)}°E`)
            .join(' · ')}
        </p>
      )}
    </div>
  )
}
