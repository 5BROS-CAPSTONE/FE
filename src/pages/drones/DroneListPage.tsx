import PageHeader from '../../components/PageHeader'
import { drones } from '../../mocks/data'

// Placeholder — will be replaced with the Stitch "Danh sách drone" screen
export default function DroneListPage() {
  return (
    <>
      <PageHeader title="Danh sách drone" />
      <ul className="divide-y rounded-xl bg-white shadow-sm">
        {drones.map((d) => (
          <li key={d.id} className="flex justify-between px-5 py-3 text-sm">
            <span className="font-medium">{d.name}</span>
            <span className="text-neutral">{d.serialNumber}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
