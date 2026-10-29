import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from '@/app/routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <div className="auth-loading" role="status">
          SmartDroneHub · Đang chuẩn bị không gian của bạn…
        </div>
      }
    />
  )
}
