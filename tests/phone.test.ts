import { describe, expect, it } from 'vitest'
import { normalizePhoneE164 } from '@/utils/phone'

describe('normalizePhoneE164', () => {
  it('prefixes bare 8-digit Norwegian numbers with +47', () => {
    expect(normalizePhoneE164('91234567')).toBe('+4791234567')
  })

  it('strips spaces, dots, hyphens and parentheses', () => {
    expect(normalizePhoneE164('912 34 567')).toBe('+4791234567')
    expect(normalizePhoneE164('912.34.567')).toBe('+4791234567')
    expect(normalizePhoneE164('912-34-567')).toBe('+4791234567')
    expect(normalizePhoneE164('+47 912 34 567')).toBe('+4791234567')
  })

  it('converts 00-prefix to +', () => {
    expect(normalizePhoneE164('004791234567')).toBe('+4791234567')
  })

  it('keeps already valid E.164 numbers unchanged', () => {
    expect(normalizePhoneE164('+4791234567')).toBe('+4791234567')
    expect(normalizePhoneE164('+4520304050')).toBe('+4520304050')
  })

  it('rejects invalid input', () => {
    expect(normalizePhoneE164('')).toBeNull()
    expect(normalizePhoneE164('abc')).toBeNull()
    expect(normalizePhoneE164('912 34 56')).toBeNull()
    expect(normalizePhoneE164('9123456789')).toBeNull()
    expect(normalizePhoneE164('+0791234567')).toBeNull()
    expect(normalizePhoneE164('91234567x')).toBeNull()
  })
})
