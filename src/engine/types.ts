export const STAT_KEYS = ['knowledge', 'dispensing', 'communication', 'efficiency', 'regulation', 'research', 'management', 'business'] as const
export const PERSONALITY_KEYS = ['ambition', 'idealism', 'risk', 'empathy', 'worklife'] as const

export type StatKey = (typeof STAT_KEYS)[number]
export type PersonalityKey = (typeof PERSONALITY_KEYS)[number]
export type CareerId = 'hospital' | 'community' | 'chain' | 'clinic' | 'pharma' | 'cro' | 'public' | 'academia'
export type Phase = 'student' | 'exam' | 'career' | 'ending'
export type FamilyStatus = 'single' | 'dating' | 'married' | 'separated'
export type Difficulty = 'story' | 'standard' | 'hard'
export type EventCategory = 'student' | 'exam' | 'career' | 'relationship' | 'family' | 'economy' | 'health' | 'startup' | 'world'

export type NumberMap<K extends string> = Record<K, number>

export interface PlayerProfile {
  name: string
  pronoun: string
  origin: 'steady' | 'scholar' | 'people' | 'hustler'
  difficulty: Difficulty
}

export interface CareerRole {
  title: string
  salary: number
  pressure: number
  promotionAfter: number
  requirements: Partial<NumberMap<StatKey>>
}

export interface CareerTrack {
  id: CareerId
  name: string
  short: string
  accent: string
  description: string
  tradeoff: string
  weights: Partial<NumberMap<StatKey>>
  roles: CareerRole[]
}

export interface NPCDefinition {
  id: string
  name: string
  role: string
  archetype: string
  career?: CareerId
  ageOffset: number
  color: string
}

export interface NPCState {
  favor: number
  trust: number
  interest: number
  met: boolean
  active: boolean
  worldStage: number
}

export interface EconomyState {
  cash: number
  assets: number
  debt: number
  annualIncome: number
  annualExpense: number
  homes: number
  businesses: number
}

export interface CareerState {
  trackId: CareerId | null
  roleIndex: number
  yearsInRole: number
  yearsInTrack: number
  performance: number
  changes: number
  unemployed: boolean
  founder: boolean
  businessHealth: number
  offers: CareerId[]
}

export interface FamilyState {
  status: FamilyStatus
  partnerName: string | null
  children: number
  parentCare: boolean
}

export interface TimelineEntry {
  age: number
  year: number
  title: string
  detail: string
  tone: 'good' | 'neutral' | 'bad' | 'milestone'
}

export interface ChoiceCheck {
  stats: Partial<NumberMap<StatKey>>
  difficulty: number
  personality?: Partial<NumberMap<PersonalityKey>>
  npcId?: string
}

export interface EffectSet {
  stats?: Partial<NumberMap<StatKey>>
  personality?: Partial<NumberMap<PersonalityKey>>
  status?: Partial<Record<'energy' | 'stress' | 'burnout' | 'health' | 'family' | 'reputation', number>>
  economy?: Partial<NumberMap<keyof EconomyState>>
  relationships?: Record<string, Partial<Record<'favor' | 'trust' | 'interest', number>>>
  flags?: Record<string, boolean | number | string>
  meetNPC?: string[]
  achievements?: string[]
  setFamilyStatus?: FamilyStatus
  addChildren?: number
  startCareer?: CareerId
  addOffer?: CareerId
  promote?: boolean
  startBusiness?: boolean
  closeBusiness?: boolean
}

export interface EventChoice {
  id: string
  text: string
  hint: string
  check?: ChoiceCheck
  effects?: EffectSet
  success?: { text: string; effects: EffectSet }
  failure?: { text: string; effects: EffectSet }
}

export interface EventCondition {
  phase?: Phase | Phase[]
  minAge?: number
  maxAge?: number
  career?: CareerId | CareerId[] | null
  minRole?: number
  requiresFlags?: string[]
  excludesFlags?: string[]
  minStats?: Partial<NumberMap<StatKey>>
  minStatus?: Partial<Record<'stress' | 'burnout' | 'health' | 'family' | 'reputation', number>>
  maxStatus?: Partial<Record<'stress' | 'burnout' | 'health' | 'family' | 'reputation', number>>
  familyStatus?: FamilyStatus | FamilyStatus[]
  minCash?: number
  npc?: { id: string; minFavor?: number; minTrust?: number; met?: boolean }
  founder?: boolean
}

export interface GameEvent {
  id: string
  category: EventCategory
  title: string
  eyebrow: string
  text: string
  npcId?: string
  weight: number
  once?: boolean
  cooldown?: number
  conditions?: EventCondition
  choices: EventChoice[]
}

export interface ActionDefinition {
  id: string
  name: string
  description: string
  accent: string
  effects: EffectSet
  careerOnly?: boolean
}

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  hidden?: boolean
}

export interface EndingResult {
  id: string
  title: string
  subtitle: string
  summary: string
  score: number
  badges: string[]
}

export interface PendingEventResult {
  eventId: string
  choiceText: string
  outcomeText: string
  success: boolean | null
  changes: string[]
}

export interface GameState {
  saveVersion: 2
  seedVersion: 'PL02-MULBERRY32-1'
  seed: string
  rngCursor: number
  profile: PlayerProfile
  phase: Phase
  year: number
  age: number
  turn: number
  actionsLeft: number
  studentYear: number
  examStage: 0 | 1 | 2
  examAttempts: number
  licensed: boolean
  stats: NumberMap<StatKey>
  personality: NumberMap<PersonalityKey>
  energy: number
  stress: number
  burnout: number
  health: number
  family: number
  reputation: number
  economy: EconomyState
  career: CareerState
  familyLife: FamilyState
  npcs: Record<string, NPCState>
  flags: Record<string, boolean | number | string>
  eventHistory: Record<string, number>
  choiceHistory: string[]
  timeline: TimelineEntry[]
  achievements: string[]
  pendingEventId: string | null
  pendingResult: PendingEventResult | null
  ending: EndingResult | null
  statsLifetime: {
    burnoutEpisodes: number
    examFailures: number
    promotions: number
    prescriptionsCaught: number
    complaints: number
    yearsWorked: number
  }
}

export interface NewGameOptions extends PlayerProfile {
  seed: string
}
