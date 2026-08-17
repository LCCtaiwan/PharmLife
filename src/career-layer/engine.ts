import { CAREER_RNG_VERSION, careerRandomAt, careerRandomInt, normalizeCareerSeed } from './rng'
import { assertValidCareer } from './schema'
import { ABILITY_KEYS, type Abilities, type AnnualChoice, type AnnualReport, type Career, type CompensationSnapshot, type GameState, type NewCareerGameOptions, type PromotionOutcome, type ShiftType } from './types'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const roundOne = (value: number) => Math.round(value * 10) / 10

const DEFAULT_ABILITIES: Abilities = {
  KNOW: 48,
  DISP: 50,
  COMM: 43,
  EFF: 45,
  REG: 46,
  MGT: 32,
  BIZ: 30,
  RES: 38,
}

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
  return {
    salaryBase: role.salaryBase,
    nightShiftAllowance,
    ladderAllowance,
    dutyAllowance,
    monthsPerYear: career.compensation.monthsPerYear,
    variableBonus,
    annualIncome: roundOne(annualIncome),
    shift,
  }
}

function drawChoices(state: GameState, career: Career): GameState {
  const pool = [...career.annualChoices]
  const selected: string[] = []
  let cursor = state.rngCursor
  while (selected.length < Math.min(3, pool.length)) {
    const index = Math.floor(careerRandomAt(state.seed, cursor) * pool.length)
    cursor += 1
    selected.push(pool.splice(index, 1)[0].id)
  }
  return { ...state, rngCursor: cursor, stage: 'choice', availableChoiceIds: selected }
}

export function createCareerGame(career: Career, options: NewCareerGameOptions = {}): GameState {
  assertValidCareer(career)
  const age = clamp(Math.round(options.age ?? 25), 25, 65)
  const level = clamp(Math.round(options.level ?? 1), 1, career.ladder.length)
  const abilities = Object.fromEntries(ABILITY_KEYS.map((key) => [key, clamp(Math.round(options.abilities?.[key] ?? DEFAULT_ABILITIES[key]), 20, 80)])) as unknown as Abilities
  const retired = age >= 65
  const state: GameState = {
    schemaVersion: 'career-layer-v0.4',
    rngVersion: CAREER_RNG_VERSION,
    seed: normalizeCareerSeed(options.seed ?? 'PHARM-TEST-0001'),
    rngCursor: 0,
    age,
    year: Math.round(options.year ?? 2026 + (age - 25)),
    stage: retired ? 'ending' : 'choice',
    employmentStatus: retired ? 'retired' : 'employed',
    careerId: career.id,
    level,
    yearsInCareer: age - 25,
    yearsInLevel: 0,
    totalProfessionalYears: age - 25,
    abilities,
    stress: clamp(options.stress ?? 35),
    energy: clamp(options.energy ?? 72),
    health: clamp(options.health ?? 85),
    reputation: clamp(options.reputation ?? 30),
    money: Math.max(0, options.money ?? 20),
    debt: 0,
    livingCostAnnual: 36,
    performance: 0,
    signatureValue: career.signature.initialValue,
    shift: 'day',
    compensation: calculateCompensation(career, level, 'day'),
    promotion: { eligibleYears: 0, annualBonus: 0, highestLevel: level, lastOutcome: career.ladder[level - 1].isCeiling ? 'ceiling' : 'not_eligible' },
    burnout: { status: 'stable', risk: 0, episodes: 0, recurrenceMultiplier: 1, pendingResolution: false },
    gap: { years: 0, annualPenalty: 6, remainingYears: 0 },
    transition: { status: 'idle', attempts: 0, offers: [] },
    careerHistory: [{ careerId: career.id, years: age - 25, highestLevel: level }],
    milestones: (career.milestones ?? []).map((milestone) => ({ milestoneId: milestone.id, status: 'available', yearsRemaining: 0 })),
    activeModifiers: [],
    flags: [],
    availableChoiceIds: [],
    reports: [],
    timeline: [],
    debug: Boolean(options.debug),
  }
  return retired ? state : drawChoices(state, career)
}

function weightedAbilityScore(abilities: Abilities, career: Career): number {
  return ABILITY_KEYS.reduce((total, key) => {
    const normalized = clamp((abilities[key] - 20) / 60 * 100)
    return total + normalized * career.abilityWeights[key]
  }, 0)
}

function promotionMessage(outcome: PromotionOutcome): string {
  switch (outcome) {
    case 'performance_shortfall': return '主管評價：還需要再磨一磨。'
    case 'no_opening': return '主管評價：表現符合資格，但今年沒有缺。'
    case 'promoted': return '主管評價：你準備好了，新的位置交給你。'
    case 'ceiling': return '你已走到這條組織階梯目前的最高位置。'
    default: return '年資尚未達到下一階段的升遷資格。'
  }
}

function addThresholdFlags(state: GameState, career: Career, signatureValue: number): string[] {
  const next = new Set(state.flags)
  for (const threshold of career.signature.thresholds ?? []) if (signatureValue >= threshold.value && threshold.flag) next.add(threshold.flag)
  return [...next]
}

export function playCareerYear(state: GameState, choiceId: string, career: Career): GameState {
  if (state.stage !== 'choice' || state.employmentStatus !== 'employed') return state
  if (!state.availableChoiceIds.includes(choiceId)) throw new Error(`choice ${choiceId} is not available this year`)
  const choice = career.annualChoices.find((item) => item.id === choiceId)
  if (!choice) throw new Error(`unknown choice ${choiceId}`)

  let cursor = state.rngCursor
  const roll = () => careerRandomAt(state.seed, cursor++)
  const randomInteger = (min: number, max: number) => min + Math.floor(roll() * (max - min + 1))
  const effects = choice.effects
  const abilities = { ...state.abilities }
  const abilityChanges: AnnualReport['abilityChanges'] = []
  for (const key of ABILITY_KEYS) {
    const before = abilities[key]
    const after = clamp(before + (effects.abilities?.[key] ?? 0), 20, 80)
    abilities[key] = after
    if (after !== before) abilityChanges.push({ key, before, after })
  }

  const workload = effects.workload ?? 1
  const shift = effects.shift ?? 'day'
  const managementModifier = state.level >= 4 ? 1.2 : 1
  const nightShiftModifier = career.compensation.shiftBurnoutMultipliers[shift]
  const recovery = effects.burnoutRecovery ?? 0
  const yearlyLoad = career.stressCoefficient * workload * managementModifier * nightShiftModifier * 12
  const burnoutRisk = clamp(state.burnout.risk * .75 + yearlyLoad + (effects.burnoutRisk ?? 0) - recovery)
  const stressAfter = clamp(state.stress + (effects.stress ?? 0) + career.stressCoefficient * workload * 4 + currentLevel(state, career).stressDelta * .2 - 5 - recovery * .25)
  const burnoutPenalty = state.burnout.status === 'active' ? 25 : 0
  const performance = Math.round(clamp(
    weightedAbilityScore(abilities, career)
      + Math.min(state.yearsInCareer * 1.5, 20)
      + (effects.performance ?? 0)
      + randomInteger(-8, 8)
      - (stressAfter <= 60 ? 0 : (stressAfter - 60) * .4)
      - burnoutPenalty,
  ))
  const signatureBaseGrowth = randomInteger(career.signature.growthPerYear[0], career.signature.growthPerYear[1])
  const drivenBonus = Math.max(0, Math.floor((abilities[career.signature.drivenBy] - 50) / 10))
  const signatureGrowth = Math.max(0, signatureBaseGrowth + drivenBonus + (effects.signature ?? 0))
  const signatureAfter = clamp(state.signatureValue + signatureGrowth, career.signature.minValue ?? 0, career.signature.maxValue ?? Number.MAX_SAFE_INTEGER)

  const role = currentLevel(state, career)
  const completedYearsInLevel = state.yearsInLevel + 1
  let promotionOutcome: PromotionOutcome = 'not_eligible'
  let nextLevel = state.level
  let nextEligibleYears = state.promotion.eligibleYears
  if (role.isCeiling) {
    promotionOutcome = 'ceiling'
  } else if (completedYearsInLevel < role.minYears) {
    promotionOutcome = 'not_eligible'
  } else if (performance < role.perfRequired) {
    promotionOutcome = 'performance_shortfall'
  } else if (roll() < role.baseChance) {
    promotionOutcome = 'promoted'
    nextLevel += 1
    nextEligibleYears = 0
  } else {
    promotionOutcome = 'no_opening'
    nextEligibleYears += 1
  }

  const burnoutTriggered = stressAfter > 70 && roll() < .08
  const previousStatus = state.burnout.status
  const burnoutStatus = burnoutTriggered ? 'active' : previousStatus === 'active' ? 'recovering' : 'stable'
  const finalBurnoutRisk = burnoutTriggered ? burnoutRisk * .4 : burnoutRisk
  const compensation = calculateCompensation(career, state.level, shift)
  const moneyAfter = roundOne(Math.max(0, state.money + compensation.annualIncome - state.livingCostAnnual + (effects.money ?? 0)))
  const healthAfter = clamp(state.health + (effects.health ?? 0) - (burnoutTriggered ? 4 : 0) - Math.max(0, stressAfter - 85) * .03)
  const energyAfter = clamp(state.energy + recovery * .6 - workload * 5 + (shift === 'night' ? -5 : 2))
  const report: AnnualReport = {
    age: state.age,
    year: state.year,
    careerId: career.id,
    level: nextLevel,
    title: career.ladder[nextLevel - 1].title,
    choiceId: choice.id,
    choiceLabel: choice.label,
    performance,
    compensation,
    moneyBefore: state.money,
    moneyAfter,
    stressBefore: state.stress,
    stressAfter,
    burnoutRiskBefore: state.burnout.risk,
    burnoutRiskAfter: roundOne(finalBurnoutRisk),
    burnoutTriggered,
    promotionOutcome,
    promotionMessage: promotionMessage(promotionOutcome),
    abilityChanges,
    signatureBefore: state.signatureValue,
    signatureAfter,
    signatureGrowth,
    notes: [choice.tradeoff, ...(burnoutTriggered ? ['Burnout 發作：今年的代價已經超過身體能承受的範圍。'] : [])],
  }
  const nextAge = state.age + 1
  const retired = nextAge >= 65
  const timeline = [...state.timeline, { age: state.age, year: state.year, type: 'choice' as const, title: choice.label, detail: `績效 ${performance}，年收入 ${compensation.annualIncome} 萬。` }]
  if (promotionOutcome === 'promoted') timeline.push({ age: state.age, year: state.year, type: 'promotion', title: `升任${career.ladder[nextLevel - 1].title}`, detail: promotionMessage('promoted') })
  if (burnoutTriggered) timeline.push({ age: state.age, year: state.year, type: 'burnout', title: 'Burnout', detail: '你第一次承認，靠意志力已經不夠。' })
  if (retired) timeline.push({ age: 65, year: state.year + 1, type: 'retirement', title: '退休', detail: '你為這段醫院職涯畫下句點。' })

  return {
    ...state,
    rngCursor: cursor,
    age: nextAge,
    year: state.year + 1,
    stage: retired ? 'ending' : 'report',
    employmentStatus: retired ? 'retired' : state.employmentStatus,
    level: nextLevel,
    yearsInCareer: state.yearsInCareer + 1,
    yearsInLevel: promotionOutcome === 'promoted' ? 0 : completedYearsInLevel,
    totalProfessionalYears: state.totalProfessionalYears + 1,
    abilities,
    stress: stressAfter,
    energy: energyAfter,
    health: healthAfter,
    reputation: clamp(state.reputation + (effects.reputation ?? 0)),
    money: moneyAfter,
    performance,
    signatureValue: signatureAfter,
    shift,
    compensation,
    promotion: {
      eligibleYears: nextEligibleYears,
      annualBonus: effects.promotionBonus ?? 0,
      highestLevel: Math.max(state.promotion.highestLevel, nextLevel),
      lastOutcome: promotionOutcome,
    },
    burnout: {
      ...state.burnout,
      status: burnoutStatus,
      risk: roundOne(finalBurnoutRisk),
      episodes: state.burnout.episodes + (burnoutTriggered ? 1 : 0),
      pendingResolution: false,
    },
    careerHistory: [{ careerId: career.id, years: state.yearsInCareer + 1, highestLevel: Math.max(state.promotion.highestLevel, nextLevel) }],
    activeModifiers: state.activeModifiers
      .map((modifier) => ({ ...modifier, durationYears: modifier.durationYears - 1 }))
      .filter((modifier) => modifier.durationYears > 0),
    flags: addThresholdFlags(state, career, signatureAfter),
    availableChoiceIds: [],
    lastReport: report,
    reports: [...state.reports, report],
    timeline,
  }
}

export function continueAfterReport(state: GameState, career: Career): GameState {
  if (state.stage !== 'report') return state
  return drawChoices({ ...state, lastReport: state.lastReport }, career)
}

export function choiceById(career: Career, id: string): AnnualChoice | undefined {
  return career.annualChoices.find((choice) => choice.id === id)
}

export function debugRandomInt(state: GameState, min: number, max: number): number {
  return careerRandomInt(state.seed, state.rngCursor, min, max)
}
