import { CAREERS } from '../data/careers'
import { NPCS } from '../data/npcs'
import type { EffectSet, EventCondition, GameState, NPCState, PersonalityKey, StatKey } from './types'

export const STAT_LABELS: Record<StatKey, string> = {
  knowledge: '專業', dispensing: '調劑', communication: '溝通', efficiency: '效率', regulation: '法規', research: '研究', management: '管理', business: '商業',
}

export const PERSONALITY_LABELS: Record<PersonalityKey, [string, string]> = {
  ambition: ['知足', '野心'], idealism: ['現實', '理想'], risk: ['謹慎', '冒險'], empathy: ['原則', '人情'], worklife: ['工作', '生活'],
}

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export function initialNPCs(): Record<string, NPCState> {
  return Object.fromEntries(NPCS.map((npc) => [npc.id, { favor: 0, trust: 0, interest: 0, met: false, active: true, worldStage: 0 }]))
}

export function grade(value: number): string {
  if (value >= 90) return 'S'
  if (value >= 80) return 'A'
  if (value >= 70) return 'B'
  if (value >= 60) return 'C'
  if (value >= 50) return 'D'
  return 'E'
}

export function personalityTags(state: GameState): string[] {
  return (Object.entries(PERSONALITY_LABELS) as [PersonalityKey, [string, string]][])
    .filter(([key]) => Math.abs(state.personality[key]) >= 20)
    .sort(([a], [b]) => Math.abs(state.personality[b]) - Math.abs(state.personality[a]))
    .slice(0, 3)
    .map(([key, labels]) => state.personality[key] >= 0 ? labels[1] : labels[0])
}

function hasFlag(state: GameState, flag: string): boolean {
  return Boolean(state.flags[flag])
}

export function matchesCondition(state: GameState, condition?: EventCondition): boolean {
  if (!condition) return true
  const phase = Array.isArray(condition.phase) ? condition.phase : condition.phase ? [condition.phase] : null
  if (phase && !phase.includes(state.phase)) return false
  if (condition.minAge != null && state.age < condition.minAge) return false
  if (condition.maxAge != null && state.age > condition.maxAge) return false
  const careers = Array.isArray(condition.career) ? condition.career : condition.career != null ? [condition.career] : null
  if (careers && !careers.includes(state.career.trackId as never)) return false
  if (condition.minRole != null && state.career.roleIndex < condition.minRole) return false
  if (condition.requiresFlags?.some((flag) => !hasFlag(state, flag))) return false
  if (condition.excludesFlags?.some((flag) => hasFlag(state, flag))) return false
  if (condition.minStats && Object.entries(condition.minStats).some(([key, value]) => state.stats[key as StatKey] < (value ?? 0))) return false
  if (condition.minStatus && Object.entries(condition.minStatus).some(([key, value]) => state[key as keyof Pick<GameState, 'stress' | 'burnout' | 'health' | 'family' | 'reputation'>] < (value ?? 0))) return false
  if (condition.maxStatus && Object.entries(condition.maxStatus).some(([key, value]) => state[key as keyof Pick<GameState, 'stress' | 'burnout' | 'health' | 'family' | 'reputation'>] > (value ?? 100))) return false
  const familyStatuses = Array.isArray(condition.familyStatus) ? condition.familyStatus : condition.familyStatus ? [condition.familyStatus] : null
  if (familyStatuses && !familyStatuses.includes(state.familyLife.status)) return false
  if (condition.minCash != null && state.economy.cash < condition.minCash) return false
  if (condition.founder != null && state.career.founder !== condition.founder) return false
  if (condition.npc) {
    const npc = state.npcs[condition.npc.id]
    if (!npc) return false
    if (condition.npc.met != null && npc.met !== condition.npc.met) return false
    if (condition.npc.minFavor != null && npc.favor < condition.npc.minFavor) return false
    if (condition.npc.minTrust != null && npc.trust < condition.npc.minTrust) return false
  }
  return true
}

function addMap<T extends string>(source: Record<T, number>, additions: Partial<Record<T, number>>, min: number, max: number): Record<T, number> {
  const next = { ...source }
  for (const [key, amount] of Object.entries(additions) as [T, number][]) next[key] = clamp((next[key] ?? 0) + amount, min, max)
  return next
}

export function applyEffects(state: GameState, effects: EffectSet | undefined): GameState {
  if (!effects) return state
  const next: GameState = {
    ...state,
    stats: effects.stats ? addMap(state.stats, effects.stats, 20, 95) : state.stats,
    personality: effects.personality ? addMap(state.personality, effects.personality, -100, 100) : state.personality,
    economy: { ...state.economy },
    career: { ...state.career },
    familyLife: { ...state.familyLife },
    npcs: { ...state.npcs },
    flags: { ...state.flags, ...(effects.flags ?? {}) },
    achievements: [...new Set([...state.achievements, ...(effects.achievements ?? [])])],
  }

  if (effects.status) {
    if (effects.status.energy) next.energy = clamp(state.energy + effects.status.energy)
    if (effects.status.stress) next.stress = clamp(state.stress + effects.status.stress)
    if (effects.status.burnout) next.burnout = clamp(state.burnout + effects.status.burnout)
    if (effects.status.health) next.health = clamp(state.health + effects.status.health)
    if (effects.status.family) next.family = clamp(state.family + effects.status.family)
    if (effects.status.reputation) next.reputation = clamp(state.reputation + effects.status.reputation)
  }
  if (effects.economy) {
    for (const [key, amount] of Object.entries(effects.economy) as [keyof GameState['economy'], number][]) next.economy[key] = Math.max(0, (state.economy[key] ?? 0) + amount)
  }
  for (const [id, changes] of Object.entries(effects.relationships ?? {})) {
    const current = state.npcs[id] ?? { favor: 0, trust: 0, interest: 0, met: true, active: true, worldStage: 0 }
    next.npcs[id] = {
      ...current,
      met: true,
      favor: clamp(current.favor + (changes.favor ?? 0), -100, 100),
      trust: clamp(current.trust + (changes.trust ?? 0), -100, 100),
      interest: clamp(current.interest + (changes.interest ?? 0), -100, 100),
    }
  }
  for (const id of effects.meetNPC ?? []) if (next.npcs[id]) next.npcs[id] = { ...next.npcs[id], met: true }
  if (effects.setFamilyStatus) {
    next.familyLife.status = effects.setFamilyStatus
    if (effects.setFamilyStatus !== 'single' && !next.familyLife.partnerName) next.familyLife.partnerName = '江予安'
  }
  if (effects.addChildren) next.familyLife.children = Math.max(0, next.familyLife.children + effects.addChildren)
  if (effects.startCareer) {
    const changed = Boolean(state.career.trackId && state.career.trackId !== effects.startCareer)
    next.career = { ...next.career, trackId: effects.startCareer, roleIndex: 0, yearsInRole: 0, yearsInTrack: 0, unemployed: false, changes: state.career.changes + (changed ? 1 : 0), offers: [] }
    next.economy.annualIncome = CAREERS[effects.startCareer].roles[0].salary
  }
  if (effects.addOffer && !next.career.offers.includes(effects.addOffer)) next.career.offers = [...next.career.offers, effects.addOffer]
  if (effects.promote && next.career.trackId) {
    const maxRole = CAREERS[next.career.trackId].roles.length - 1
    next.career.roleIndex = Math.min(maxRole, next.career.roleIndex + 1)
    next.career.yearsInRole = 0
  }
  if (effects.startBusiness) {
    next.career.founder = true
    next.career.businessHealth = 55
  }
  if (effects.closeBusiness) {
    next.career.founder = false
    next.career.businessHealth = 0
  }
  return next
}

export function careerPerformance(state: GameState): number {
  if (!state.career.trackId) return 0
  const track = CAREERS[state.career.trackId]
  const ability = Object.entries(track.weights).reduce((total, [key, weight]) => total + state.stats[key as StatKey] * (weight ?? 0), 0)
  const condition = (state.energy - state.stress - state.burnout) * .08
  const relationship = Object.values(state.npcs).filter((npc) => npc.met).reduce((sum, npc) => sum + npc.trust, 0) / 120
  return clamp(Math.round(ability + condition + relationship))
}

export function netWorth(state: GameState): number {
  return Math.round(state.economy.cash + state.economy.assets - state.economy.debt)
}
