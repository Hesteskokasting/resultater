// Session-scoped receipt printer state. The module holds at most one active
// SerialPort connection; all print calls share it within the same browser tab.

import { logError } from '@/utils/logError'

let port: SerialPort | null = null
let activeDisconnectHandler: ((event: SerialConnectionEvent) => void) | null = null
let onDisconnectCb: (() => void) | null = null

// To restrict the port picker to a specific printer, set a USB vendor/product ID here.
// Find it in Windows Device Manager → Ports (COM & LPT) → right-click → Properties
// → Details → Hardware IDs. Example: "USB\VID_0519&PID_0001" → usbVendorId: 0x0519.
// Leave the array empty to show all serial ports.
const PRINTER_FILTERS: SerialPortFilter[] = []

export function isWebSerialSupported(): boolean {
  return 'serial' in navigator
}

export function isPrinterConnected(): boolean {
  return port !== null
}

/**
 * Register a callback that fires when the printer disconnects.
 * Pass null to clear — call this when the registering view is torn down.
 */
export function setOnDisconnect(cb: (() => void) | null): void {
  onDisconnectCb = cb
}

function attachDisconnectListener(): void {
  if (activeDisconnectHandler) {
    navigator.serial.removeEventListener('disconnect', activeDisconnectHandler)
  }
  activeDisconnectHandler = (_event: SerialConnectionEvent) => {
    if (port !== null) {
      port = null
      activeDisconnectHandler = null
      onDisconnectCb?.()
    }
  }
  navigator.serial.addEventListener('disconnect', activeDisconnectHandler)
}

/**
 * Re-open a previously-granted port without a user gesture.
 * Called on page load in the background — does not block render.
 * Returns true if reconnected.
 */
export async function tryAutoReconnect(): Promise<boolean> {
  if (!isWebSerialSupported() || port) return false
  const ports = await navigator.serial.getPorts()
  const candidate = ports[0]
  if (!candidate) return false
  try {
    await candidate.open({ baudRate: 9600 })
    port = candidate
    attachDisconnectListener()
    return true
  } catch {
    return false
  }
}

/** Prompt the user to select a serial port and open it. */
export async function connectUsb(): Promise<void> {
  if (!isWebSerialSupported()) throw new Error('Web Serial API is not supported in this browser.')
  if (port) return
  const options = PRINTER_FILTERS.length > 0 ? { filters: PRINTER_FILTERS } : undefined
  const selected = await navigator.serial.requestPort(options)
  await selected.open({ baudRate: 9600 })
  port = selected
  attachDisconnectListener()
}

/** Close the current connection. Port stays in getPorts() so auto-reconnect works on next load. */
async function disconnect(): Promise<void> {
  if (!port) return
  if (activeDisconnectHandler) {
    navigator.serial.removeEventListener('disconnect', activeDisconnectHandler)
    activeDisconnectHandler = null
  }
  try {
    await port.close()
  } catch (err) {
    logError('receiptPrinterService.disconnect', err)
  } finally {
    port = null
  }
}

/** Close and forget the port — revokes permission so auto-reconnect won't trigger next load. */
export async function forget(): Promise<void> {
  const target = port
  await disconnect()
  try {
    await target?.forget()
  } catch (err) {
    logError('receiptPrinterService.forget', err)
  }
}

/** Send raw bytes to the connected printer. Throws if not connected. */
export async function printBytes(bytes: Uint8Array): Promise<void> {
  if (!port) throw new Error('Ingen printar tilkopla. Koble til ein printar fyrst.')
  const writable = port.writable
  if (!writable) throw new Error('Printerport er ikkje i skrivemodus.')
  const writer = writable.getWriter()
  try {
    await writer.write(bytes)
  } finally {
    writer.releaseLock()
  }
}
