import { CAREER_RNG_VERSION, careerRandomAt, normalizeCareerSeed } from './rng'
import { assertValidCareer } from './schema'
import { ABILITY_KEYS, type Abilities, type AnnualChoice, type AnnualGoal, type AnnualReport, type Career, type ColleagueState, type CompensationSnapshot, type EventCondition, type EventEffects, type GameEffects, type GameState, type NewCareerGameOptions, type PromotionOutcome, type SeedFate, type ShiftType, type WorkplaceEvent, type YearDraft } from './types'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const roundOne = (value: number) => Math.round(value * 10) / 10

const DEFAULT_ABILITIES: Abilities = { KNOW: 48, DISP: 50, COMM: 43, EFF: 45, REG: 46, MGT: 32, BIZ: 30, RES: 38 }
const FATES: SeedFate[] = ['clinical_eye', 'staffing_storm', 'mentor_bond', 'political_headwind', 'quiet_years']

export function abilityGrade(value: number): string {
  if (value >= 77) return 'A+'
  if (value >= 71) return 'A'
  if (value >= 64) return 'A−'
  if (value >= 57) return 'B+'
  if (value >= 50) return 'B'
  if (value >= 40) return 'C+'
  if (value >= 30) return 'C'
  return 'D'
}

export function currentLevel(state: GameState, career: Career) {
  return career.ladder[state.level - 1] ?? career.ladder[0]
}

export function calculateCompensation(career: Career, level: number, shift: ShiftType, variableBonus = 0): CompensationSnapshot {
  const role = career.ladder[level - 1] ?? career.ladder[0]
  const index = Math.max(0, level - 1)
  const nightShiftAllowance = career.compensation.shiftAllowances[shift]
  const ladderAllowance = career.compensation.ladderAllowanceByLevel[index] ?? 0
  const dutyAllowance = career.compensation.dutyAllowanceByLevel[index] ?? 0
  const annualIncome = (role.salaryBase + nightShiftAllowance + ladderAllowance + dutyAllowance) * career.compensation.monthsPerYear + variableBonus
  return { salaryBase: role.salaryBase, nightShiftAllowance, ladderAllowance, dutyAllowance, monthsPerYear: career.compensation.monthsPerYear, variableBonus, annualIncome: roundOne(annualIncome), shift }
}

function selectSeedFate(seed: string): SeedFate {
  return FATES[Math.floor(careerRandomAt(seed, 997) * FATES.length)]
}

function initialColleagues(fate: SeedFate): Record<string, ColleagueState> {
  return {
    director_chen: { trust: fate === 'political_headwind' ? -8 : 0, respect: 0, strain: 0, flags: [] },
    senior_lin: { trust: fate === 'clinical_eye' ? 6 : 0, respect: 0, strain: 0, flags: [] },
    junior_xu: { trust: fate === 'mentor_bond' ? 12 : 0, respect: 0, strain: 0, flags: [] },
  }
}

function drawYear(state: GameState, career: Career, goals: AnnualGoal[]): GameState {
  const availableGoals = goals.filter((goal) => goal.id !== state.lastReport?.goalId)
  const goalPool = availableGoals.length ? availableGoals : goals
  let cursor = state.rngCursor
  const goal = goalPool[Math.floor(careerRandomAt(state.seed, cursor++) * goalPool.length)]
  const pool = [...career.annualChoices]
  const selected: string[] = []
  while (selected.length < Math.min(3, pool.length)) {
    const index = Math.floor(careerRandomAt(state.seed, cursor++) * pool.length)
    selected.push(pool.splice(index, 1)[0].id)
  }
  return {
    ...state,
    rngCursor: cursor,
    stage: 'choice',
    fateRevealedThisYear: false,
    currentGoalId: goal?.id ?? '',
    goalProgress: 0,
    goalOutcome: undefined,
    yearPlanChoiceId: undefined,
    yearDraft: undefined,
    pendingEventId: undefined,
    pendingOutcomeTitle: undefined,
    pendingOutcomeText: undefined,
    availableChoiceIds: selected,
  }
}

export function createCareerGame(career: Career, options: NewCareerGameOptions = {}, goals: AnnualGoal[] = []): GameState {
  assertValidCareer(career)
  const age = clamp(Math.round(options.age ?? 25), 25, 35)
  const level = clamp(Math.round(options.level ?? 1), 1, career.ladder.length)
  const seed = normalizeCareerSeed(options.seed ?? 'PHARMLIFE05')
  const fate = selectSeedFate(seed)
  const abilities = Object.fromEntries(ABILITY_KEYS.map((key) => [key, clamp(Math.round(options.abilities?.[key] ?? DEFAULT_ABILITIES[key]), 20, 80)])) as unknown as Abilities
  const runYear = Math.min(11, Math.max(1, age - 24))
  const retired = age >= 35
  const state: GameState = {
    schemaVersion: 'career-layer-v0.5', rngVersion: CAREER_RNG_VERSION, seed, rngCursor: 0,
    age, year: Math.round(options.year ?? 2026 + (age - 25)), runYear,
    stage: retired ? 'ending' : 'choice', employmentStatus: retired ? 'retired' : 'employed', careerId: career.id,
    level, yearsInCareer: age - 25, yearsInLevel: 0, totalProfessionalYears: age - 25, abilities,
    stress: clamp(options.stress ?? 35), energy: clamp(options.energy ?? 72), health: clamp(options.health ?? 85), reputation: clamp(options.reputation ?? 30),
    money: Math.max(0, options.money ?? 20), debt: 0, livingCostAnnual: 36, performance: 0, signatureValue: career.signature.initialValue,
    shift: 'day', compensation: calculateCompensation(career, level, 'day'),
    promotion: { eligibleYears: 0, annualBonus: 0, highestLevel: level, lastOutcome: career.ladder[level - 1].isCeiling ? 'ceiling' : 'not_eligible' },
    burnout: { status: 'stable', risk: 0, episodes: 0, recurrenceMultiplier: 1, pendingResolution: false },
    gap: { years: 0, annualPenalty: 6, remainingYears: 0 }, transition: { status: 'idle', attempts: 0, offers: [] },
    careerHistory: [{ careerId: career.id, years: age - 25, highestLevel: level }],
    milestones: (career.milestones ?? []).map((milestone) => ({ milestoneId: milestone.id, status: 'available', yearsRemaining: 0 })),
    activeModifiers: [], flags: [], seedFate: fate, fateRevealed: false, fateRevealedThisYear: false, colleagues: initialColleagues(fate),
    currentGoalId: '', goalProgress: 0, eventHistory: [], eventChoiceHistory: [], chainProgress: {},
    availableChoiceIds: [], reports: [], timeline: [], debug: Boolean(options.debug),
  }
  return retired || !goals.length ? state : drawYear(state, career, goals)
}

function conditionMatches(state: GameState, condition: EventCondition): boolean {
  if (condition.minRunYear != null && state.runYear < condition.minRunYear) return false
  if (condition.maxRunYear != null && state.runYear > condition.maxRunYear) return false
  if (condition.requiredFlags?.some((flag) => !state.flags.includes(flag))) return false
  if (condition.excludedFlags?.some((flag) => state.flags.includes(flag))) return false
  if (condition.planChoiceIds && !condition.planChoiceIds.includes(state.yearPlanChoiceId ?? '')) return false
  if (condition.seedFates && !condition.seedFates.includes(state.seedFate)) return false
  if (condition.colleague) {
    const colleague = state.colleagues[condition.colleague.id]
    if (!colleague) return false
    if (condition.colleague.minTrust != null && colleague.trust < condition.colleague.minTrust) return false
    if (condition.colleague.maxStrain != null && colleague.strain > condition.colleague.maxStrain) return false
  }
  return true
}

function eligibleEvents(state: GameState, events: WorkplaceEvent[]): WorkplaceEvent[] {
  return events.filter((event) => {
    if (!event.repeatable && state.eventHistory.includes(event.id)) return false
    if (!event.repeatable && event.chapter !== (state.chainProgress[event.chainId] ?? 0) + 1) return false
    if (event.repeatable && state.eventHistory.at(-1) === event.id) return false
    return (event.conditions ?? []).every((condition) => conditionMatches(state, condition))
  })
}

function selectEvent(state: GameState, events: WorkplaceEvent[]): { event: WorkplaceEvent; cursor: number } {
  const eligible = eligibleEvents(state, events)
  if (!eligible.length) throw new Error('No eligible workplace events')
  const weights = eligible.map((event) => Math.max(1, event.weight + (event.fateWeight?.[state.seedFate] ?? 0) + (event.chainId === state.currentGoalId ? 10 : 0)))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const cursor = state.rngCursor
  let target = careerRandomAt(state.seed, cursor) * total
  for (let index = 0; index < eligible.length; index += 1) {
    target -= weights[index]
    if (target <= 0) return { event: eligible[index], cursor: cursor + 1 }
  }
  return { event: eligible.at(-1)!, cursor: cursor + 1 }
}

function mergeNumberMaps<T extends string>(first?: Partial<Record<T, number>>, second?: Partial<Record<T, number>>): Partial<Record<T, number>> | undefined {
  if (!first && !second) return undefined
  const result: Partial<Record<T, number>> = { ...(first ?? {}) }
  for (const [key, value] of Object.entries(second ?? {}) as [T, number][]) result[key] = (result[key] ?? 0) + value
  return result
}

function mergeEffects(first: EventEffects, second?: EventEffects | GameEffects): EventEffects {
  if (!second) return first
  return {
    ...first, ...second,
    abilities: mergeNumberMaps(first.abilities, second.abilities),
    stress: (first.stress ?? 0) + (second.stress ?? 0), health: (first.health ?? 0) + (second.health ?? 0),
    burnoutRisk: (first.burnoutRisk ?? 0) + (second.burnoutRisk ?? 0), burnoutRecovery: (first.burnoutRecovery ?? 0) + (second.burnoutRecovery ?? 0),
    money: (first.money ?? 0) + (second.money ?? 0), reputation: (first.reputation ?? 0) + (second.reputation ?? 0),
    signature: (first.signature ?? 0) + (second.signature ?? 0), performance: (first.performance ?? 0) + (second.performance ?? 0),
    promotionBonus: (first.promotionBonus ?? 0) + (second.promotionBonus ?? 0), goalProgress: first.goalProgress ?? 0,
    flags: [...new Set([...(first.flags ?? []), ...(second.flags ?? [])])],
  }
}

export function chooseCareerDirection(state: GameState, choiceId: string, career: Career, goals: AnnualGoal[], events: WorkplaceEvent[]): GameState {
  if (state.stage !== 'choice') return state
  if (!state.availableChoiceIds.includes(choiceId)) throw new Error(`choice ${choiceId} is not available this year`)
  const choice = career.annualChoices.find((item) => item.id === choiceId)
  if (!choice) throw new Error(`unknown choice ${choiceId}`)
  const goal = goals.find((item) => item.id === state.currentGoalId)
  const draft: YearDraft = {
    planChoiceId: choice.id,
    goalProgress: goal?.preferredChoiceIds.includes(choice.id) ? 1 : 0,
    effects: { ...choice.effects, abilities: { ...(choice.effects.abilities ?? {}) } },
    relationshipNotes: [],
  }
  const withPlan = { ...state, yearPlanChoiceId: choice.id, yearDraft: draft, goalProgress: draft.goalProgress, availableChoiceIds: [] }
  const selected = selectEvent(withPlan, events)
  return { ...withPlan, rngCursor: selected.cursor, stage: 'event', pendingEventId: selected.event.id }
}

function applyColleagueEffects(state: GameState, effects: EventEffects): { colleagues: Record<string, ColleagueState>; notes: string[] } {
  const colleagues = { ...state.colleagues }
  const notes: string[] = []
  for (const [id, change] of Object.entries(effects.colleagues ?? {})) {
    const before = colleagues[id] ?? { trust: 0, respect: 0, strain: 0, flags: [] }
    colleagues[id] = {
      trust: clamp(before.trust + (change.trust ?? 0), -100, 100),
      respect: clamp(before.respect + (change.respect ?? 0), -100, 100),
      strain: clamp(before.strain + (change.strain ?? 0)),
      flags: [...new Set([...before.flags, ...(change.flags ?? [])])],
    }
    const trustDelta = change.trust ?? 0
    const respectDelta = change.respect ?? 0
    if (trustDelta || respectDelta) notes.push(`${id}：${trustDelta >= 0 ? '信任' : '關係'} ${trustDelta >= 0 ? '+' : ''}${trustDelta}${respectDelta ? `，尊重 ${respectDelta >= 0 ? '+' : ''}${respectDelta}` : ''}`)
  }
  return { colleagues, notes }
}

export function resolveWorkplaceEvent(state: GameState, eventChoiceId: string, events: WorkplaceEvent[]): GameState {
  if (state.stage !== 'event' || !state.pendingEventId || !state.yearDraft) return state
  const event = events.find((item) => item.id === state.pendingEventId)
  const choice = event?.choices.find((item) => item.id === eventChoiceId)
  if (!event || !choice) throw new Error(`unknown event choice ${eventChoiceId}`)
  const colleagueResult = applyColleagueEffects(state, choice.effects)
  const flags = [...new Set([...state.flags, ...(choice.effects.flags ?? []), ...(choice.setsFlags ?? [])])]
  const chainProgress = { ...state.chainProgress }
  if (choice.effects.chainAdvance) chainProgress[event.chainId] = Math.max(chainProgress[event.chainId] ?? 0, event.chapter)
  const fateRevealedThisYear = !state.fateRevealed && (event.fateWeight?.[state.seedFate] ?? 0) > 0
  const fateRevealed = state.fateRevealed || fateRevealedThisYear
  return {
    ...state,
    stage: 'outcome', colleagues: colleagueResult.colleagues, flags, chainProgress, fateRevealed, fateRevealedThisYear,
    goalProgress: state.goalProgress + (choice.effects.goalProgress ?? 0),
    yearDraft: {
      ...state.yearDraft,
      eventChoiceId: choice.id,
      eventOutcome: choice.outcome,
      goalProgress: state.goalProgress + (choice.effects.goalProgress ?? 0),
      effects: mergeEffects(state.yearDraft.effects, choice.effects),
      relationshipNotes: colleagueResult.notes,
    },
    pendingOutcomeTitle: choice.label,
    pendingOutcomeText: choice.outcome,
    eventHistory: [...state.eventHistory, event.id],
    eventChoiceHistory: [...state.eventChoiceHistory, `${event.id}:${choice.id}`],
  }
}

function weightedAbilityScore(abilities: Abilities, career: Career): number {
  return ABILITY_KEYS.reduce((total, key) => total + clamp((abilities[key] - 20) / 60 * 100) * career.abilityWeights[key], 0)
}

function promotionMessage(outcome: PromotionOutcome): string {
  if (outcome === 'performance_shortfall') return '還需要再磨一磨。'
  if (outcome === 'no_opening') return '你符合資格，但今年沒有缺。'
  if (outcome === 'promoted') return '新的位置交給你。'
  if (outcome === 'ceiling') return '你已走到這條組織階梯目前的最高位置。'
  return '年資尚未達到下一階段的資格。'
}

function burnoutProbability(risk: number): number {
  if (risk < 40) return 0
  if (risk < 50) return .03
  if (risk < 60) return .05
  if (risk < 70) return .09
  if (risk < 80) return .14
  if (risk < 90) return .21
  return .30
}

function addThresholdFlags(state: GameState, career: Career, signatureValue: number): string[] {
  const next = new Set(state.flags)
  for (const threshold of career.signature.thresholds ?? []) if (signatureValue >= threshold.value && threshold.flag) next.add(threshold.flag)
  return [...next]
}

export function finalizeCareerYear(state: GameState, career: Career, goals: AnnualGoal[], events: WorkplaceEvent[]): GameState {
  if (state.stage !== 'outcome' || !state.yearDraft || !state.pendingEventId) return state
  let cursor = state.rngCursor
  const roll = () => careerRandomAt(state.seed, cursor++)
  const randomInteger = (min: number, max: number) => min + Math.floor(roll() * (max - min + 1))
  const plan = career.annualChoices.find((item) => item.id === state.yearDraft!.planChoiceId)!
  const event = events.find((item) => item.id === state.pendingEventId)!
  const eventChoice = event.choices.find((item) => item.id === state.yearDraft!.eventChoiceId)!
  const goal = goals.find((item) => item.id === state.currentGoalId)!
  const goalCompleted = state.yearDraft.goalProgress >= goal.target
  const effects = mergeEffects(state.yearDraft.effects, goalCompleted ? goal.reward : undefined)
  const abilities = { ...state.abilities }
  const abilityChanges: AnnualReport['abilityChanges'] = []
  for (const key of ABILITY_KEYS) {
    const before = abilities[key]
    const after = clamp(before + (effects.abilities?.[key] ?? 0), 20, 80)
    abilities[key] = after
    if (before !== after) abilityChanges.push({ key, before, after })
  }
  const workload = effects.workload ?? 1
  const shift = effects.shift ?? 'day'
  const managementModifier = state.level >= 4 ? 1.2 : 1
  const nightModifier = career.compensation.shiftBurnoutMultipliers[shift]
  const recovery = effects.burnoutRecovery ?? 0
  const yearlyLoad = career.stressCoefficient * workload * managementModifier * nightModifier * 12
  const burnoutRisk = clamp(state.burnout.risk * .75 + yearlyLoad + (effects.burnoutRisk ?? 0) - recovery)
  const stressAfter = clamp(state.stress + (effects.stress ?? 0) + career.stressCoefficient * workload * 3 - 4 - recovery * .25 + (state.seedFate === 'quiet_years' ? -2 : 0))
  const burnoutPenalty = state.burnout.status === 'active' ? 25 : 0
  const performance = Math.round(clamp(weightedAbilityScore(abilities, career) + Math.min(state.yearsInCareer * 1.5, 20) + (effects.performance ?? 0) + (goalCompleted ? 4 : -2) + randomInteger(-8, 8) - (stressAfter <= 60 ? 0 : (stressAfter - 60) * .4) - burnoutPenalty))
  const signatureGrowth = Math.max(0, randomInteger(career.signature.growthPerYear[0], career.signature.growthPerYear[1]) + Math.max(0, Math.floor((abilities[career.signature.drivenBy] - 50) / 10)) + (effects.signature ?? 0))
  const signatureAfter = clamp(state.signatureValue + signatureGrowth, career.signature.minValue ?? 0, career.signature.maxValue ?? Number.MAX_SAFE_INTEGER)
  const role = currentLevel(state, career)
  const completedYearsInLevel = state.yearsInLevel + 1
  let promotionOutcome: PromotionOutcome = 'not_eligible'
  let nextLevel = state.level
  let eligibleYears = state.promotion.eligibleYears
  const fatePenalty = state.seedFate === 'political_headwind' ? .12 : state.seedFate === 'quiet_years' ? .03 : 0
  const directorBonus = Math.max(0, state.colleagues.director_chen.trust) / 500
  if (role.isCeiling) promotionOutcome = 'ceiling'
  else if (completedYearsInLevel < role.minYears) promotionOutcome = 'not_eligible'
  else if (performance < role.perfRequired) promotionOutcome = 'performance_shortfall'
  else if (roll() < clamp(role.baseChance + directorBonus - fatePenalty, .03, .85)) { promotionOutcome = 'promoted'; nextLevel += 1; eligibleYears = 0 }
  else { promotionOutcome = 'no_opening'; eligibleYears += 1 }
  const burnoutTriggered = roll() < burnoutProbability(burnoutRisk)
  const finalRisk = burnoutTriggered ? burnoutRisk * .4 : burnoutRisk
  const compensation = calculateCompensation(career, state.level, shift)
  const moneyAfter = roundOne(Math.max(0, state.money + compensation.annualIncome - state.livingCostAnnual + (effects.money ?? 0)))
  const healthAfter = clamp(state.health + (effects.health ?? 0) - (burnoutTriggered ? 5 : 0) - Math.max(0, stressAfter - 82) * .04)
  const report: AnnualReport = {
    age: state.age, year: state.year, careerId: career.id, level: nextLevel, title: career.ladder[nextLevel - 1].title,
    choiceId: plan.id, choiceLabel: plan.label, goalId: goal.id, goalLabel: goal.label, goalCompleted,
    eventId: event.id, eventTitle: event.title, eventChoiceLabel: eventChoice.label, eventOutcome: eventChoice.outcome,
    performance, compensation, moneyBefore: state.money, moneyAfter, stressBefore: state.stress, stressAfter,
    burnoutRiskBefore: state.burnout.risk, burnoutRiskAfter: roundOne(finalRisk), burnoutTriggered,
    promotionOutcome, promotionMessage: promotionMessage(promotionOutcome), abilityChanges,
    signatureBefore: state.signatureValue, signatureAfter, signatureGrowth,
    notes: [goalCompleted ? goal.successText : goal.failureText, ...state.yearDraft.relationshipNotes],
  }
  const timeline = [...state.timeline,
    { age: state.age, year: state.year, type: 'choice' as const, title: plan.label, detail: `年度目標：${goal.label}` },
    { age: state.age, year: state.year, type: 'event' as const, title: event.title, detail: eventChoice.outcome },
  ]
  if (promotionOutcome === 'promoted') timeline.push({ age: state.age, year: state.year, type: 'promotion', title: `升任${career.ladder[nextLevel - 1].title}`, detail: promotionMessage('promoted') })
  if (burnoutTriggered) timeline.push({ age: state.age, year: state.year, type: 'burnout', title: 'Burnout', detail: '這一年付出的代價超過了身體能承受的範圍。' })
  return {
    ...state, rngCursor: cursor, age: state.age + 1, year: state.year + 1, runYear: state.runYear + 1, stage: 'report',
    level: nextLevel, yearsInCareer: state.yearsInCareer + 1, yearsInLevel: promotionOutcome === 'promoted' ? 0 : completedYearsInLevel,
    totalProfessionalYears: state.totalProfessionalYears + 1, abilities, stress: stressAfter,
    energy: clamp(state.energy + recovery * .6 - workload * 5 + (shift === 'night' ? -5 : 2)), health: healthAfter,
    reputation: clamp(state.reputation + (effects.reputation ?? 0)), money: moneyAfter, performance, signatureValue: signatureAfter,
    shift, compensation, goalOutcome: goalCompleted ? 'success' : 'failure',
    promotion: { eligibleYears, annualBonus: effects.promotionBonus ?? 0, highestLevel: Math.max(state.promotion.highestLevel, nextLevel), lastOutcome: promotionOutcome },
    burnout: { ...state.burnout, status: burnoutTriggered ? 'active' : state.burnout.status === 'active' ? 'recovering' : 'stable', risk: roundOne(finalRisk), episodes: state.burnout.episodes + (burnoutTriggered ? 1 : 0), pendingResolution: false },
    careerHistory: [{ careerId: career.id, years: state.yearsInCareer + 1, highestLevel: Math.max(state.promotion.highestLevel, nextLevel) }],
    flags: addThresholdFlags({ ...state, flags: [...new Set([...state.flags, ...(effects.flags ?? [])])] }, career, signatureAfter),
    lastReport: report, reports: [...state.reports, report], timeline,
  }
}

export function continueAfterReport(state: GameState, career: Career, goals: AnnualGoal[] = []): GameState {
  if (state.stage !== 'report') return state
  if (state.runYear > 10) return {
    ...state, stage: 'ending', employmentStatus: 'retired',
    timeline: [...state.timeline, { age: 35, year: state.year, type: 'retirement', title: '十年回望', detail: '你停下來看這十年究竟把自己帶到了哪裡。' }],
  }
  return drawYear(state, career, goals)
}

export function playCareerYear(state: GameState, choiceId: string, career: Career, goals: AnnualGoal[] = [], events: WorkplaceEvent[] = []): GameState {
  const withDirection = chooseCareerDirection(state, choiceId, career, goals, events)
  const event = events.find((item) => item.id === withDirection.pendingEventId)
  if (!event) return withDirection
  const withEvent = resolveWorkplaceEvent(withDirection, event.choices[0].id, events)
  return finalizeCareerYear(withEvent, career, goals, events)
}

export function choiceById(career: Career, id: string): AnnualChoice | undefined {
  return career.annualChoices.find((choice) => choice.id === id)
}

export function workplaceEventById(events: WorkplaceEvent[], id?: string): WorkplaceEvent | undefined {
  return events.find((event) => event.id === id)
}
