import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import DroneListPage from './pages/drones/DroneListPage'
import UavProfileListPage from './pages/uav-profiles/UavProfileListPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="drones" element={<DroneListPage />} />
          <Route path="uav-profiles" element={<UavProfileListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
