import { describe, expect, it } from 'vitest'
import { CAREER_LIST } from '../src/data/careers'
import { EVENTS, eventCountByCategory } from '../src/data/events'

describe('v0.2 content coverage', () => {
  it('contains eight complete career tracks with four roles each', () => {
    expect(CAREER_LIST).toHaveLength(8)
    for (const career of CAREER_LIST) {
      expect(career.roles).toHaveLength(4)
      expect(career.roles.every((role) => role.salary > 0)).toBe(true)
    }
  })

  it('contains a replayable event pool and dedicated events per career', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(100)
    for (const career of CAREER_LIST) {
      expect(EVENTS.filter((event) => event.conditions?.career === career.id).length).toBeGreaterThanOrEqual(4)
    }
    const counts = eventCountByCategory()
    expect(counts.student).toBeGreaterThanOrEqual(5)
    expect(counts.career).toBeGreaterThanOrEqual(30)
    expect(counts.startup).toBeGreaterThanOrEqual(3)
  })

  it('keeps event ids and choice ids unique', () => {
    expect(new Set(EVENTS.map((event) => event.id)).size).toBe(EVENTS.length)
    for (const event of EVENTS) expect(new Set(event.choices.map((choice) => choice.id)).size).toBe(event.choices.length)
  })
})
