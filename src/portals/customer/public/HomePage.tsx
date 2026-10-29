import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Brand from '@/components/brand/Brand'
import Icon from '@/components/ui/Icon'
import { useAuth } from '@/auth/authContext'
import { gsap, useGSAP, ScrollTrigger } from '@/motion/gsap'

const steps = [
  {
    title: 'Kết nối cánh đồng',
    description: 'Xem khu vực canh tác của bạn. Đề xuất thêm mới hoặc cập nhật thông tin khi cần.',
    icon: 'crop_free',
    label: 'Khu vực canh tác',
    value: 'Cánh đồng của bạn',
    status: 'Thông tin tập trung',
  },
  {
    title: 'Gửi điều bạn cần',
    description: 'Chọn yêu cầu về cánh đồng hoặc nhiệm vụ. Điền thông tin và gửi đến đội ngũ vận hành.',
    icon: 'edit_note',
    label: 'Phiếu yêu cầu',
    value: 'Sẵn sàng gửi yêu cầu',
    status: 'Bạn kiểm tra và xác nhận',
  },
  {
    title: 'Theo dõi từng bước',
    description: 'Cập nhật trạng thái, bổ sung thông tin và nhận kết quả ngay trên cùng một phiếu.',
    icon: 'task_alt',
    label: 'Tiến trình xử lý',
    value: 'Mọi cập nhật, một nơi',
    status: 'Rõ ràng đến khi hoàn tất',
  },
]
const questions = [
  [
    'Tôi có thể gửi những loại yêu cầu nào?',
    'Bạn có thể gửi phiếu về khu vực canh tác với ba hành động: thêm mới, chỉnh sửa hoặc ngưng sử dụng cánh đồng; hoặc gửi phiếu yêu cầu nhiệm vụ. Biểu mẫu sẽ hiển thị các thông tin phù hợp với loại phiếu.',
  ],
  [
    'Cần chuẩn bị gì để gửi yêu cầu nhiệm vụ?',
    'Bạn cần có cánh đồng đang hoạt động và đã được xác minh trong Farm của mình. Khi gửi phiếu, chọn cánh đồng, mô tả mục tiêu và ngày mong muốn để đội ngũ vận hành xem xét.',
  ],
  [
    'Tôi theo dõi kết quả ở đâu?',
    'Sau khi đăng nhập, vào Phiếu yêu cầu của tôi. Mỗi phiếu có trạng thái, lịch sử xử lý và phản hồi để bạn theo dõi hoặc bổ sung thông tin khi được yêu cầu.',
  ],
  [
    'Đề xuất chỉnh sửa có thay đổi cánh đồng ngay không?',
    'Đề xuất của bạn được gửi đến người quản lý để kiểm tra. Thông tin cánh đồng chính thức chỉ được cập nhật sau bước xác minh và xử lý của đội ngũ vận hành.',
  ],
]

function WorkflowPreview({ step }: { step: number }) {
  const container = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap.from(container.current, { y: 12, autoAlpha: 0, duration: 0.45, ease: 'power2.out' })
        },
        container,
      )
      return () => media.revert()
    },
    { scope: container, dependencies: [step], revertOnUpdate: true },
  )
  return (
    <div className="workflow-preview" ref={container}>
      <div className="workflow-preview-top">
        <span>
          <i />
          SMARTDRONEHUB
        </span>
        <span>MINH HỌA QUY TRÌNH</span>
      </div>
      <div className="workflow-map">
        <img
          src="/images/terraces-detail.webp"
          alt="Các thửa ruộng xanh từ góc nhìn trên cao"
          loading="lazy"
          width="1200"
          height="900"
        />
        <svg viewBox="0 0 400 230" aria-hidden="true">
          <path
            d="M90 45 250 32 330 132 215 198 65 146Z"
            fill="#d7f5a8"
            fillOpacity=".17"
            stroke="#ddffac"
            strokeWidth="2"
            strokeDasharray={step === 0 ? undefined : '7 4'}
          />
          <circle cx="195" cy="110" r="23" fill="#f2f6e9" />
          <path d="m185 110 7 7 14-15" fill="none" stroke="#23583c" strokeWidth="3" />
        </svg>
        <span>
          <Icon name="location_on" size={14} />
          Không gian canh tác của bạn
        </span>
      </div>
      <div className="workflow-preview-body">
        <span className="workflow-preview-icon">
          <Icon name={steps[step].icon} />
        </span>
        <div>
          <small>{steps[step].label}</small>
          <h3>{steps[step].value}</h3>
        </div>
        <span className="workflow-preview-check">
          <Icon name="check" size={18} />
        </span>
      </div>
      <div className="workflow-preview-status">
        <span className="status-dot" />
        {steps[step].status}
        <span>0{step + 1} / 03</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null)
  const { session } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [step, setStep] = useState(0)
  const entry = session ? '/customer' : '/dang-nhap'
  useEffect(() => {
    document.title = 'SmartDroneHub · Chạm công nghệ. Nâng tầm mùa vụ.'
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest('.public-nav')) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        container.current?.querySelector<HTMLButtonElement>('.public-menu-toggle')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 900px)' },
        (context) => {
          const { motion, desktop } = context.conditions ?? {}
          if (!motion) return
          gsap
            .timeline({ defaults: { duration: 1, ease: 'power3.out' } })
            .from('.public-nav', { y: -18, autoAlpha: 0 })
            .from('.hero-eyebrow', { y: 15, autoAlpha: 0 }, '-=.6')
            .from('.hero-title-line', { y: 55, autoAlpha: 0, stagger: 0.13 }, '-=.7')
            .from('.hero-description, .hero-actions', { y: 22, autoAlpha: 0, stagger: 0.1 }, '-=.65')
            .from('.hero-field-note, .hero-bottom', { y: 20, autoAlpha: 0, stagger: 0.12 }, '-=.6')
          gsap.utils.toArray<HTMLElement>('[data-reveal]', container.current!).forEach((element) => {
            gsap.from(element, {
              y: 35,
              // Keep links and controls in the accessibility tree while they enter the viewport.
              opacity: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 92%', once: true },
            })
          })
          if (desktop)
            gsap.to('.hero-image', {
              yPercent: 12,
              ease: 'none',
              scrollTrigger: { trigger: '.public-hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
            })
          gsap.fromTo(
            '.hero-route',
            { strokeDashoffset: 700 },
            { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' },
          )
        },
        container,
      )
      const onReady = () => ScrollTrigger.refresh()
      window.addEventListener('load', onReady, { once: true })
      let active = true
      void document.fonts.ready.then(() => {
        if (active) ScrollTrigger.refresh()
      })
      return () => {
        active = false
        media.revert()
        window.removeEventListener('load', onReady)
      }
    },
    { scope: container },
  )

  return (
    <div className="public-site" ref={container}>
      <a href="#main-content" className="skip-link">
        Đến nội dung chính
      </a>
      <header
        className="public-nav"
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest('a')) setMenuOpen(false)
        }}
      >
        <Brand />
        <nav
          id="customer-site-navigation"
          aria-label="Điều hướng trang chủ"
          className={menuOpen ? 'public-links is-open' : 'public-links'}
          onClick={() => setMenuOpen(false)}
        >
          <a href="#giai-phap">Giải pháp</a>
          <a href="#cach-hoat-dong">Cách hoạt động</a>
          <a href="#cau-hoi">Câu hỏi thường gặp</a>
        </nav>
        <div className="public-nav-actions">
          <Link to={entry} className="public-sign-in">
            {session ? 'Tài khoản' : 'Đăng nhập'}
            <Icon name="north_east" size={17} />
          </Link>
          <button
            type="button"
            className="public-menu-toggle"
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            aria-controls="customer-site-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </header>
      <main id="main-content">
        <section className="public-hero" aria-labelledby="hero-title">
          <img
            src="/images/terraces-hero.webp"
            srcSet="/images/terraces-mobile.webp 800w, /images/terraces-hero.webp 1800w"
            sizes="(max-width: 700px) 100vw, 96vw"
            className="hero-image"
            fetchPriority="high"
            alt="Ruộng bậc thang xanh mướt nhìn từ bầu trời"
            width="1800"
            height="1467"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="site-eyebrow hero-eyebrow">
              <span className="status-dot" />
              CÔNG NGHỆ CHO MÙA VỤ MỚI
            </p>
            <h1 id="hero-title">
              <span className="hero-title-line">Chạm công nghệ.</span>
              <span className="hero-title-line">
                <em>Nâng tầm mùa vụ.</em>
              </span>
            </h1>
            <p className="hero-description">
              Từ cánh đồng của bạn đến đội ngũ vận hành.
              <br />
              Một kết nối thông minh, cho hành trình canh tác nhẹ nhàng hơn.
            </p>
            <div className="hero-actions">
              <Link to={entry} className="site-button site-button--lime">
                <span>Bắt đầu hành trình</span>
                <Icon name="north_east" size={20} />
              </Link>
              <a href="#giai-phap" className="hero-discover">
                Khám phá giải pháp
                <Icon name="south" size={18} />
              </a>
            </div>
          </div>
          <svg className="hero-flight-map" viewBox="0 0 520 440" aria-hidden="true">
            <path
              className="hero-route"
              d="M60 285 180 60 380 100 450 290 260 385Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="700"
            />
            <path
              d="M60 285 450 290M180 60l80 325M380 100 60 285"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".22"
            />
            <circle cx="380" cy="100" r="6" fill="currentColor" />
            <circle cx="380" cy="100" r="22" fill="none" stroke="currentColor" strokeOpacity=".6" />
            <path d="m372 100 8-8 8 8-8 8Z" fill="#173c2d" />
          </svg>
          <div className="hero-field-note">
            <span>
              <Icon name="explore" size={19} />
              TỪ MỘT GÓC NHÌN MỚI
            </span>
            <p>
              Mọi cánh đồng.
              <br />
              Trong một tầm nhìn.
            </p>
            <div>
              <span className="status-dot" />
              Kết nối để cùng vun trồng
            </div>
          </div>
          <div className="hero-bottom">
            <span>SMART AGRICULTURE. HUMAN CONNECTION.</span>
            <a href="#giai-phap" aria-label="Cuộn đến giải pháp">
              <Icon name="south" size={20} />
            </a>
            <span>01 — MỘT KHỞI ĐẦU XANH</span>
          </div>
        </section>
        <div className="public-values" data-reveal>
          {[
            ['crop_free', 'Hiểu rõ từng cánh đồng'],
            ['description', 'Yêu cầu trong tầm tay'],
            ['sync_alt', 'Kết nối đội ngũ vận hành'],
            ['verified', 'Minh bạch từng bước'],
          ].map(([icon, label]) => (
            <span key={label}>
              <Icon name={icon} size={21} />
              {label}
            </span>
          ))}
        </div>
        <section id="giai-phap" className="public-section solutions-section">
          <div className="section-heading" data-reveal>
            <div>
              <p className="site-eyebrow">01 / GIẢI PHÁP CỦA CHÚNG TÔI</p>
              <h2>
                Công nghệ gần hơn.
                <br />
                <em>Canh tác nhẹ nhàng hơn.</em>
              </h2>
            </div>
            <p>
              Ít thao tác hơn để bạn dành nhiều thời gian hơn cho điều quan trọng: chăm sóc cánh đồng và mùa vụ của
              mình.
            </p>
          </div>
          <div className="solution-grid">
            <Link to={entry} className="solution-card solution-card--field" data-reveal>
              <img
                src="/images/terraces-detail.webp"
                alt="Những thửa ruộng nối tiếp nhau"
                loading="lazy"
                width="1200"
                height="900"
              />
              <div className="solution-card-shade" />
              <span className="solution-number">01 — KHU VỰC CANH TÁC</span>
              <span className="solution-arrow">
                <Icon name="north_east" />
              </span>
              <div className="field-boundary" aria-hidden="true">
                <svg viewBox="0 0 300 200">
                  <path
                    d="M35 62 175 25 265 110 155 180 30 145Z"
                    fill="#daffb8"
                    fillOpacity=".16"
                    stroke="#e2ffc1"
                    strokeWidth="2"
                  />
                  {[
                    [35, 62],
                    [175, 25],
                    [265, 110],
                    [155, 180],
                    [30, 145],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#e2ffc1" />
                  ))}
                </svg>
                <span>
                  <i />
                  Một góc nhìn toàn diện
                </span>
              </div>
              <div className="solution-card-copy">
                <h3>
                  Một nơi cho
                  <br />
                  mọi cánh đồng.
                </h3>
                <p>Theo dõi thông tin, ranh giới và các đề xuất thay đổi trong không gian của riêng bạn.</p>
              </div>
            </Link>
            <Link to={entry} className="solution-card solution-card--request" data-reveal>
              <span className="solution-number">02 — PHIẾU YÊU CẦU</span>
              <span className="solution-arrow">
                <Icon name="north_east" />
              </span>
              <div className="mini-request" aria-hidden="true">
                <span>
                  <Icon name="edit_note" />
                  Phiếu yêu cầu mới
                </span>
                <p>Chọn điều bạn cần</p>
                <div>
                  <Icon name="crop_free" size={16} />
                  Khu vực canh tác
                  <Icon name="check_circle" size={17} />
                </div>
                <div>
                  <Icon name="flight" size={16} />
                  Yêu cầu nhiệm vụ
                  <Icon name="add_circle_outline" size={17} />
                </div>
              </div>
              <div className="solution-card-copy">
                <h3>
                  Gửi yêu cầu,
                  <br />
                  <em>thật nhẹ nhàng.</em>
                </h3>
                <p>Một biểu mẫu phù hợp với điều bạn cần. Đội ngũ vận hành tiếp nhận và đồng hành cùng bạn.</p>
              </div>
            </Link>
            <Link to={entry} className="solution-card solution-card--tracking" data-reveal>
              <span className="solution-number">03 — THEO DÕI TIẾN TRÌNH</span>
              <span className="solution-arrow">
                <Icon name="north_east" />
              </span>
              <div className="mini-timeline" aria-hidden="true">
                {['Đã gửi yêu cầu', 'Đội ngũ đã tiếp nhận', 'Cập nhật kết quả'].map((label, i) => (
                  <div key={label}>
                    <span className={i === 2 ? 'is-next' : ''}>
                      <Icon name={i === 2 ? 'more_horiz' : 'check'} size={14} />
                    </span>
                    <p>
                      {label}
                      <small>{i === 2 ? 'Theo dõi ngay trên phiếu' : 'Thông tin luôn rõ ràng'}</small>
                    </p>
                  </div>
                ))}
              </div>
              <div className="solution-card-copy">
                <h3>
                  An tâm
                  <br />
                  trong từng bước.
                </h3>
                <p>Trạng thái và phản hồi được cập nhật trên cùng một phiếu. Dễ tìm, dễ hiểu, dễ theo dõi.</p>
              </div>
            </Link>
          </div>
        </section>
        <section id="cach-hoat-dong" className="workflow-section">
          <div className="workflow-intro" data-reveal>
            <p className="site-eyebrow">02 / ĐƠN GIẢN TỪ LẦN ĐẦU</p>
            <h2>
              Ba bước kết nối.
              <br />
              <em>Một hành trình đồng hành.</em>
            </h2>
            <p>
              Bạn cho chúng tôi biết điều bạn cần.
              <br />
              Mọi bước tiếp theo đều được theo dõi rõ ràng.
            </p>
            <div className="workflow-steps" role="group" aria-label="Khám phá quy trình">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={step === index ? 'workflow-step is-active' : 'workflow-step'}
                  aria-pressed={step === index}
                  onClick={() => setStep(index)}
                >
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    {step === index && <p>{item.description}</p>}
                  </div>
                  <Icon name="north_east" size={18} />
                </button>
              ))}
            </div>
          </div>
          <div className="workflow-visual" data-reveal>
            <div className="workflow-decoration" />
            <WorkflowPreview step={step} />
            <p className="workflow-footnote">
              <Icon name="hub" size={18} />
              Từ đồng ruộng đến đội ngũ, luôn kết nối.
            </p>
          </div>
        </section>
        <section id="cau-hoi" className="public-section faq-section">
          <div data-reveal>
            <p className="site-eyebrow">03 / MỘT CHÚT GIẢI ĐÁP</p>
            <h2>
              Bạn hỏi.
              <br /> <em>Chúng tôi lắng nghe.</em>
            </h2>
            <p>
              Một vài điều hữu ích trước khi
              <br />
              bạn bắt đầu cùng SmartDroneHub.
            </p>
            <Link to={entry} className="text-link">
              Khám phá không gian của bạn
              <Icon name="north_east" size={18} />
            </Link>
          </div>
          <div className="faq-list" data-reveal>
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span>
                    <Icon name="add" size={20} />
                  </span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="public-cta" data-reveal>
          <div>
            <p className="site-eyebrow">
              <span className="status-dot" />
              CÙNG NHAU VUN TRỒNG
            </p>
            <h2>
              Mùa vụ tiếp theo,
              <br />
              <em>bắt đầu từ đây.</em>
            </h2>
            <Link to={entry} className="site-button site-button--lime">
              <span>Vào không gian của bạn</span>
              <Icon name="north_east" size={20} />
            </Link>
          </div>
          <div className="cta-image">
            <img
              src="/images/terraces-detail.webp"
              alt="Mảng xanh từ những cánh đồng"
              loading="lazy"
              width="1200"
              height="900"
            />
            <span>
              <Icon name="eco" size={30} />
            </span>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <div className="public-footer-top">
          <Brand />
          <p>Chạm công nghệ. Nâng tầm mùa vụ.</p>
          <a href="#main-content" className="footer-top-link">
            Về đầu trang
            <Icon name="north" size={18} />
          </a>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} SmartDroneHub. Một sản phẩm của 5BROS.</span>
          <div>
            <Link to="/staff/dang-nhap">
              Dành cho nhân sự
              <Icon name="north_east" size={13} />
            </Link>
            <Link to="/admin/dang-nhap">
              Quản trị
              <Icon name="north_east" size={13} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
