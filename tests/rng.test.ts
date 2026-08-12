import { describe, expect, it } from 'vitest'
import { normalizeSeed, randomAt, randomInt } from '../src/engine/rng'

describe('versioned seeded RNG', () => {
  it('returns the same stable sequence for the same seed', () => {
    const first = Array.from({ length: 10 }, (_, cursor) => randomAt('PHARM02', cursor))
    const second = Array.from({ length: 10 }, (_, cursor) => randomAt('PHARM02', cursor))
    expect(first).toEqual(second)
    expect(new Set(first).size).toBeGreaterThan(8)
  })

  it('normalizes shareable seeds and keeps integer bounds', () => {
    expect(normalizeSeed(' pharm-8f72kq ')).toBe('PHARM8F72KQ')
    for (let cursor = 0; cursor < 20; cursor += 1) expect(randomInt('BOUNDARY', cursor, -2, 3)).toBeGreaterThanOrEqual(-2)
  })
})
