import { Link } from 'react-router-dom'

export default function Brand({
  to = '/',
  light = false,
  caption = 'CÔNG NGHỆ VUN TRỒNG TƯƠNG LAI',
}: {
  to?: string
  light?: boolean
  caption?: string
}) {
  return (
    <Link to={to} className={`brand ${light ? 'brand--light' : ''}`} aria-label="SmartDroneHub · Trang chủ">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <path
          d="M22 19C4 20 6 2 17 7c5 2 5 8 5 12Zm3 3c-1-18 17-16 12-5-2 5-8 5-12 5Zm-3 3c18-1 16 17 5 12-5-2-5-8-5-12Zm-3-3c1 18-17 16-12 5 2-5 8-5 12-5Z"
          fill="currentColor"
        />
        <circle cx="22" cy="22" r="3" fill="currentColor" />
      </svg>
      <span>
        <strong>
          SmartDrone<span>Hub</span>
        </strong>
        <small>{caption}</small>
      </span>
    </Link>
  )
}
