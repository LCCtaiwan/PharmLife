import { describe, expect, it } from 'vitest'
import { CAREER_LIST } from '../src/data/careers'
import { attemptExam, createNewGame, endYear, resolveEventChoice, startCareer, takeAction } from '../src/engine/game'
import type { GameState, NewGameOptions } from '../src/engine/types'

const options: NewGameOptions = { name: '測試藥師', pronoun: 'TA', origin: 'scholar', difficulty: 'standard', seed: 'TESTLIFE' }

function playYear(state: GameState, actionId = 'study'): GameState {
  let next = state
  while (next.actionsLeft > 0) next = takeAction(next, actionId)
  expect(next.pendingEventId).toBeTruthy()
  const eventId = next.pendingEventId!
  const eventChoice = next.pendingResult ? null : undefined
  expect(eventChoice).toBeUndefined()
  const event = (awaitEventLookup(eventId))
  next = resolveEventChoice(next, event.choices[0].id)
  expect(next.pendingResult).toBeTruthy()
  return endYear(next)
}

function awaitEventLookup(id: string) {
  // Kept as a helper so the playthrough uses the same public data contract as the UI.
  const event = requireEvent(id)
  if (!event) throw new Error(`missing event ${id}`)
  return event
}

import { EVENT_BY_ID } from '../src/data/events'
function requireEvent(id: string) { return EVENT_BY_ID[id] }

describe('complete game loop', () => {
  it('replays the same student years with the same seed and choices', () => {
    let first = createNewGame(options)
    let second = createNewGame(options)
    for (let year = 0; year < 4; year += 1) {
      first = playYear(first, year % 2 ? 'rest' : 'study')
      second = playYear(second, year % 2 ? 'rest' : 'study')
    }
    expect(first).toEqual(second)
    expect(first.age).toBe(22)
    expect(first.choiceHistory.length).toBeGreaterThan(12)
  })

  it('moves from six student years through both exams without a dead end', () => {
    let state = createNewGame({ ...options, difficulty: 'story', seed: 'EXAMROUTE' })
    while (state.phase === 'student') state = playYear(state, 'study')
    expect(state.phase).toBe('exam')
    expect(state.age).toBe(24)
    for (let attempt = 0; attempt < 30 && !state.licensed; attempt += 1) state = attemptExam(state)
    expect(state.licensed).toBe(true)
    expect(state.phase).toBe('career')
    expect(state.career.offers).toHaveLength(8)
  })

  it('allows every career to start from a licensed save', () => {
    const base = { ...createNewGame(options), phase: 'career' as const, licensed: true, career: { ...createNewGame(options).career, offers: CAREER_LIST.map((career) => career.id) } }
    for (const career of CAREER_LIST) {
      const state = startCareer(base, career.id)
      expect(state.career.trackId).toBe(career.id)
      expect(state.actionsLeft).toBe(4)
      expect(state.timeline.at(-1)?.title).toContain(career.name)
    }
  })

  it('turns annual work into income, performance and aging', () => {
    const licensed = { ...createNewGame(options), phase: 'career' as const, licensed: true, career: { ...createNewGame(options).career, offers: ['hospital' as const] } }
    let state = startCareer(licensed, 'hospital')
    state = playYear(state, 'career')
    expect(state.age).toBe(19)
    expect(state.statsLifetime.yearsWorked).toBe(1)
    expect(state.career.performance).toBeGreaterThan(0)
    expect(state.economy.annualIncome).toBeGreaterThan(0)
  })
})
