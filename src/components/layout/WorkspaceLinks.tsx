import { Link } from 'react-router-dom'
import { flattenNavigation, type NavItem } from '@/app/navigation'
import Icon from '@/components/ui/Icon'
export default function WorkspaceLinks({ items }: { items: NavItem[] }) {
  const links = flattenNavigation(items).filter((item) => !item.exact && !item.to.endsWith('/ho-so'))
  return (
    <div
      className={`workspace-links grid gap-4 md:grid-cols-2 ${links.length > 2 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}
    >
      {links.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="group flex items-center gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-primary-fixed/10"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-fixed/20 text-primary">
            <Icon name={item.icon ?? 'folder_open'} />
          </span>
          <span className="flex-1 font-semibold">{item.label}</span>
          <Icon name="arrow_forward" size={18} className="text-on-surface-variant group-hover:text-primary" />
        </Link>
      ))}
    </div>
  )
}
