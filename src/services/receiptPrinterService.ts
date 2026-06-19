// Session-scoped receipt printer state. The module holds at most one active
// SerialPort connection; all print calls share it within the same browser tab.

import { logError } from '@/utils/logError'

let port: SerialPort | null = null

// Star Micronics USB vendor ID. If the printer enumerates via a generic
// USB-serial chip (FTDI 0x0403, CP210x 0x10C4, CH340 0x1A86) update this.
const PRINTER_FILTERS: SerialPortFilter[] = [{ usbVendorId: 0x0519 }]

export function isWebSerialSupported(): boolean {
  return 'serial' in navigator
}

export function isPrinterConnected(): boolean {
  return port !== null
}

/**
 * Re-open a previously-granted port without a user gesture.
 * Called automatically on page load. Returns true if reconnected.
 */
export async function tryAutoReconnect(): Promise<boolean> {
  if (!isWebSerialSupported() || port) return false
  const ports = await navigator.serial.getPorts()
  if (ports.length === 0) return false
  const candidate = ports[0]
  if (!candidate) return false
  try {
    await candidate.open({ baudRate: 9600 })
    port = candidate
    return true
  } catch {
    return false
  }
}

/** Prompt the user to select a USB serial port and open it. */
export async function connectUsb(): Promise<void> {
  if (!isWebSerialSupported()) throw new Error('Web Serial API is not supported in this browser.')
  if (port) return
  const selected = await navigator.serial.requestPort({ filters: PRINTER_FILTERS })
  await selected.open({ baudRate: 9600 })
  port = selected
}

/** Close the current connection, if any. */
export async function disconnect(): Promise<void> {
  if (!port) return
  try {
    await port.close()
  } catch (err) {
    logError('receiptPrinterService.disconnect', err)
  } finally {
    port = null
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
