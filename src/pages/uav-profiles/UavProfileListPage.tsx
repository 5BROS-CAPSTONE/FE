import PageHeader from '../../components/PageHeader'
import { uavProfiles } from '../../mocks/data'

// Placeholder — will be replaced with the Stitch "UAV Profile" screen
export default function UavProfileListPage() {
  return (
    <>
      <PageHeader title="UAV Profile" />
      <ul className="divide-y rounded-xl bg-white shadow-sm">
        {uavProfiles.map((p) => (
          <li key={p.id} className="flex justify-between px-5 py-3 text-sm">
            <span className="font-medium">{p.name}</span>
            <span className="text-neutral">{p.manufacturer}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
