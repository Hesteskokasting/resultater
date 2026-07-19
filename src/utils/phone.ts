/**
 * Normalizes a user-typed phone number to E.164. Norwegian numbers may be
 * entered without a country code (8 digits → +47). Returns null when the
 * input cannot be a valid phone number.
 */
export function normalizePhoneE164(input: string): string | null {
  let cleaned = input.replace(/[\s.\-()]/g, '')
  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2)
  if (/^\d{8}$/.test(cleaned)) cleaned = '+47' + cleaned
  return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : null
}
