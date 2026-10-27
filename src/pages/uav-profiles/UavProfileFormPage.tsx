import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import { Field, FormActionBar, NumberInput, SectionCard, Select } from '../../components/FormFields'
import { inputClass } from '../../components/inputClass'
import Icon from '../../components/Icon'
import Modal, { InfoNote, ModalSectionLabel } from '../../components/Modal'
import PageHeading from '../../components/PageHeading'
import { MANUFACTURERS } from '../../mocks/data'
import { useFleet } from '../../store/fleetContext'
import type { ProfileSpecs, UavProfile } from '../../types'
import { formatDate } from '../../utils/format'
import ComingSoonPage from '../ComingSoonPage'
import {
  emptyForm,
  numericFields,
  requiredKeys,
  toForm,
  toSpecs,
  validate,
  type FormValues,
  type NumericKey,
} from './profileFields'

export default function UavProfileFormPage() {
  const { id } = useParams()
  const { getProfile } = useFleet()
  const profile = id ? getProfile(id) : undefined
  if (id && !profile) return <ComingSoonPage title="Không tìm thấy UAV Profile" />
  // Remount when switching profiles so the form state resets
  return <ProfileForm key={id ?? 'new'} profile={profile} />
}

function ProfileForm({ profile }: { profile?: UavProfile }) {
  const navigate = useNavigate()
  const { profiles, createProfile, updateProfile, missionsAffectedByProfile, getDrone, notify } = useFleet()
  const isEdit = !!profile
  const original = profile ? toForm(profile) : emptyForm
  const [values, setValues] = useState<FormValues>(original)
  const [submitted, setSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const takenModels = profiles
    .filter((p) => p.id !== profile?.id && p.manufacturer === values.manufacturer)
    .map((p) => p.model)
  const errors = validate(values, takenModels)
  // Before the first submit only show errors for fields the user has filled in
  const errorOf = (k: keyof ProfileSpecs) => (submitted || values[k] !== '' ? errors[k] : undefined)
  const set = (k: keyof ProfileSpecs) => (v: string) => setValues((s) => ({ ...s, [k]: v }))

  const changedKeys = (Object.keys(values) as (keyof ProfileSpecs)[]).filter((k) =>
    numericFields[k as NumericKey] ? Number(values[k]) !== Number(original[k]) || (values[k] === '') !== (original[k] === '') : values[k] !== original[k],
  )
  const affected = profile ? missionsAffectedByProfile(profile.id) : []
  const filledRequired = requiredKeys.filter((k) => values[k].trim() !== '').length
  const progress = Math.round((filledRequired / requiredKeys.length) * 100)
  const nextVersion = (profile?.version ?? 0) + 1
  const retired = profile?.status === 'retired'

  const save = () => {
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    if (!profile) {
      const created = createProfile(toSpecs(values))
      notify(`Đã tạo UAV Profile ${created.model} – v1`)
      navigate('/uav-profiles')
      return
    }
    if (changedKeys.length === 0) {
      notify('Không có thay đổi để lưu')
      return
    }
    setConfirming(true)
  }

  const confirmVersion = () => {
    if (!profile) return
    const labels = changedKeys.map((k) => (k === 'model' ? 'tên model' : k === 'manufacturer' ? 'hãng' : numericFields[k as NumericKey].label.toLowerCase()))
    updateProfile(profile.id, toSpecs(values), `Sửa ${labels.join(', ')}`)
    notify(`Đã lưu ${values.model} thành version v${nextVersion}`)
    navigate('/uav-profiles')
  }

  const changedBadge = (k: NumericKey) =>
    isEdit && changedKeys.includes(k) ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/70 px-2 py-0.5 font-label-sm text-label-sm text-on-primary-fixed-variant">
        <Icon name="edit" size={12} /> đã thay đổi: {original[k] || '–'} → {values[k] || '–'} {numericFields[k].unit}
      </span>
    ) : undefined

  const numberField = (k: NumericKey, hint?: ReactNode, className?: string) => {
    const f = numericFields[k]
    return (
      <Field
        key={k}
        label={f.label}
        htmlFor={k}
        required={f.required}
        hint={hint}
        error={errorOf(k)}
        aside={changedBadge(k)}
        className={className}
      >
        <NumberInput id={k} value={values[k]} unit={f.unit} step={f.step} onChange={set(k)} error={errorOf(k)} />
      </Field>
    )
  }

  return (
    <>
      <PageHeading
        crumbs={[
          { label: 'Đội drone' },
          { label: 'UAV Profile', to: '/uav-profiles' },
          ...(profile ? [{ label: profile.model, to: '/uav-profiles' }] : []),
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
        title={profile ? `Chỉnh sửa UAV Profile – ${profile.model}` : 'Tạo UAV Profile'}
        badge={
          profile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-1 font-label-md text-label-md text-on-secondary-fixed-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> Version hiện tại: v{profile.version}
            </span>
          )
        }
        subtitle={isEdit ? undefined : 'Nhập thông số kỹ thuật chuẩn hóa từ tài liệu chính thức của nhà sản xuất'}
      />

      {retired && (
        <div className="mb-space-lg rounded-lg bg-surface-container p-space-md text-on-surface-variant">
          Profile này đã ngưng sử dụng nên không thể tạo version mới.
        </div>
      )}
      {isEdit && !retired && (
        <div className="mb-space-lg flex items-start gap-space-md rounded-lg bg-secondary-container/60 p-space-md shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-secondary">
            <Icon name="warning" />
          </span>
          <div>
            <p className="font-title-sm text-title-sm text-on-surface">Cảnh báo cập nhật thông số hệ thống</p>
            <p className="text-on-surface-variant">
              Lưu thay đổi sẽ tạo version v{nextVersion}, version cũ được giữ nguyên.
              {affected.length > 0
                ? ` ${affected.length} đánh giá DSS chưa bay đang dùng drone thuộc dòng này sẽ chuyển STALE và Mission Manager sẽ được thông báo.`
                : ' Hiện không có đánh giá DSS nào bị ảnh hưởng.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-gutter-desktop pb-28 lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-8">
          <SectionCard icon="badge" title="1. Định danh" subtitle="Thông tin thương hiệu và tên gọi thương mại chính thức">
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
              <Field label="Hãng sản xuất" htmlFor="manufacturer" required error={errorOf('manufacturer')}>
                <Select
                  id="manufacturer"
                  value={values.manufacturer}
                  onChange={set('manufacturer')}
                  options={MANUFACTURERS.map((m) => ({ value: m, label: m }))}
                />
              </Field>
              <Field label="Tên model" htmlFor="model" required hint="Không trùng với dòng đã có" error={errorOf('model')}>
                <input
                  id="model"
                  value={values.model}
                  onChange={(e) => set('model')(e.target.value)}
                  placeholder="Ví dụ: Agras T40, P100 Pro..."
                  className={inputClass(errorOf('model'))}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard icon="scale" title="2. Khối lượng" subtitle="Trọng lượng rỗng, trọng lượng tải danh định và ngưỡng an toàn MTOW">
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
              {numberField('emptyWeightKg')}
              {numberField('maxPayloadKg')}
              {numberField('mtowKg', undefined, 'md:col-span-2')}
            </div>
          </SectionCard>

          <SectionCard icon="battery_charging_full" title="3. Pin" subtitle="Thông số bộ lưu trữ năng lượng và định mức đóng gói">
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
              {numberField('batteryCapacityAh')}
              {numberField('batteryEnergyWh', 'Không bắt buộc – để trống nếu datasheet không công bố')}
              {numberField('batteriesPerDrone', 'Số viên lắp đồng thời khi bay')}
            </div>
          </SectionCard>

          <SectionCard icon="cloud" title="4. Giới hạn môi trường" subtitle="Điều kiện thời tiết cực đoan cho phép cất cánh an toàn">
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
              {numberField('maxWindMs')}
              {numberField('minTempC')}
              {numberField('maxTempC')}
            </div>
          </SectionCard>

          <SectionCard icon="speed" title="5. Hiệu năng" subtitle="Tốc độ hành trình và thời lượng vận hành danh định">
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
              {numberField('maxSpeedMs')}
              {numberField('maxFlightTimeMin', 'Điều kiện không tải')}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-space-md lg:sticky lg:top-24 lg:col-span-4">
          {profile ? <VersionHistory profile={profile} /> : <CreateSummary values={values} progress={progress} filled={filledRequired} />}
        </div>
      </div>

      <FormActionBar
        status={
          isEdit ? (
            <span className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
              <Icon name="layers" size={18} className="text-primary" /> Phiên bản dự kiến: <span className="text-primary">v{nextVersion}</span>
            </span>
          ) : (
            <>
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
              {progress === 100 ? 'Trạng thái: Sẵn sàng tạo hồ sơ tiêu chuẩn v1' : `Đã nhập ${filledRequired}/${requiredKeys.length} trường bắt buộc`}
            </>
          )
        }
      >
        <Button variant="secondary" onClick={() => navigate('/uav-profiles')}>
          Hủy
        </Button>
        <Button icon={isEdit ? 'upload' : 'check_circle'} onClick={save} disabled={retired}>
          {isEdit ? 'Lưu thành version mới' : 'Lưu UAV Profile'}
        </Button>
      </FormActionBar>

      {confirming && profile && (
        <Modal
          title={`Xác nhận tạo version v${nextVersion}`}
          description={`Bạn đang lưu thay đổi cho UAV Profile ${profile.model}. Version v${profile.version} sẽ được giữ nguyên để truy vết.`}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Hủy
              </Button>
              <Button onClick={confirmVersion}>Xác nhận lưu</Button>
            </>
          }
        >
          <div>
            <ModalSectionLabel>Thay đổi</ModalSectionLabel>
            <ul className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3">
              {changedKeys.map((k) => {
                const f = numericFields[k as NumericKey]
                return (
                  <li key={k} className="flex flex-wrap items-center gap-2 font-body-md text-body-md">
                    <Icon name={f?.icon ?? 'badge'} size={18} className="text-on-surface-variant" />
                    <span className="text-on-surface-variant">{f?.label ?? (k === 'model' ? 'Tên model' : 'Hãng sản xuất')}:</span>
                    <span className="line-through decoration-outline">{original[k] || '–'} {f?.unit}</span>
                    <Icon name="arrow_forward" size={16} className="text-on-surface-variant" />
                    <span className="font-semibold text-primary">{values[k] || '–'} {f?.unit}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          {affected.length > 0 && (
            <div>
              <ModalSectionLabel>Các đánh giá DSS sau sẽ chuyển STALE</ModalSectionLabel>
              <ul className="flex flex-col gap-2">
                {affected.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-3">
                    <span className="flex items-center gap-2">
                      <Icon name="schedule" size={18} className="text-on-surface-variant" />
                      {m.name} – {formatDate(m.date)} – {m.droneId && getDrone(m.droneId)?.name}
                    </span>
                    <span className="rounded-md bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-container">
                      Sẽ STALE
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {affected.length > 0 && <InfoNote>Mission Manager phụ trách sẽ được thông báo để chạy lại DSS.</InfoNote>}
        </Modal>
      )}
    </>
  )
}

function CreateSummary({ values, progress, filled }: { values: FormValues; progress: number; filled: number }) {
  const chips: [string, string][] = [
    ['Dòng', `${values.manufacturer} ${values.model}`.trim()],
    ['MTOW', values.mtowKg && `${values.mtowKg} kg`],
    ['Tải trọng', values.maxPayloadKg && `${values.maxPayloadKg} kg`],
    ['Số pin trên một drone', values.batteriesPerDrone && `${values.batteriesPerDrone} cái${values.batteryCapacityAh ? ` (${values.batteryCapacityAh} Ah)` : ''}`],
    ['Gió tối đa', values.maxWindMs && `${values.maxWindMs} m/s`],
    ['Thời gian bay', values.maxFlightTimeMin && `${values.maxFlightTimeMin} phút`],
  ]
  return (
    <>
      <div className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <Icon name="assignment_turned_in" className="text-primary" />
            <h3 className="font-title-md text-title-md">Tổng kết hồ sơ</h3>
          </div>
          <span className="rounded-full bg-primary-container px-2.5 py-1 font-label-sm text-label-sm text-on-primary-container">
            Sẽ lưu thành version 1
          </span>
        </div>
        <div className="flex flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-md">
          <div className="flex items-center justify-between font-label-md text-label-md">
            <span className="font-medium">Tiến độ hoàn tất hồ sơ</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-primary">
            <Icon name={progress === 100 ? 'check_circle' : 'pending'} size={16} />
            {filled}/{requiredKeys.length} trường bắt buộc đã hoàn tất
          </div>
        </div>
        <div className="flex flex-col gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">Thông số chính cấu hình</span>
          <div className="flex flex-wrap gap-2">
            {chips.map(([label, value]) => (
              <div key={label} className="flex items-center gap-1.5 rounded bg-surface-container-low px-2.5 py-1.5 font-label-sm text-label-sm">
                <span className="text-secondary">{label}:</span>
                <span className={`font-semibold ${label === 'Dòng' ? 'text-primary' : ''}`}>{value || '–'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-space-sm rounded-lg bg-tertiary-fixed/30 p-space-md">
        <Icon name="info" className="mt-0.5 text-tertiary" />
        <div>
          <p className="font-title-sm text-title-sm text-tertiary">Lưu ý tuân thủ dữ liệu</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Thông số chỉ lấy từ datasheet chính thức của hãng để bảo đảm tính chuẩn xác khi vận hành và quản lý đội bay.
          </p>
        </div>
      </div>
    </>
  )
}

function VersionHistory({ profile }: { profile: UavProfile }) {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="mb-space-md flex items-center justify-between">
        <h3 className="flex items-center gap-space-xs font-title-md text-title-md">
          <Icon name="history" className="text-primary" /> Lịch sử version
        </h3>
        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">{profile.versions.length} phiên bản</span>
      </div>
      <ol className="relative flex flex-col gap-space-md border-l-2 border-surface-container pl-space-md">
        {profile.versions.map((v, i) => (
          <li key={v.version} className="relative">
            <span
              className={`absolute -left-[23px] top-3 h-3 w-3 rounded-full ring-4 ring-surface-container-lowest ${
                i === 0 ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            />
            <div className={`rounded-lg p-space-sm ${i === 0 ? 'bg-surface-container-low' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-title-sm text-title-sm">v{v.version}</span>
                {i === 0 && (
                  <span className="rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-label-sm text-on-primary-fixed-variant">Hiện hành</span>
                )}
              </div>
              <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                <Icon name="calendar_today" size={14} /> {formatDate(v.createdAt)} • {v.createdBy}
              </p>
              <p className="mt-1">“{v.note}”</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
