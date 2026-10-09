import { describe, expect, it } from 'vitest'
import { normalizeTag, normalizeTags } from '@/utils/tags.utils'

describe('normalizeTag', () => {
  it('trims, lowercases and joins inner whitespace with dashes', () => {
    expect(normalizeTag('  Japan   2026 ')).toBe('japan-2026')
  })

  it('keeps letters of any script, digits, dashes and underscores', () => {
    expect(normalizeTag('Поездка Токио')).toBe('поездка-токио')
    expect(normalizeTag('東京_trip')).toBe('東京_trip')
    expect(normalizeTag('#japan!2026.')).toBe('japan2026')
  })

  // Thai vowels and tone marks are combining marks; losing them changes the word
  it('keeps the combining marks of Thai', () => {
    expect(normalizeTag('พัทยา')).toBe('พัทยา')
    expect(normalizeTag('ภูเก็ต 2026')).toBe('ภูเก็ต-2026')
  })

  it('keeps the combining marks of Devanagari', () => {
    expect(normalizeTag('हिन्दी')).toBe('हिन्दी')
  })

  it('composes a decomposed accent instead of dropping it', () => {
    const decomposed = 'Cafe\u0301'

    expect(decomposed).toHaveLength(5)
    expect(normalizeTag(decomposed)).toBe('caf\u00e9')
    expect(normalizeTag(decomposed)).toBe(normalizeTag('Caf\u00e9'))
  })

  it('drops what is empty', () => {
    expect(normalizeTag('   ')).toBe('')
    expect(normalizeTag('!!!')).toBe('')
    expect(normalizeTag(null)).toBe('')
  })

  it('cuts what is longer than 32 characters', () => {
    expect(normalizeTag('a'.repeat(32))).toBe('a'.repeat(32))
    expect(normalizeTag('a'.repeat(33))).toBe('a'.repeat(32))
  })

  it('counts characters, not UTF-16 units, and never splits one', () => {
    const mathLetters = '𝒜'.repeat(33)

    expect(normalizeTag(mathLetters)).toBe('𝒜'.repeat(32))
    expect(Array.from(normalizeTag('タ'.repeat(40)))).toHaveLength(32)
  })
})

describe('normalizeTags', () => {
  it('de-duplicates after normalisation, keeping the first position', () => {
    expect(normalizeTags(['Japan', 'food', ' JAPAN ', 'food'])).toEqual(['japan', 'food'])
  })

  it('de-duplicates tags that become equal once cut to 32 characters', () => {
    expect(normalizeTags(['a'.repeat(32) + 'x', 'a'.repeat(32) + 'y'])).toEqual(['a'.repeat(32)])
  })

  it('drops invalid tags instead of failing', () => {
    expect(normalizeTags(['', '  ', '???', 'ok'])).toEqual(['ok'])
  })

  it('keeps at most ten tags', () => {
    const tags = Array.from({ length: 11 }, (_, index) => `t${index}`)

    expect(normalizeTags(tags)).toEqual(tags.slice(0, 10))
  })

  it('counts the ten after dropping invalid ones and duplicates', () => {
    const tags = ['', 'a', 'A', ...Array.from({ length: 10 }, (_, index) => `t${index}`)]

    expect(normalizeTags(tags)).toEqual(['a', 't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'])
  })

  it('answers an empty list for anything that is not a list', () => {
    expect(normalizeTags(undefined)).toEqual([])
  })
})
