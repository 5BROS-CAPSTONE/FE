const inputBase =
  'ui-input w-full min-h-11 px-3 bg-surface-container-lowest rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none disabled:cursor-not-allowed'

export function inputClass(error?: string) {
  return `${inputBase} ${error ? 'ring-1 ring-error focus:ring-error' : 'focus:ring-primary'}`
}
