export const ABILITY_KEYS = ['KNOW', 'DISP', 'COMM', 'EFF', 'REG', 'MGT', 'BIZ', 'RES'] as const

export type AbilityKey = typeof ABILITY_KEYS[number]
export type Abilities = Record<AbilityKey, number>
export type AbilityWeights = Record<AbilityKey, number>
export type Difficulty = 1 | 2 | 3 | 4 | 5
export type EmploymentStatus = 'employed' | 'gap' | 'entry_preparation' | 'retired'
export type AnnualStage = 'choice' | 'report' | 'ending'
export type ShiftType = 'day' | 'evening' | 'night'

export interface CareerEntry {
  minAbilities?: Partial<Abilities>
  minAge?: number
  requiredCareerYears?: number
  requiredFlags?: string[]
  difficulty: Difficulty
  ageSensitivity: number
  entryDelayYears?: [number, number]
  entryCost?: number
  entryStress?: number
}

export interface CareerLevel {
  level: number
  title: string
  minYears: number
  perfRequired: number
  baseChance: number
  salaryBase: number
  salaryRange: [number, number]
  stressDelta: number
  isCeiling?: boolean
}

export interface CareerSignature {
  id: string
  label: string
  unit: string
  drivenBy: AbilityKey
  growthPerYear: [number, number]
  initialValue: number
  minValue?: number
  maxValue?: number
  thresholds?: Array<{ value: number; flag?: string; event?: string; achievement?: string }>
}

export interface CompensationPolicy {
  monthsPerYear: number
  shiftAllowances: Record<ShiftType, number>
  shiftBurnoutMultipliers: Record<ShiftType, number>
  ladderAllowanceByLevel: number[]
  dutyAllowanceByLevel: number[]
}

export interface AnnualChoiceEffects {
  abilities?: Partial<Abilities>
  stress?: number
  health?: number
  burnoutRisk?: number
  burnoutRecovery?: number
  workload?: number
  workLife?: number
  money?: number
  reputation?: number
  signature?: number
  performance?: number
  promotionBonus?: number
  shift?: ShiftType
}

export interface AnnualChoice {
  id: string
  label: string
  description: string
  tradeoff: string
  effects: AnnualChoiceEffects
  setsFlag?: string
}

export interface CareerExit {
  to: string
  minLevel: number
  difficulty: Difficulty
  note: string
  transferableExperienceRate?: number
  salaryRetentionRate?: number
  preferredSubTracks?: string[]
}

export interface TransferPolicy {
  maxEntryLevel?: number
  salaryRetentionCap?: number
}

export interface CareerSubTrack {
  id: string
  name: string
  description?: string
  abilityWeightOverrides?: Partial<AbilityWeights>
  eventPool?: string
  salaryModifier?: number
  stressModifier?: number
  signatureOverride?: CareerSignature
  entryModifiers?: Partial<CareerEntry>
}

export interface Condition {
  minAge?: number
  minLevel?: number
  requiredFlags?: string[]
}

export interface GameEffects extends AnnualChoiceEffects {
  flags?: string[]
}

export interface CareerMilestone {
  id: string
  name: string
  minYears?: number
  requirements?: Condition[]
  durationYears?: number
  cost?: number
  salaryDuring?: number
  effects?: GameEffects
  requiredForLevel?: number
}

export interface WeightedOutcome {
  weight: number
  label: string
  effects?: GameEffects
  employmentStatus?: EmploymentStatus
}

export interface CareerHazard {
  id: string
  chance: number
  conditions?: Condition[]
  outcomes: WeightedOutcome[]
}

export interface Career {
  id: string
  name: string
  shortName: string
  description: string
  abilityWeights: AbilityWeights
  entry: CareerEntry
  ladder: CareerLevel[]
  signature: CareerSignature
  compensation: CompensationPolicy
  stressCoefficient: number
  workLifeBalance: number
  nightShift: boolean
  annualChoices: AnnualChoice[]
  eventPool: string
  exits: CareerExit[]
  milestones?: CareerMilestone[]
  annualHazards?: CareerHazard[]
  subTracks?: CareerSubTrack[]
  transferPolicy?: TransferPolicy
}

export interface TimedModifier {
  id: string
  source: string
  durationYears: number
  effects: {
    performance?: number
    stress?: number
    burnoutRiskMultiplier?: number
    promotionBonus?: number
    salaryMultiplier?: number
    workLifeBonus?: number
    abilityGrowthMultiplier?: Partial<Record<AbilityKey, number>>
  }
}

export interface PromotionState {
  eligibleYears: number
  annualBonus: number
  highestLevel: number
  lastOutcome: PromotionOutcome
}

export type PromotionOutcome = 'not_eligible' | 'performance_shortfall' | 'no_opening' | 'promoted' | 'ceiling'

export interface BurnoutState {
  status: 'stable' | 'active' | 'recovering'
  risk: number
  episodes: number
  recurrenceMultiplier: number
  pendingResolution: boolean
}

export interface GapState {
  years: number
  reason?: 'resignation' | 'layoff' | 'transition_failed' | 'preparation'
  annualPenalty: number
  remainingYears: number
}

export interface TransitionState {
  status: 'idle' | 'offered' | 'attempting' | 'failed' | 'accepted'
  targetCareerId?: string
  attempts: number
  offers: string[]
  lastScore?: number
  lastProbability?: number
}

export interface CareerHistoryEntry {
  careerId: string
  subTrack?: string
  years: number
  highestLevel: number
}

export interface MilestoneProgress {
  milestoneId: string
  status: 'available' | 'active' | 'completed'
  yearsRemaining: number
}

export interface CompensationSnapshot {
  salaryBase: number
  nightShiftAllowance: number
  ladderAllowance: number
  dutyAllowance: number
  monthsPerYear: number
  variableBonus: number
  annualIncome: number
  shift: ShiftType
}

export interface AbilityChange {
  key: AbilityKey
  before: number
  after: number
}

export interface AnnualReport {
  age: number
  year: number
  careerId: string
  level: number
  title: string
  choiceId: string
  choiceLabel: string
  performance: number
  compensation: CompensationSnapshot
  moneyBefore: number
  moneyAfter: number
  stressBefore: number
  stressAfter: number
  burnoutRiskBefore: number
  burnoutRiskAfter: number
  burnoutTriggered: boolean
  promotionOutcome: PromotionOutcome
  promotionMessage: string
  abilityChanges: AbilityChange[]
  signatureBefore: number
  signatureAfter: number
  signatureGrowth: number
  notes: string[]
}

export interface TimelineEntry {
  age: number
  year: number
  type: 'choice' | 'promotion' | 'burnout' | 'retirement'
  title: string
  detail: string
}

export interface GameState {
  schemaVersion: 'career-layer-v0.4'
  rngVersion: string
  seed: string
  rngCursor: number
  age: number
  year: number
  stage: AnnualStage
  employmentStatus: EmploymentStatus
  careerId: string
  subTrack?: string
  level: number
  yearsInCareer: number
  yearsInLevel: number
  totalProfessionalYears: number
  abilities: Abilities
  stress: number
  energy: number
  health: number
  reputation: number
  money: number
  debt: number
  livingCostAnnual: number
  performance: number
  signatureValue: number
  shift: ShiftType
  compensation: CompensationSnapshot
  promotion: PromotionState
  burnout: BurnoutState
  gap: GapState
  transition: TransitionState
  careerHistory: CareerHistoryEntry[]
  milestones: MilestoneProgress[]
  activeModifiers: TimedModifier[]
  flags: string[]
  availableChoiceIds: string[]
  lastReport?: AnnualReport
  reports: AnnualReport[]
  timeline: TimelineEntry[]
  debug: boolean
}

export interface NewCareerGameOptions {
  seed?: string
  age?: number
  year?: number
  level?: number
  abilities?: Partial<Abilities>
  stress?: number
  energy?: number
  health?: number
  reputation?: number
  money?: number
  debug?: boolean
}

export interface SimulationConfig {
  career?: string
  runs?: number
  seed?: string
  strategy?: 'random' | 'career_max' | 'money_max' | 'worklife_max' | 'balanced' | 'risk_taker'
}

export interface SimulationResult {
  runs: number
  averageRetirementAssets: number
  averageHighestLevel: number
  burnoutRate: number
  endings: Record<number, number>
}
