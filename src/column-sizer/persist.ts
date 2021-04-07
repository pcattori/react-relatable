export function read<T>(key: string): T | undefined {
  const value = localStorage.getItem(key)
  if (value === null) {
    return undefined
  }
  try {
    return JSON.parse(value)
  } catch {
    console.error(`Could not parse local storage state for key '${key}'`)
    return undefined
  }
}

export function readOrElse<T>(key: string, orElse: T): T {
  const value = read<T>(key)
  if (value === undefined) {
    return orElse
  }
  return value
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
