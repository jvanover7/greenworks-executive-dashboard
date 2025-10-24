import { describe, it, expect } from 'vitest'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

describe('Utils', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should format numbers correctly', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(0)).toBe('0')
  })

  it('should format dates correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = formatDate(date)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2024')
  })
})
