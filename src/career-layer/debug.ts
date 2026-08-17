import { continueAfterReport, createCareerGame, playCareerYear } from './engine'
import { HOSPITAL_CAREER } from './hospital'
import { HOSPITAL_EVENTS, HOSPITAL_GOALS } from './hospital-story'
import { careerRandomAt } from './rng'
import { ABILITY_KEYS, type Career, type GameState, type NewCareerGameOptions, type SimulationConfig, type SimulationResult } from './types'

const numeric = (params: URLSearchParams, key: string): number | undefined => {
  const raw = params.get(key)
  if (raw == null || raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

export function parseDebugSearch(search: string): NewCareerGameOptions & { career?: string } {
  const params = new URLSearchParams(search)
  const abilities = Object.fromEntries(ABILITY_KEYS.flatMap((key) => {
    const value = numeric(params, key)
    return value == null ? [] : [[key, value]]
  }))
  return {
    career: params.get('career') ?? undefined,
    debug: params.get('debug') === '1',
    seed: params.get('seed') ?? undefined,
    age: numeric(params, 'age'),
    level: numeric(params, 'level'),
    stress: numeric(params, 'stress'),
    energy: numeric(params, 'energy'),
    health: numeric(params, 'health'),
    reputation: numeric(params, 'reputation'),
    money: numeric(params, 'money'),
    abilities,
  }
}

function choose(state: GameState, career: Career, strategy: NonNullable<SimulationConfig['strategy']>): string {
  const available = state.availableChoiceIds
  const preferred: Record<Exclude<NonNullable<SimulationConfig['strategy']>, 'random'>, string[]> = {
    career_max: ['clinical_project', 'administration', 'professional_study', 'mentor'],
    money_max: ['night_shift', 'administration', 'clinical_project'],
    worklife_max: ['leave_on_time', 'mentor', 'professional_study'],
    balanced: state.stress >= 68 ? ['leave_on_time', 'professional_study', 'mentor'] : ['clinical_project', 'mentor', 'leave_on_time'],
    risk_taker: ['night_shift', 'clinical_project', 'administration'],
  }
  if (strategy === 'random') return available[Math.floor(careerRandomAt(state.seed, state.rngCursor + 31) * available.length)]
  return preferred[strategy].find((id) => available.includes(id)) ?? available[0]
}

export function fastForward(initial: GameState, years: number, strategy: NonNullable<SimulationConfig['strategy']> = 'balanced', career: Career = HOSPITAL_CAREER): GameState {
  let state = initial
  let remaining = Math.max(0, Math.floor(years))
  while (remaining > 0 && state.stage !== 'ending') {
    if (state.stage === 'report') state = continueAfterReport(state, career, HOSPITAL_GOALS)
    if (state.stage === 'choice') {
      state = playCareerYear(state, choose(state, career, strategy), career, HOSPITAL_GOALS, HOSPITAL_EVENTS)
      remaining -= 1
    }
  }
  if (state.stage === 'report' && state.runYear > 10) state = continueAfterReport(state, career, HOSPITAL_GOALS)
  return state
}

export function simulate(config: SimulationConfig = {}, career: Career = HOSPITAL_CAREER): SimulationResult {
  if (config.career && config.career !== career.id) throw new Error(`Career ${config.career} 尚未在 M0/M1 啟用`)
  const runs = Math.max(1, Math.min(10_000, Math.floor(config.runs ?? 100)))
  let assets = 0
  let levels = 0
  let burnoutRuns = 0
  const endings: Record<number, number> = {}
  for (let index = 0; index < runs; index += 1) {
    const initial = createCareerGame(career, { seed: `${config.seed ?? 'SIM05'}-${index}` }, HOSPITAL_GOALS)
    const ending = fastForward(initial, 10, config.strategy ?? 'balanced', career)
    assets += ending.money - ending.debt
    levels += ending.promotion.highestLevel
    if (ending.burnout.episodes > 0) burnoutRuns += 1
    endings[ending.promotion.highestLevel] = (endings[ending.promotion.highestLevel] ?? 0) + 1
  }
  return {
    runs,
    averageRetirementAssets: Math.round(assets / runs),
    averageHighestLevel: Math.round(levels / runs * 100) / 100,
    burnoutRate: Math.round(burnoutRuns / runs * 1000) / 1000,
    endings,
  }
}

export function dumpTimeline(state: GameState) {
  return state.timeline.map((entry) => ({ ...entry }))
}
