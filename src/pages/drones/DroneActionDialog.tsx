import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Icon from '../../components/Icon'
import Modal, { InfoNote, ModalSectionLabel } from '../../components/Modal'
import { DroneStatusBadge, EffectTag } from '../../components/StatusBadge'
import { useFleet, type ReopenResult } from '../../store/fleetContext'
import type { Drone, Mission } from '../../types'
import { formatDate, missionStateLabel } from '../../utils/format'

export type DroneAction = 'unavailable' | 'reopen' | 'retire'

interface DroneActionDialogProps {
  drone: Drone
  action: DroneAction
  onClose: () => void
}

/** Routes a status action to the right dialog, enforcing the fleet rules. */
export default function DroneActionDialog({ drone, action, onClose }: DroneActionDialogProps) {
  if (drone.status === 'in-mission') return <BlockedDialog drone={drone} onClose={onClose} />
  if (action === 'unavailable') return <UnavailableDialog drone={drone} onClose={onClose} />
  if (action === 'reopen') return <ReopenDialog drone={drone} onClose={onClose} />
  return <RetireDialog drone={drone} onClose={onClose} />
}

function AffectedMissions({ missions, title }: { missions: Mission[]; title: string }) {
  if (missions.length === 0) return null
  return (
    <div>
      <ModalSectionLabel>
        {title} ({missions.length})
      </ModalSectionLabel>
      <div className="flex flex-col gap-2">
        {missions.map((m) => (
          <div key={m.id} className="flex flex-col gap-2.5 rounded-xl bg-surface-container-low p-3">
            <div className="font-title-sm text-title-sm font-medium">
              {m.name} – {formatDate(m.date)} – {missionStateLabel[m.state]}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <EffectTag kind="stale" />
              <EffectTag kind="planned" />
              <EffectTag kind="release" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockedDialog({ drone, onClose }: { drone: Drone; onClose: () => void }) {
  const { missions } = useFleet()
  const flying = missions.find((m) => m.droneId === drone.id && m.state === 'in-flight')
  return (
    <Modal
      tone="info"
      title={`Không thể thay đổi trạng thái ${drone.name}`}
      description={`Drone đang thực hiện nhiệm vụ${flying ? ` ${flying.name}` : ''}. Chỉ có thể chuyển Unavailable hoặc ngưng sử dụng sau khi nhiệm vụ kết thúc.`}
      onClose={onClose}
      footer={<Button onClick={onClose}>Đã hiểu</Button>}
    />
  )
}

function UnavailableDialog({ drone, onClose }: { drone: Drone; onClose: () => void }) {
  const { heldMissionsOf, markUnavailable, notify } = useFleet()
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const held = heldMissionsOf(drone.id)
  const missing = reason.trim() === ''

  const confirm = () => {
    setTouched(true)
    if (missing) return
    markUnavailable(drone.id, reason.trim())
    notify(`Đã chuyển ${drone.name} sang Unavailable`)
    onClose()
  }

  return (
    <Modal
      title={`Chuyển ${drone.name} sang Unavailable`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={confirm}>Xác nhận chuyển</Button>
        </>
      }
    >
      <div className="flex flex-col">
        <label htmlFor="reason" className="mb-1.5 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Lý do *
        </label>
        <textarea
          id="reason"
          rows={2}
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: Gãy cánh quạt số 3, chờ thay"
          className={`w-full resize-none rounded-xl border-0 bg-surface-container-low p-3 focus:outline-none focus:ring-2 ${
            touched && missing ? 'ring-1 ring-error focus:ring-error' : 'focus:ring-primary-container'
          }`}
        />
        <span className={`mt-1 font-body-sm text-body-sm ${touched && missing ? 'text-error' : 'text-on-surface-variant'}`}>
          Bắt buộc nhập lý do
        </span>
      </div>
      <AffectedMissions missions={held} title="Nhiệm vụ bị ảnh hưởng" />
      <InfoNote>
        {held.length > 0 ? 'Mission Manager sẽ nhận thông báo để chọn drone khác. ' : ''}Sửa xong, dùng Mở lại để đưa drone về
        Available.
      </InfoNote>
    </Modal>
  )
}

function ReopenDialog({ drone, onClose }: { drone: Drone; onClose: () => void }) {
  const navigate = useNavigate()
  const { reopenDrone, getProfile, notify } = useFleet()
  const [result, setResult] = useState<ReopenResult | null>(null)
  const profile = getProfile(drone.profileId)
  const lastChange = drone.history.find((h) => h.to === 'unavailable')

  if (result && !result.ok) {
    return (
      <Modal
        tone="error"
        title={`Chưa thể mở lại ${drone.name}`}
        onClose={onClose}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button icon="battery_charging_full" onClick={() => navigate('/pin')}>
              Đi tới gắn pin
            </Button>
          </>
        }
      >
        <p className="flex items-center gap-2 text-on-surface-variant">
          Trạng thái drone vẫn là <DroneStatusBadge status="unavailable" />
        </p>
        <div className="flex items-start gap-2.5 rounded-xl bg-error-container/60 p-3 text-on-error-container">
          <Icon name="warning" size={18} className="mt-0.5" />
          <div>
            <p className="font-title-sm text-title-sm">Không đủ điều kiện mở lại</p>
            <p className="font-body-sm text-body-sm">
              Bộ pin {result.attached}/{result.required} – chưa đủ số pin trên một drone theo UAV Profile {profile?.model} – v
              {profile?.version}.
            </p>
          </div>
        </div>
        <InfoNote icon="lightbulb">Gắn pin cho drone tại mục Pin, sau đó thực hiện Mở lại.</InfoNote>
      </Modal>
    )
  }

  return (
    <Modal
      tone="info"
      title={`Mở lại drone ${drone.name}?`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              const r = reopenDrone(drone.id)
              if (r.ok) {
                notify(`${drone.name} đã chuyển sang Available`)
                onClose()
              } else setResult(r)
            }}
          >
            Xác nhận mở lại
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low p-3">
        <span className="text-on-surface-variant">Trạng thái hiện tại:</span>
        <DroneStatusBadge status={drone.status} />
        {lastChange && (
          <span className="text-on-surface-variant">
            – Lý do: {lastChange.reason} ({formatDate(lastChange.at)})
          </span>
        )}
      </div>
      <InfoNote>
        Hệ thống sẽ kiểm tra bộ pin đủ số pin trên một drone theo UAV Profile trước khi chuyển drone sang Available.
      </InfoNote>
    </Modal>
  )
}

function RetireDialog({ drone, onClose }: { drone: Drone; onClose: () => void }) {
  const { heldMissionsOf, retireDrone, notify } = useFleet()
  const held = heldMissionsOf(drone.id)
  return (
    <Modal
      title={`Ngưng sử dụng drone ${drone.name}?`}
      description="Drone sẽ chuyển sang Ngưng sử dụng, không bị xóa và không thể chọn cho nhiệm vụ mới."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              retireDrone(drone.id)
              notify(`Đã ngưng sử dụng ${drone.name}`)
              onClose()
            }}
          >
            Xác nhận ngưng
          </Button>
        </>
      }
    >
      {drone.batteries.length > 0 && (
        <div>
          <ModalSectionLabel>Pin được tháo khỏi drone</ModalSectionLabel>
          <div className="flex flex-col gap-2">
            {drone.batteries.map((b) => (
              <div key={b.code} className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <span className="flex items-center gap-2 font-mono font-semibold">
                  <Icon name="battery_charging_full" size={18} className="text-primary" /> {b.code}
                </span>
                <span className="rounded-md bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm">Chưa gán</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <AffectedMissions missions={held} title="Nhiệm vụ đang giữ chỗ drone" />
      {held.length > 0 && <InfoNote>Mission Manager sẽ nhận thông báo để chọn drone khác cho nhiệm vụ.</InfoNote>}
    </Modal>
  )
}
