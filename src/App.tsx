import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ComingSoonPage from './pages/ComingSoonPage'
import DroneDetailPage from './pages/drones/DroneDetailPage'
import DroneFormPage from './pages/drones/DroneFormPage'
import DroneListPage from './pages/drones/DroneListPage'
import UavProfileFormPage from './pages/uav-profiles/UavProfileFormPage'
import UavProfileListPage from './pages/uav-profiles/UavProfileListPage'
import { FleetProvider } from './store/FleetProvider'

// Menu sections without Stitch screens yet
const comingSoon = [
  ['nhiem-vu', 'Nhiệm vụ'],
  ['lap-ke-hoach', 'Lập kế hoạch'],
  ['danh-gia-kha-thi', 'Đánh giá khả thi'],
  ['pin', 'Pin'],
  ['khu-vuc-canh-tac', 'Khu vực canh tác'],
  ['du-lieu-moi-truong', 'Dữ liệu môi trường'],
  ['bao-cao', 'Báo cáo'],
  ['cau-hinh', 'Cấu hình'],
]

export default function App() {
  return (
    <FleetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/drones" replace />} />
            <Route path="uav-profiles" element={<UavProfileListPage />} />
            <Route path="uav-profiles/new" element={<UavProfileFormPage />} />
            <Route path="uav-profiles/:id/edit" element={<UavProfileFormPage />} />
            <Route path="drones" element={<DroneListPage />} />
            <Route path="drones/new" element={<DroneFormPage />} />
            <Route path="drones/:id" element={<DroneDetailPage />} />
            <Route path="drones/:id/edit" element={<DroneFormPage />} />
            {comingSoon.map(([path, title]) => (
              <Route key={path} path={path} element={<ComingSoonPage title={title} />} />
            ))}
            <Route path="*" element={<ComingSoonPage title="Không tìm thấy trang" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FleetProvider>
  )
}
