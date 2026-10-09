// Mirrors the API's normalisation, so chips show exactly what will be stored.
// The API normalises again on its own; this only keeps the preview honest.
export const MAX_TAG_LENGTH = 32
export const MAX_TAGS_PER_COST = 10

/**
 * @param {*} value
 * @returns {string} '' when nothing valid is left
 */
export const normalizeTag = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const tag = value
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    // Letters of any script with their combining marks (Thai vowels and tones,
    // Devanagari matras), digits, '-' and '_'
    .replace(/[^\p{L}\p{M}\p{N}_-]/gu, '')

  // Cut, not dropped, and by code points, so a character outside the BMP is never cut in half
  return Array.from(tag).slice(0, MAX_TAG_LENGTH).join('')
}

/**
 * Invalid tags are dropped rather than rejected, duplicates (after cutting to
 * 32 characters) keep their first position, and only the first ten survive.
 *
 * @param {Array<*>} values
 * @returns {string[]}
 */
export const normalizeTags = (values) => {
  if (!Array.isArray(values)) {
    return []
  }

  const tags = []

  for (const value of values) {
    const tag = normalizeTag(value)

    if (tag && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags.slice(0, MAX_TAGS_PER_COST)
}

export const formatTag = (tag) => `#${tag}`
