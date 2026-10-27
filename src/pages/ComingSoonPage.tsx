import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeading from '../components/PageHeading'

// Placeholder for menu sections that have no Stitch screens yet
export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <PageHeading title={title} />
      <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
        <Icon name="construction" size={40} className="text-outline" />
        <p className="font-title-md text-title-md">Màn hình đang được thiết kế</p>
        <p className="text-on-surface-variant">Chức năng “{title}” chưa có thiết kế trên Stitch.</p>
        <Link to="/drones" className="mt-space-sm font-label-lg text-label-lg text-primary hover:underline">
          Về danh sách drone
        </Link>
      </div>
    </>
  )
}
