import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, useGSAP } from './gsap'

export default function PageTransition({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap.fromTo(
            container.current,
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
          )
        },
        container,
      )
      return () => media.revert()
    },
    { scope: container, dependencies: [pathname], revertOnUpdate: true },
  )
  return (
    <div ref={container} className="page-transition">
      {children}
    </div>
  )
}
