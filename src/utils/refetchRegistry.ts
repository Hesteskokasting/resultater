type RefetchFn = () => void | Promise<void>;

let current: RefetchFn | null = null;

export function registerRefetch(fn: RefetchFn | null): void {
  current = fn;
}

export function hasRefetch(): boolean {
  return current !== null;
}

export function runRefetch(): void | Promise<void> {
  return current?.();
}
