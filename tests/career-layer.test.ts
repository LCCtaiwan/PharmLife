import { describe, expect, it } from 'vitest'
import { fastForward, parseDebugSearch, simulate } from '../src/career-layer/debug'
import { calculateCompensation, chooseCareerDirection, createCareerGame, finalizeCareerYear, playCareerYear, resolveWorkplaceEvent } from '../src/career-layer/engine'
import { HOSPITAL_CAREER } from '../src/career-layer/hospital'
import { HOSPITAL_EVENTS, HOSPITAL_GOALS, selectTenYearEnding } from '../src/career-layer/hospital-story'
import { careerRandomAt, generateCareerSeed, normalizeCareerSeed } from '../src/career-layer/rng'
import { validateCareer } from '../src/career-layer/schema'

describe('Career Layer v0.5 Hospital story slice', () => {
  it('replays the same RNG sequence for the same version and seed', () => {
    const first = Array.from({ length: 12 }, (_, cursor) => careerRandomAt('PHARM-TEST-0001', cursor))
    const second = Array.from({ length: 12 }, (_, cursor) => careerRandomAt('PHARM-TEST-0001', cursor))
    expect(first).toEqual(second)
    expect(new Set(first).size).toBeGreaterThan(10)
    expect(normalizeCareerSeed(' pharm-test-0001 ')).toBe('PHARMTEST0001')
    expect(generateCareerSeed()).toMatch(/^[A-Z2-9]{8}$/)
  })

  it('validates Hospital as data and keeps annual choices costly', () => {
    expect(validateCareer(HOSPITAL_CAREER)).toEqual([])
    expect(HOSPITAL_CAREER.annualChoices).toHaveLength(6)
    expect(Object.values(HOSPITAL_CAREER.abilityWeights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1)
  })

  it('calculates separated Hospital compensation layers', () => {
    const income = calculateCompensation(HOSPITAL_CAREER, 1, 'night')
    expect(income.salaryBase).toBe(5.2)
    expect(income.nightShiftAllowance).toBe(.9)
    expect(income.ladderAllowance).toBe(.15)
    expect(income.monthsPerYear).toBe(14.5)
    expect(income.annualIncome).toBe(90.6)
  })

  it('parses and clamps the frozen debug entry through game creation', () => {
    const options = parseDebugSearch('?debug=1&career=hospital&age=28&level=2&KNOW=55&DISP=4&money=80&stress=130&seed=PHARM-TEST-0001')
    const state = createCareerGame(HOSPITAL_CAREER, options, HOSPITAL_GOALS)
    expect(options.career).toBe('hospital')
    expect(state.debug).toBe(true)
    expect(state.age).toBe(28)
    expect(state.level).toBe(2)
    expect(state.abilities.KNOW).toBe(55)
    expect(state.abilities.DISP).toBe(20)
    expect(state.stress).toBe(100)
    expect(state.money).toBe(80)
  })

  it('produces the same annual report from the same seed and choice', () => {
    const first = createCareerGame(HOSPITAL_CAREER, { seed: 'REPLAY05' }, HOSPITAL_GOALS)
    const second = createCareerGame(HOSPITAL_CAREER, { seed: 'REPLAY05' }, HOSPITAL_GOALS)
    const choice = first.availableChoiceIds[0]
    expect(playCareerYear(first, choice, HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS)).toEqual(playCareerYear(second, choice, HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS))
  })

  it('plays ten Hospital years without a dead end and reaches an ending at 35', () => {
    const ending = fastForward(createCareerGame(HOSPITAL_CAREER, { seed: 'TENYEARS05' }, HOSPITAL_GOALS), 10)
    expect(ending.stage).toBe('ending')
    expect(ending.employmentStatus).toBe('retired')
    expect(ending.age).toBe(35)
    expect(ending.reports).toHaveLength(10)
    expect(ending.timeline.at(-1)?.type).toBe('retirement')
    expect(ending.compensation.annualIncome).toBeGreaterThan(0)
    expect(ending.eventHistory).toHaveLength(10)
  })

  it('supports deterministic multi-run smoke simulation', () => {
    const first = simulate({ career: 'hospital', runs: 20, seed: 'BALANCE04', strategy: 'balanced' })
    const second = simulate({ career: 'hospital', runs: 20, seed: 'BALANCE04', strategy: 'balanced' })
    expect(first).toEqual(second)
    expect(first.runs).toBe(20)
    expect(first.averageRetirementAssets).toBeGreaterThan(0)
  })

  it('separates work direction, workplace response and annual resolution', () => {
    const initial = createCareerGame(HOSPITAL_CAREER, { seed: 'STORYFLOW05' }, HOSPITAL_GOALS)
    const directed = chooseCareerDirection(initial, initial.availableChoiceIds[0], HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS)
    expect(directed.stage).toBe('event')
    expect(directed.pendingEventId).toBeTruthy()
    const event = HOSPITAL_EVENTS.find((item) => item.id === directed.pendingEventId)!
    const responded = resolveWorkplaceEvent(directed, event.choices[0].id, HOSPITAL_EVENTS)
    expect(responded.stage).toBe('outcome')
    expect(responded.eventChoiceHistory).toHaveLength(1)
    const report = finalizeCareerYear(responded, HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS)
    expect(report.stage).toBe('report')
    expect(report.lastReport?.eventTitle).toBe(event.title)
    expect(report.lastReport?.goalLabel).toBeTruthy()
  })

  it('records event-chain flags and colleague memory', () => {
    const initial = createCareerGame(HOSPITAL_CAREER, { seed: 'MEMORY05' }, HOSPITAL_GOALS)
    const directed = chooseCareerDirection(initial, initial.availableChoiceIds[0], HOSPITAL_CAREER, HOSPITAL_GOALS, HOSPITAL_EVENTS)
    const forced = { ...directed, stage: 'event' as const, pendingEventId: 'junior_first_error' }
    const responded = resolveWorkplaceEvent(forced, 'coach_and_report', HOSPITAL_EVENTS)
    expect(responded.flags).toContain('junior_coached')
    expect(responded.chainProgress.junior).toBe(1)
    expect(responded.colleagues.junior_xu.trust).toBeGreaterThan(initial.colleagues.junior_xu.trust)
  })

  it('selects different ten-year endings from accumulated causes', () => {
    const base = fastForward(createCareerGame(HOSPITAL_CAREER, { seed: 'ENDING05' }, HOSPITAL_GOALS), 10)
    expect(selectTenYearEnding({ ...base, money: 600, health: 55, burnout: { ...base.burnout, episodes: 2 } }).id).toBe('well_paid_exhausted')
    expect(selectTenYearEnding({ ...base, level: 4, health: 85, burnout: { ...base.burnout, episodes: 0 } }).id).toBe('young_manager')
    expect(selectTenYearEnding({ ...base, level: 2, health: 85, money: 400, colleagues: { ...base.colleagues, junior_xu: { ...base.colleagues.junior_xu, trust: 70 } } }).id).toBe('trusted_senior')
    expect(selectTenYearEnding({ ...base, level: 2, health: 85, money: 400, signatureValue: 220, reputation: 70, colleagues: { ...base.colleagues, junior_xu: { ...base.colleagues.junior_xu, trust: 0 } } }).id).toBe('clinical_guardian')
    expect(selectTenYearEnding({ ...base, level: 2, health: 88, stress: 40, money: 400, signatureValue: 60, reputation: 30, flags: ['identity_boundaries'], colleagues: { ...base.colleagues, junior_xu: { ...base.colleagues.junior_xu, trust: 0 } } }).id).toBe('life_with_boundaries')
  })
})
