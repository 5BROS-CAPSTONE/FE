import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/authContext'
import { ApiError, apiRequest, errorMessage } from '@/auth/api'
import { roleLabels, rolePermissions, type BackendRole } from '@/auth/model'
import { Notice, PageIntro, Panel } from '@/features/operations/OperationUi'
import Button from '@/components/ui/Button'
interface RoleRecord {
  name: BackendRole
  label: string
  permissions: string[]
}
export default function RolesPage() {
  const { session, expire } = useAuth()
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const token = session?.accessToken
  const mode = session?.mode
  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const next =
          mode === 'demo'
            ? (Object.keys(rolePermissions) as BackendRole[]).map((name) => ({
                name,
                label: roleLabels[name],
                permissions: rolePermissions[name],
              }))
            : await apiRequest<RoleRecord[]>('/roles', token)
        if (active) setRoles(next)
      } catch (failure) {
        if (active) {
          if (failure instanceof ApiError && failure.status === 401) expire()
          else setError(errorMessage(failure))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [token, mode, expire, reload])
  return (
    <>
      <PageIntro
        eyebrow="Quản trị"
        title="Vai trò và quyền"
        description="Các vai trò nội bộ và quyền đã được cấp trong hệ thống."
        actions={
          <Button variant="outline" onClick={() => setReload((value) => value + 1)}>
            Tải lại
          </Button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <p role="status">Đang tải vai trò…</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Panel key={role.name} title={roleLabels[role.name] ?? role.label} aside={role.name}>
              <div className="p-5">
                <p className="mb-3 text-xs text-on-surface-variant">{role.permissions.length} quyền đã cấp</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-md bg-surface-container-low px-2 py-1 font-mono text-xs text-on-surface-variant"
                    >
                      {permission}
                    </span>
                  ))}
                  {!role.permissions.length && (
                    <p className="text-sm text-on-surface-variant">
                      Chưa có quyền API nghiệp vụ được cấp cho vai trò này.
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  )
}
