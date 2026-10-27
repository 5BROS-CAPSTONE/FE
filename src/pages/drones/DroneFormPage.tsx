import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import { Field, FormActionBar, SectionCard, Select } from '../../components/FormFields'
import { inputClass } from '../../components/inputClass'
import Icon from '../../components/Icon'
import Modal, { InfoNote, ModalSectionLabel } from '../../components/Modal'
import PageHeading from '../../components/PageHeading'
import { DroneStatusBadge } from '../../components/StatusBadge'
import { useFleet } from '../../store/fleetContext'
import type { Drone, UavProfile } from '../../types'
import { formatDate, formatNumber } from '../../utils/format'
import ComingSoonPage from '../ComingSoonPage'

export default function DroneFormPage() {
  const { id } = useParams()
  const { getDrone } = useFleet()
  const drone = id ? getDrone(id) : undefined
  if (id && !drone) return <ComingSoonPage title="Không tìm thấy drone" />
  return <DroneForm key={id ?? 'new'} drone={drone} />
}

const profileLabel = (p: UavProfile) => `${p.model} – v${p.version}`

function ProfileSpecsPreview({ profile }: { profile: UavProfile }) {
  const specs = [
    ['work', 'Tải trọng tối đa', `${profile.maxPayloadKg} kg`],
    ['air', 'Sức chịu gió tối đa', `${formatNumber(profile.maxWindMs)} m/s`],
    ['thermostat', 'Nhiệt độ hoạt động', `${profile.minTempC}–${profile.maxTempC} °C`],
    ['battery_charging_full', 'Số pin trên một drone', String(profile.batteriesPerDrone)],
  ]
  return (
    <div className="rounded-lg bg-surface-container-low p-space-md">
      <p className="mb-space-sm flex items-center gap-space-sm font-title-sm text-title-sm">
        <Icon name="tune" size={18} className="text-tertiary" /> Thông số theo UAV Profile {profileLabel(profile)}
      </p>
      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
        {specs.map(([icon, label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-space-md py-space-sm shadow-sm">
            <span className="flex items-center gap-2 text-on-surface-variant">
              <Icon name={icon} size={16} /> {label}:
            </span>
            <span className="font-title-sm text-title-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DroneForm({ drone }: { drone?: Drone }) {
  const navigate = useNavigate()
  const { profiles, drones, getProfile, createDrone, updateDrone, affectedMissions, batteriesOf, notify } = useFleet()
  const isEdit = !!drone
  const firstActive = profiles.find((p) => p.status === 'active')
  const [name, setName] = useState(drone?.name ?? '')
  const [serial, setSerial] = useState(drone?.serial ?? '')
  const [profileId, setProfileId] = useState(drone?.profileId ?? firstActive?.id ?? '')
  const [note, setNote] = useState(drone?.note ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const profile = getProfile(profileId)
  const oldProfile = drone ? getProfile(drone.profileId) : undefined
  const profileChanged = isEdit && profileId !== drone.profileId
  // Retired profiles never appear in the dropdown
  const options = profiles.filter((p) => p.status === 'active')
  const held = drone ? affectedMissions([drone.id]) : []
  const attachedCount = drone ? batteriesOf(drone.id).length : 0
  const inMission = drone?.status === 'in-mission'

  const errors: Record<string, string | undefined> = {
    name: name.trim() ? undefined : 'Bắt buộc nhập tên drone',
    serial: !serial.trim()
      ? 'Bắt buộc nhập serial'
      : drones.some((d) => d.id !== drone?.id && d.serial.toLowerCase() === serial.trim().toLowerCase())
        ? 'Serial đã tồn tại trong đội bay'
        : undefined,
    profile: profile ? undefined : 'Bắt buộc chọn UAV Profile',
  }
  const show = (k: string) => (submitted ? errors[k] : undefined)

  const persist = () => {
    if (drone) {
      updateDrone(drone.id, { name: name.trim(), profileId, note: note.trim() })
      notify(profileChanged && held.length > 0 ? `Đã lưu ${name.trim()} và thông báo Mission Manager chạy lại DSS` : `Đã lưu thay đổi cho ${name.trim()}`)
      navigate(`/drones/${drone.id}`)
    } else {
      const created = createDrone({ name: name.trim(), serial: serial.trim(), profileId, note: note.trim() })
      notify(`Đã thêm ${created.name} ở trạng thái Unavailable`)
      navigate('/drones')
    }
  }

  const save = () => {
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) return
    if (profileChanged) setConfirming(true)
    else persist()
  }

  const batteryMatches = drone && profile ? attachedCount === profile.batteriesPerDrone : true

  return (
    <>
      <PageHeading
        crumbs={[
          { label: 'Đội drone' },
          { label: 'Danh sách drone', to: '/drones' },
          ...(drone ? [{ label: drone.name, to: `/drones/${drone.id}` }, { label: 'Chỉnh sửa' }] : [{ label: 'Thêm drone' }]),
        ]}
        title={drone ? `Chỉnh sửa drone ${drone.name}` : 'Thêm drone'}
        badge={drone && <DroneStatusBadge status={drone.status} />}
        subtitle={drone ? 'Cập nhật thông tin định danh và cấu hình dòng drone' : 'Nhập thông tin drone vật lý mới vào đội bay'}
      />

      <div className="grid grid-cols-1 items-start gap-gutter-desktop pb-28 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionCard icon={isEdit ? 'tune' : 'flight_takeoff'} title="1. Thông tin định danh drone">
            <div className="flex flex-col gap-space-lg">
              {isEdit ? (
                <Field label="Serial" htmlFor="serial" hint="Không thể sửa serial">
                  <div className="relative">
                    <input id="serial" value={serial} readOnly className={`${inputClass()} cursor-not-allowed pr-10 font-mono text-on-surface-variant`} />
                    <Icon name="lock" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  </div>
                </Field>
              ) : null}
              <Field label="Tên drone" htmlFor="name" required error={show('name')}>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: T20P(4)" className={inputClass(show('name'))} />
              </Field>
              {!isEdit && (
                <Field label="Serial" htmlFor="serial" required hint="Serial không được trùng với drone đã có" error={show('serial')}>
                  <input
                    id="serial"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    placeholder="Ví dụ: 1581F6T20P0004"
                    className={`${inputClass(show('serial'))} font-mono`}
                  />
                </Field>
              )}
              <Field
                label="UAV Profile"
                htmlFor="profile"
                required
                error={show('profile')}
                hint={
                  inMission
                    ? 'Không thể đổi UAV Profile khi drone đang In-mission'
                    : isEdit
                      ? 'Chỉ đổi UAV Profile khi khai báo nhầm dòng drone'
                      : 'Chỉ hiển thị UAV Profile đang hoạt động'
                }
                aside={
                  profileChanged &&
                  oldProfile &&
                  profile && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary-container px-2 py-1 font-label-sm text-label-sm text-on-secondary-fixed-variant">
                      <Icon name="swap_horiz" size={14} /> Đã thay đổi: {profileLabel(oldProfile)} → {profileLabel(profile)}
                    </span>
                  )
                }
              >
                <Select
                  id="profile"
                  value={profileId}
                  onChange={setProfileId}
                  disabled={inMission}
                  placeholder="Chọn UAV Profile"
                  options={options.map((p) => ({ value: p.id, label: profileLabel(p) }))}
                />
              </Field>
              {profile && !isEdit && <ProfileSpecsPreview profile={profile} />}
              {profile && drone && profileChanged && (
                <div
                  className={`flex items-center gap-space-sm rounded-lg p-space-md font-label-lg text-label-lg ${
                    batteryMatches ? 'bg-surface-container-low text-primary' : 'bg-error-container/60 text-on-error-container'
                  }`}
                >
                  <Icon name={batteryMatches ? 'check_circle' : 'warning'} filled={batteryMatches} />
                  {batteryMatches
                    ? `Bộ pin hiện tại ${attachedCount}/${profile.batteriesPerDrone} khớp số pin trên một drone của ${profile.model}`
                    : `Bộ pin hiện tại ${attachedCount}/${profile.batteriesPerDrone} chưa khớp số pin trên một drone của ${profile.model}`}
                </div>
              )}
              <Field label={isEdit ? 'Ghi chú' : 'Ghi chú (không bắt buộc)'} htmlFor="note">
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú xuất xưởng, số giờ bay khởi điểm hoặc lưu ý kỹ thuật riêng..."
                  className="w-full rounded-lg bg-surface-container-low p-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
            </div>
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-24 lg:col-span-4">
          {isEdit ? (
            <div className="rounded-xl bg-warning-container p-space-lg shadow-sm ring-1 ring-warning-outline">
              <p className="mb-space-sm flex items-center gap-space-sm font-title-md text-title-md">
                <Icon name="warning" filled /> Lưu ý đổi UAV Profile
              </p>
              <p className="text-on-surface-variant">
                Đổi UAV Profile làm thay đổi giới hạn bay của drone.
                {held.length > 0
                  ? ` ${held.length} đánh giá khả thi đang dùng drone này sẽ chuyển STALE và phải đánh giá lại.`
                  : ' Hiện không có đánh giá khả thi nào đang dùng drone này.'}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-space-sm rounded-xl bg-tertiary-fixed/60 p-space-lg shadow-sm">
              <Icon name="info" filled className="text-tertiary" />
              <div>
                <p className="font-title-md text-title-md">Lưu ý</p>
                <p className="text-on-surface-variant">
                  Drone mới được lưu ở trạng thái Unavailable vì chưa gắn pin. Gắn pin tại mục Pin, sau đó dùng Mở lại để chuyển drone sang
                  Available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormActionBar
        status={
          !isEdit && (
            <>
              <Icon name="lock_clock" size={18} /> Trạng thái mặc định:{' '}
              <span className="font-semibold text-on-surface">Unavailable (Chưa gắn pin)</span>
            </>
          )
        }
      >
        <Button variant="secondary" onClick={() => navigate(drone ? `/drones/${drone.id}` : '/drones')}>
          Hủy
        </Button>
        <Button icon={isEdit ? 'save' : 'check_circle'} onClick={save}>
          {isEdit ? 'Lưu thay đổi' : 'Lưu drone'}
        </Button>
      </FormActionBar>

      {confirming && drone && oldProfile && profile && (
        <Modal
          title={`Xác nhận đổi UAV Profile của ${drone.name}`}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Hủy
              </Button>
              <Button onClick={persist}>Xác nhận lưu</Button>
            </>
          }
        >
          <div>
            <ModalSectionLabel>Thay đổi</ModalSectionLabel>
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container-low p-3">
              <Icon name="flight" size={18} className="text-on-surface-variant" />
              <span className="text-on-surface-variant">UAV Profile:</span>
              <span className="line-through decoration-outline">{profileLabel(oldProfile)}</span>
              <Icon name="arrow_forward" size={16} className="text-on-surface-variant" />
              <span className="font-semibold text-primary">{profileLabel(profile)}</span>
            </div>
          </div>
          {held.length > 0 && (
            <div>
              <ModalSectionLabel>Đánh giá bị ảnh hưởng ({held.length})</ModalSectionLabel>
              <ul className="flex flex-col gap-2">
                {held.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
                    <span className="flex items-center gap-2">
                      <Icon name="assignment_late" size={18} className="text-on-surface-variant" /> {m.name} – {formatDate(m.date)}
                    </span>
                    <span className="rounded-md bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-container">Sẽ STALE</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <InfoNote>
            Drone vẫn dùng được nên nhiệm vụ giữ nguyên drone.{held.length > 0 ? ' Mission Manager cần chạy lại đánh giá khả thi.' : ''}
          </InfoNote>
        </Modal>
      )}
    </>
  )
}
