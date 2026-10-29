import { Outlet, ScrollRestoration } from 'react-router-dom'
export default function SiteRoot() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
