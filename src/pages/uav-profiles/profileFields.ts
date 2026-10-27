import type { ProfileSpecs } from '../../types'

export type NumericKey = Exclude<keyof ProfileSpecs, 'manufacturer' | 'model'>

export interface NumericField {
  key: NumericKey
  label: string
  unit: string
  icon: string
  required: boolean
  step?: string
}

export const numericFields: Record<NumericKey, NumericField> = {
  emptyWeightKg: { key: 'emptyWeightKg', label: 'Khối lượng rỗng', unit: 'kg', icon: 'scale', required: true },
  maxPayloadKg: { key: 'maxPayloadKg', label: 'Tải trọng tối đa', unit: 'kg', icon: 'scale', required: true },
  mtowKg: { key: 'mtowKg', label: 'Khối lượng cất cánh tối đa – MTOW', unit: 'kg', icon: 'scale', required: true },
  batteryCapacityAh: { key: 'batteryCapacityAh', label: 'Dung lượng pin', unit: 'Ah', icon: 'battery_charging_full', required: true },
  batteryEnergyWh: { key: 'batteryEnergyWh', label: 'Năng lượng pin', unit: 'Wh', icon: 'battery_charging_full', required: false, step: '1' },
  batteriesPerDrone: { key: 'batteriesPerDrone', label: 'Số pin trên một drone', unit: 'cái', icon: 'battery_charging_full', required: true, step: '1' },
  maxWindMs: { key: 'maxWindMs', label: 'Sức chịu gió tối đa', unit: 'm/s', icon: 'air', required: true },
  minTempC: { key: 'minTempC', label: 'Nhiệt độ tối thiểu', unit: '°C', icon: 'thermostat', required: true, step: '1' },
  maxTempC: { key: 'maxTempC', label: 'Nhiệt độ tối đa', unit: '°C', icon: 'thermostat', required: true, step: '1' },
  maxSpeedMs: { key: 'maxSpeedMs', label: 'Tốc độ bay tối đa', unit: 'm/s', icon: 'speed', required: true },
  maxFlightTimeMin: { key: 'maxFlightTimeMin', label: 'Thời gian bay tối đa', unit: 'phút', icon: 'schedule', required: true, step: '0.5' },
}

export type FormValues = Record<keyof ProfileSpecs, string>

export const emptyForm: FormValues = {
  manufacturer: 'DJI',
  model: '',
  emptyWeightKg: '',
  maxPayloadKg: '',
  mtowKg: '',
  batteryCapacityAh: '',
  batteryEnergyWh: '',
  batteriesPerDrone: '1',
  maxWindMs: '',
  minTempC: '',
  maxTempC: '',
  maxSpeedMs: '',
  maxFlightTimeMin: '',
}

export function toForm(specs: ProfileSpecs): FormValues {
  const values = { ...emptyForm }
  for (const key of Object.keys(emptyForm) as (keyof ProfileSpecs)[]) {
    const v = specs[key]
    values[key] = v === null ? '' : String(v)
  }
  return values
}

export function toSpecs(values: FormValues): ProfileSpecs {
  const num = (k: NumericKey) => Number(values[k])
  return {
    manufacturer: values.manufacturer,
    model: values.model.trim(),
    emptyWeightKg: num('emptyWeightKg'),
    maxPayloadKg: num('maxPayloadKg'),
    mtowKg: num('mtowKg'),
    batteryCapacityAh: num('batteryCapacityAh'),
    batteryEnergyWh: values.batteryEnergyWh === '' ? null : num('batteryEnergyWh'),
    batteriesPerDrone: num('batteriesPerDrone'),
    maxWindMs: num('maxWindMs'),
    minTempC: num('minTempC'),
    maxTempC: num('maxTempC'),
    maxSpeedMs: num('maxSpeedMs'),
    maxFlightTimeMin: num('maxFlightTimeMin'),
  }
}

export const requiredKeys = (Object.keys(emptyForm) as (keyof ProfileSpecs)[]).filter(
  (k) => k === 'manufacturer' || k === 'model' || numericFields[k as NumericKey]?.required,
)

/** Returns field → error message; takes the other models of the same manufacturer for uniqueness. */
export function validate(values: FormValues, takenModels: string[]): Partial<Record<keyof ProfileSpecs, string>> {
  const errors: Partial<Record<keyof ProfileSpecs, string>> = {}
  for (const key of requiredKeys) {
    if (values[key].trim() === '') errors[key] = 'Bắt buộc nhập'
  }
  if (!errors.model && takenModels.some((m) => m.toLowerCase() === values.model.trim().toLowerCase())) {
    errors.model = 'Model đã tồn tại cho hãng này'
  }
  for (const f of Object.values(numericFields)) {
    if (errors[f.key] || values[f.key] === '') continue
    const n = Number(values[f.key])
    const canBeZeroOrNegative = f.key === 'minTempC' || f.key === 'maxTempC'
    if (!canBeZeroOrNegative && n <= 0) errors[f.key] = 'Giá trị phải lớn hơn 0'
  }
  if (!errors.batteriesPerDrone && !Number.isInteger(Number(values.batteriesPerDrone))) {
    errors.batteriesPerDrone = 'Số pin phải là số nguyên'
  }
  if (!errors.mtowKg && !errors.emptyWeightKg && Number(values.mtowKg) <= Number(values.emptyWeightKg)) {
    errors.mtowKg = 'MTOW phải lớn hơn khối lượng rỗng'
  }
  if (!errors.maxTempC && !errors.minTempC && Number(values.maxTempC) <= Number(values.minTempC)) {
    errors.maxTempC = 'Nhiệt độ tối đa phải lớn hơn nhiệt độ tối thiểu'
  }
  return errors
}
