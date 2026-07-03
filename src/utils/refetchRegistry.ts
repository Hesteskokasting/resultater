type RefetchFn = () => void

let current: RefetchFn | null = null

export function registerRefetch(fn: RefetchFn | null): void {
  current = fn
}

export function runRefetch(): void {
  current?.()
}
