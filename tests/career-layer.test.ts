import { describe, expect, it } from 'vitest'
import { fastForward, parseDebugSearch, simulate } from '../src/career-layer/debug'
import { calculateCompensation, createCareerGame, playCareerYear } from '../src/career-layer/engine'
import { HOSPITAL_CAREER } from '../src/career-layer/hospital'
import { careerRandomAt, generateCareerSeed, normalizeCareerSeed } from '../src/career-layer/rng'
import { validateCareer } from '../src/career-layer/schema'

describe('Career Layer v0.4 foundation', () => {
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
    const state = createCareerGame(HOSPITAL_CAREER, options)
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
    const first = createCareerGame(HOSPITAL_CAREER, { seed: 'REPLAY04' })
    const second = createCareerGame(HOSPITAL_CAREER, { seed: 'REPLAY04' })
    const choice = first.availableChoiceIds[0]
    expect(playCareerYear(first, choice, HOSPITAL_CAREER)).toEqual(playCareerYear(second, choice, HOSPITAL_CAREER))
  })

  it('plays forty Hospital years without a dead end and retires at 65', () => {
    const ending = fastForward(createCareerGame(HOSPITAL_CAREER, { seed: 'FORTYYEARS04' }), 40)
    expect(ending.stage).toBe('ending')
    expect(ending.employmentStatus).toBe('retired')
    expect(ending.age).toBe(65)
    expect(ending.reports).toHaveLength(40)
    expect(ending.timeline.at(-1)?.type).toBe('retirement')
    expect(ending.compensation.annualIncome).toBeGreaterThan(0)
  })

  it('supports deterministic multi-run smoke simulation', () => {
    const first = simulate({ career: 'hospital', runs: 20, seed: 'BALANCE04', strategy: 'balanced' })
    const second = simulate({ career: 'hospital', runs: 20, seed: 'BALANCE04', strategy: 'balanced' })
    expect(first).toEqual(second)
    expect(first.runs).toBe(20)
    expect(first.averageRetirementAssets).toBeGreaterThan(0)
  })
})
