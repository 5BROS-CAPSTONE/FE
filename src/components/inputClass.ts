const inputBase =
  'w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2'

export function inputClass(error?: string) {
  return `${inputBase} ${error ? 'ring-1 ring-error focus:ring-error' : 'focus:ring-primary'}`
}
