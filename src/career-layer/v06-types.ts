export const CORE_COMPETENCY_KEYS = [
  'dispensing_verification',
  'prescription_judgment',
  'drug_knowledge',
  'communication',
  'situational_response',
  'medication_safety',
] as const

export const ASSIGNMENT_IDS = ['outpatient', 'inpatient', 'emergency', 'drug_supply'] as const

export type CoreCompetencyKey = typeof CORE_COMPETENCY_KEYS[number]
export type CoreCompetencies = Record<CoreCompetencyKey, number>
export type AssignmentId = typeof ASSIGNMENT_IDS[number]
export type RomancePreference = 'open' | 'friends_only'
export type V06Stage = 'assignment' | 'episode' | 'life' | 'outcome' | 'preference' | 'report' | 'chapter'
export type EpisodeKind = 'work' | 'life'
export type RomanceStage = 'single' | 'acquaintance' | 'friends' | 'dating' | 'partner' | 'separated'

export interface HospitalAssignment {
  id: AssignmentId
  name: string
  roster: string
  description: string
}

export interface V06ColleagueState {
  professionalTrust: number
  personalCloseness: number
  friction: number
  sharedHistory: string[]
  currentRole: string
}

export interface RomanceState {
  stage: RomanceStage
  closeness: number
  commitment: number
  conflict: number
  sharedDecisions: string[]
  flags: string[]
}

export interface V06ConditionState {
  fatigue: number
  stress: number
  health: number
  burnoutRisk: number
  workload: number
}

export interface V06Effects {
  competencies?: Partial<Record<CoreCompetencyKey, number>>
  fatigue?: number
  stress?: number
  health?: number
  burnoutRisk?: number
  assignmentExperience?: number
  money?: number
  flags?: string[]
  relationships?: Record<string, Partial<Omit<V06ColleagueState, 'sharedHistory' | 'currentRole'>> & { sharedHistory?: string[] }>
  romance?: Partial<Omit<RomanceState, 'stage' | 'sharedDecisions' | 'flags'>> & {
    stage?: RomanceStage
    sharedDecisions?: string[]
    flags?: string[]
  }
}

export interface V06Check {
  competency: CoreCompetencyKey
  difficulty: number
  supportColleagueId?: string
}

export interface V06EpisodeChoice {
  id: string
  label: string
  check?: V06Check
  outcome?: string
  successOutcome?: string
  failureOutcome?: string
  effects?: V06Effects
  successEffects?: V06Effects
  failureEffects?: V06Effects
}

export interface V06Episode {
  id: string
  kind: EpisodeKind
  assignmentIds?: AssignmentId[]
  careerYears?: number[]
  title: string
  scene: string
  speakerId?: string
  choices: V06EpisodeChoice[]
  requiredFlags?: string[]
  excludedFlags?: string[]
  romancePreference?: RomancePreference
  repeatable?: boolean
}

export interface V06Preference {
  id: string
  label: string
  minCareerYear?: number
  requiredQualifications?: string[]
}

export interface V06CheckResult {
  passed: boolean
  score: number
  difficulty: number
  factors: string[]
}

export interface V06Outcome {
  kind: EpisodeKind
  episodeId: string
  choiceId: string
  title: string
  text: string
  check?: V06CheckResult
  relationshipNotes: string[]
}

export interface V06YearDraft {
  assignmentId: AssignmentId
  proficiencyBefore: number
  episodeIds: string[]
  episodeResults: Array<{ episodeId: string; title: string; choiceLabel: string; outcome: string }>
  competencyChanges: Partial<Record<CoreCompetencyKey, number>>
  relationshipNotes: string[]
  qualificationsEarned: string[]
  preferenceId?: string
  preferenceDecision?: string
  nextAssignmentId?: AssignmentId
}

export interface V06AnnualReport {
  age: number
  year: number
  careerYear: number
  assignmentId: AssignmentId
  assignmentName: string
  roster: string
  episodeResults: V06YearDraft['episodeResults']
  competencyChanges: V06YearDraft['competencyChanges']
  proficiencyBefore: number
  proficiencyAfter: number
  qualificationsEarned: string[]
  preferenceLabel: string
  preferenceDecision: string
  nextAssignmentId: AssignmentId
  annualIncome: number
  assetsBefore: number
  assetsAfter: number
  conditionBefore: V06ConditionState
  conditionAfter: V06ConditionState
  relationshipNotes: string[]
}

export interface V06TimelineEntry {
  age: number
  year: number
  type: 'assignment' | 'work' | 'relationship' | 'training' | 'report' | 'chapter'
  title: string
  detail: string
}

export interface HospitalV06State {
  schemaVersion: 'hospital-v0.6'
  rngVersion: string
  seed: string
  rngCursor: number
  age: number
  year: number
  careerYear: number
  stage: V06Stage
  assignmentId: AssignmentId
  nextAssignmentId?: AssignmentId
  competencies: CoreCompetencies
  assignmentExperience: Record<AssignmentId, number>
  qualifications: string[]
  trainingProgress: Record<string, number>
  condition: V06ConditionState
  colleagues: Record<string, V06ColleagueState>
  relationshipPreference: RomancePreference
  romanceStates: Record<string, RomanceState>
  flags: string[]
  episodeQueue: string[]
  episodeIndex: number
  completedEpisodeIds: string[]
  pendingEpisodeId?: string
  pendingOutcome?: V06Outcome
  availablePreferenceIds: string[]
  yearDraft: V06YearDraft
  annualIncome: number
  money: number
  reports: V06AnnualReport[]
  timeline: V06TimelineEntry[]
  lastReport?: V06AnnualReport
  debug: boolean
}

export interface NewHospitalV06Options {
  seed?: string
  relationshipPreference?: RomancePreference
  debug?: boolean
}

export interface V06SimulationResult {
  runs: number
  averageAssets: number
  averageStress: number
  qualificationRate: number
  datingRate: number
}
