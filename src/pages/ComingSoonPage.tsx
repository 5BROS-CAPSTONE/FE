import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import PageHeading from '@/components/ui/PageHeading'
import { usePortalPath } from '@/app/usePortalNavigation'

// Placeholder for menu sections that have no Stitch screens yet
export default function ComingSoonPage({ title }: { title: string }) {
  const pathFor = usePortalPath()
  return (
    <>
      <PageHeading title={title} />
      <div className="flex flex-col items-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
        <Icon name="construction" size={40} className="text-outline" />
        <p className="font-title-md text-title-md">Màn hình đang được thiết kế</p>
        <p className="text-on-surface-variant">Chức năng “{title}” chưa có thiết kế trên Stitch.</p>
        <Link to={pathFor()} className="mt-space-sm font-label-lg text-label-lg text-primary hover:underline">
          Về trang tổng quan
        </Link>
      </div>
    </>
  )
}
