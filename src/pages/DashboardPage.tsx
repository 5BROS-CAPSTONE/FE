import PageHeader from '../components/PageHeader'
import { drones, uavProfiles } from '../mocks/data'

export default function DashboardPage() {
  const stats = [
    { label: 'Tổng số drone', value: drones.length },
    { label: 'Đang hoạt động', value: drones.filter((d) => d.status === 'active').length },
    { label: 'UAV Profile', value: uavProfiles.length },
  ]
  return (
    <>
      <PageHeader title="Tổng quan đội bay" />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </>
  )
}
