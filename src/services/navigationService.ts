import { Capacitor } from '@capacitor/core'

/**
 * Open an internal route in a new browser tab on web. The native app's WebView
 * has no tabs — iOS WKWebView hands target="_blank" navigations to Safari — so
 * it navigates in place instead.
 */
export function openInNewTab(url: string): void {
  if (Capacitor.isNativePlatform()) {
    location.href = url
    return
  }
  window.open(url, '_blank')
}

/** Anchor attributes matching openInNewTab: new tab on web, in-place navigation natively. */
export function newTabAnchorAttrs(): string {
  return Capacitor.isNativePlatform() ? '' : ' target="_blank" rel="noopener"'
}
