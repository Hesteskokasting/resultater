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

let reload: RefetchFn | null = null;

/** Set once by the router, so a page can ask for a full re-render of its route. */
export function registerRouteReload(fn: RefetchFn): void {
  reload = fn;
}

/** Re-renders the whole route, page chrome included. No-op before the router boots. */
export function reloadRoute(): void | Promise<void> {
  return reload?.();
}
