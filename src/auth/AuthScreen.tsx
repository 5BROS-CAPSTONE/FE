import { useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Brand from '@/components/brand/Brand'
import Icon from '@/components/ui/Icon'
import { gsap, useGSAP } from '@/motion/gsap'
import { useAuth } from './authContext'
import { loginPath, type Portal } from './model'
import LoginForm from './LoginForm'

const content = {
  customer: {
    eyebrow: 'KHÔNG GIAN KHÁCH HÀNG',
    title: 'Chào mừng trở lại.',
    description: 'Mỗi cánh đồng, mỗi yêu cầu — luôn trong tầm tay bạn.',
    headline: ['Mùa vụ tốt hơn,', 'bắt đầu từ bạn.'],
    note: 'Công nghệ đến gần hơn với đồng ruộng.',
    code: 'GROW WITH CONFIDENCE',
  },
  staff: {
    eyebrow: 'SMARTDRONEHUB · OPERATIONS',
    title: 'Bắt đầu ca làm việc.',
    description: 'Đăng nhập không gian vận hành dành cho đội ngũ của bạn.',
    headline: ['Sẵn sàng cho', 'mỗi chuyến bay.'],
    note: 'Kết nối đội ngũ. Đồng bộ từng nhiệm vụ.',
    code: 'OPERATIONS WORKSPACE',
  },
  admin: {
    eyebrow: 'SMARTDRONEHUB · ADMINISTRATION',
    title: 'Chào quản trị viên.',
    description: 'Truy cập trung tâm quản trị và kiểm soát hệ thống.',
    headline: ['Vận hành vững vàng.', 'Quản trị tinh gọn.'],
    note: 'Đúng người. Đúng quyền. Đúng không gian.',
    code: 'SYSTEM CONTROL CENTER',
  },
}

export default function AuthScreen({ portal }: { portal: Portal }) {
  const { session, loading } = useAuth()
  const container = useRef<HTMLElement>(null)
  const text = content[portal]
  useEffect(() => {
    document.title = `${portal === 'customer' ? 'Đăng nhập khách hàng' : portal === 'staff' ? 'Đăng nhập nhân viên' : 'Đăng nhập quản trị'} · SmartDroneHub`
  }, [portal])
  useGSAP(
    () => {
      if (!container.current) return
      const media = gsap.matchMedia()
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const timeline = gsap.timeline({ defaults: { duration: 0.85, ease: 'power3.out' } })
          timeline
            .from('[data-auth-brand]', { y: -15, autoAlpha: 0 })
            .from('[data-auth-copy] > *', { y: 28, autoAlpha: 0, stagger: 0.12 }, '-=.55')
            .from('[data-auth-form] > *', { y: 22, autoAlpha: 0, stagger: 0.09 }, '-=.65')
          if (portal !== 'customer') timeline.from('.auth-visual-art', { y: 25, autoAlpha: 0, duration: 1.1 }, '<')
          if (portal === 'admin')
            gsap.to('.auth-orbit', {
              rotation: 360,
              transformOrigin: 'center center',
              duration: 90,
              repeat: -1,
              ease: 'none',
            })
        },
        container,
      )
      return () => media.revert()
    },
    { scope: container, dependencies: [loading, !!session], revertOnUpdate: true },
  )
  if (loading)
    return (
      <div className="auth-loading" role="status">
        Đang chuẩn bị không gian của bạn…
      </div>
    )
  if (session) return <Navigate to={`/${portal}`} replace />

  return (
    <main ref={container} className={`auth-site auth-site--${portal}`}>
      <section className="auth-story">
        {portal === 'customer' && (
          <img
            className="auth-landscape"
            src="/images/terraces-hero.webp"
            alt="Những thửa ruộng xanh nhìn từ trên cao"
          />
        )}
        <div className="auth-story-shade" />
        <div data-auth-brand>
          <Brand light to={loginPath(portal)} caption={text.code} />
        </div>
        <div className="auth-story-body" data-auth-copy>
          <span className="site-eyebrow">
            <span className="status-dot" />
            {text.code}
          </span>
          <h1>
            {text.headline[0]}
            <br />
            <em>{text.headline[1]}</em>
          </h1>
          <p>{text.note}</p>
        </div>
        {portal !== 'customer' && (
          <div className="auth-visual-art" aria-hidden="true">
            {portal === 'staff' ? (
              <svg viewBox="0 0 600 340">
                <defs>
                  <pattern id="airspace-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeOpacity=".12" />
                  </pattern>
                </defs>
                <rect width="600" height="340" fill="url(#airspace-grid)" />
                <path
                  d="M85 250 160 130 320 175 455 85 540 140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="6 7"
                />
                <path
                  d="M70 310 25 130 155 40 280 90 350 30 560 70 580 270 430 315 240 270Z"
                  fill="currentColor"
                  fillOpacity=".04"
                  stroke="currentColor"
                  strokeOpacity=".3"
                />
                {[
                  [160, 130],
                  [320, 175],
                  [455, 85],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="27" fill="currentColor" fillOpacity=".07" />
                    <circle cx={x} cy={y} r="5" fill="currentColor" />
                    <text x={x + 15} y={y - 12} fill="currentColor" fontSize="10">
                      0{i + 1}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="auth-control-art">
                <svg viewBox="0 0 300 260" className="auth-orbit">
                  <circle cx="150" cy="130" r="115" fill="none" stroke="currentColor" strokeOpacity=".15" />
                  <circle
                    cx="150"
                    cy="130"
                    r="85"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".3"
                    strokeDasharray="3 11"
                  />
                  <circle cx="150" cy="15" r="5" fill="currentColor" />
                  <circle cx="150" cy="245" r="5" fill="currentColor" />
                </svg>
                <div>
                  <Icon name="verified_user" size={46} />
                  <span>ACCESS CONTROL</span>
                  <small>Identity · Roles · Permissions</small>
                </div>
              </div>
            )}
            <span className="auth-art-caption">
              {portal === 'staff' ? 'FLIGHT OPERATIONS / FIELD NETWORK' : 'SECURE BY DESIGN / CONTROL CENTER'}
            </span>
          </div>
        )}
        <div className="auth-story-bottom">
          <span>5BROS TECHNOLOGY</span>
          <span>AGRICULTURE, REIMAGINED.</span>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-panel-top">
          {portal === 'customer' ? (
            <Link to="/">
              <Icon name="west" size={17} />
              Về trang chủ
            </Link>
          ) : (
            <span>
              <Icon name={portal === 'admin' ? 'shield' : 'flight'} size={18} />
              {portal === 'admin' ? 'CỔNG QUẢN TRỊ' : 'CỔNG NHÂN VIÊN'}
            </span>
          )}
          <span>VI / VN</span>
        </div>
        <div className="auth-mobile-brand">
          <Brand to={portal === 'customer' ? '/' : loginPath(portal)} caption={text.code} />
        </div>
        <div className="auth-form-inner" data-auth-form>
          <p className="site-eyebrow">{text.eyebrow}</p>
          <h2>{text.title}</h2>
          <p className="auth-description">{text.description}</p>
          <LoginForm portal={portal} />
        </div>
        <div className="auth-panel-bottom">
          <span>© {new Date().getFullYear()} SmartDroneHub</span>
          <span>Chăm chút từng kết nối.</span>
        </div>
      </section>
    </main>
  )
}
