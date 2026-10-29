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
            { opacity: 0 },
            // Avoid transforming ancestors of fixed form action bars.
            { opacity: 1, duration: 0.25, ease: 'power2.out', clearProps: 'opacity' },
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
