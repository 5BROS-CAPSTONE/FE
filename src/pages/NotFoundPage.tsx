import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import PageHeading from '@/components/ui/PageHeading'

export default function NotFoundPage({ title = 'Không tìm thấy trang' }: { title?: string }) {
  return (
    <>
      <PageHeading title={title} />
      <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
        <Icon name="search_off" size={40} className="text-outline" />
        <p className="text-on-surface-variant">Đường dẫn không tồn tại hoặc dữ liệu đã bị thay đổi.</p>
        <Link to="/drones" className="mt-space-sm font-label-lg text-label-lg text-primary hover:underline">
          Về danh sách drone
        </Link>
      </div>
    </>
  )
}
