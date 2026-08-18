import { careerRandomAt, normalizeCareerSeed } from './rng'
import { V06_ASSIGNMENTS, V06_LIFE_EPISODES, V06_PEOPLE, V06_PREFERENCES, V06_WORK_EPISODES } from './hospital-v06'
import { ASSIGNMENT_IDS, CORE_COMPETENCY_KEYS, type AssignmentId, type CoreCompetencies, type HospitalV06State, type NewHospitalV06Options, type RomanceState, type V06CheckResult, type V06Effects, type V06Episode, type V06EpisodeChoice, type V06Preference, type V06SimulationResult, type V06YearDraft } from './v06-types'

export const HOSPITAL_V06_RNG_VERSION = 'PL06-MULBERRY32-1'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const roundOne = (value: number) => Math.round(value * 10) / 10

const DEFAULT_COMPETENCIES: CoreCompetencies = {
  dispensing_verification: 43,
  prescription_judgment: 39,
  drug_knowledge: 45,
  communication: 42,
  situational_response: 36,
  medication_safety: 44,
}

const DEFAULT_ROMANCE: RomanceState = {
  stage: 'single', closeness: 0, commitment: 0, conflict: 0, sharedDecisions: [], flags: [],
}

const qualificationLabel = (assignmentId: AssignmentId, level: 'supervised' | 'independent') => `${assignmentId}_${level}`

export function proficiencyLevel(experience: number): number {
  if (experience >= 14) return 4
  if (experience >= 9) return 3
  if (experience >= 5) return 2
  if (experience >= 2) return 1
  return 0
}

export function proficiencyLabel(experience: number): string {
  return ['見習', '受監督執行', '可獨立作業', '資深', '可帶教'][proficiencyLevel(experience)]
}

function emptyYearDraft(assignmentId: AssignmentId, experience: Record<AssignmentId, number>): V06YearDraft {
  return {
    assignmentId,
    proficiencyBefore: experience[assignmentId],
    episodeIds: [],
    episodeResults: [],
    competencyChanges: {},
    relationshipNotes: [],
    qualificationsEarned: [],
  }
}

function hasEpisodeConditions(state: HospitalV06State, episode: V06Episode): boolean {
  if (episode.assignmentIds && !episode.assignmentIds.includes(state.assignmentId)) return false
  if (episode.careerYears && !episode.careerYears.includes(state.careerYear)) return false
  if (episode.romancePreference && episode.romancePreference !== state.relationshipPreference) return false
  if (episode.requiredFlags?.some((flag) => !state.flags.includes(flag))) return false
  if (episode.excludedFlags?.some((flag) => state.flags.includes(flag))) return false
  if (!episode.repeatable && state.completedEpisodeIds.includes(episode.id)) return false
  return true
}

function chooseBySeed<T>(state: HospitalV06State, items: T[], count: number): { selected: T[]; cursor: number } {
  const pool = [...items]
  const selected: T[] = []
  let cursor = state.rngCursor
  while (selected.length < count && pool.length) {
    const index = Math.floor(careerRandomAt(state.seed, cursor++) * pool.length)
    selected.push(pool.splice(index, 1)[0])
  }
  return { selected, cursor }
}

function drawWorkEpisodes(state: HospitalV06State): { ids: string[]; cursor: number } {
  let eligible = V06_WORK_EPISODES.filter((episode) => hasEpisodeConditions(state, episode))
  const yearSpecific = eligible.filter((episode) => episode.careerYears?.includes(state.careerYear))
  const chosen: V06Episode[] = []
  if (yearSpecific.length) chosen.push(yearSpecific[0])
  eligible = eligible.filter((episode) => !chosen.includes(episode))
  let cursor = state.rngCursor
  const randomSelection = chooseBySeed({ ...state, rngCursor: cursor }, eligible, 2 - chosen.length)
  chosen.push(...randomSelection.selected)
  cursor = randomSelection.cursor
  if (chosen.length < 2) {
    const fallback = V06_WORK_EPISODES.filter((episode) => episode.assignmentIds?.includes(state.assignmentId) && !chosen.includes(episode))
    const fallbackSelection = chooseBySeed({ ...state, rngCursor: cursor }, fallback, 2 - chosen.length)
    chosen.push(...fallbackSelection.selected)
    cursor = fallbackSelection.cursor
  }
  return { ids: chosen.map((episode) => episode.id), cursor }
}

function prepareYear(state: HospitalV06State): HospitalV06State {
  const assignmentId = state.nextAssignmentId ?? state.assignmentId
  const base = { ...state, assignmentId, nextAssignmentId: undefined, episodeIndex: 0, pendingEpisodeId: undefined, pendingOutcome: undefined, availablePreferenceIds: [], stage: 'assignment' as const }
  const drawn = drawWorkEpisodes(base)
  return {
    ...base,
    rngCursor: drawn.cursor,
    episodeQueue: drawn.ids,
    yearDraft: emptyYearDraft(assignmentId, state.assignmentExperience),
    timeline: [...state.timeline, {
      age: state.age, year: state.year, type: 'assignment',
      title: V06_ASSIGNMENTS[assignmentId].name,
      detail: V06_ASSIGNMENTS[assignmentId].roster,
    }],
  }
}

export function createHospitalV06Game(options: NewHospitalV06Options = {}): HospitalV06State {
  const seed = normalizeCareerSeed(options.seed ?? 'PHARMLIFE06')
  const assignmentExperience = Object.fromEntries(ASSIGNMENT_IDS.map((id) => [id, 0])) as Record<AssignmentId, number>
  const initial: HospitalV06State = {
    schemaVersion: 'hospital-v0.6', rngVersion: HOSPITAL_V06_RNG_VERSION, seed, rngCursor: 0,
    age: 25, year: 2026, careerYear: 1, stage: 'assignment', assignmentId: 'outpatient',
    competencies: { ...DEFAULT_COMPETENCIES }, assignmentExperience,
    qualifications: ['pgy_enrolled'], trainingProgress: { pgy: 0 },
    condition: { fatigue: 22, stress: 28, health: 88, burnoutRisk: 8, workload: 55 },
    colleagues: {
      senior_lin: { professionalTrust: 0, personalCloseness: 0, friction: 0, sharedHistory: [], currentRole: '門診帶教藥師' },
      peer_huang: { professionalTrust: 0, personalCloseness: 2, friction: 0, sharedHistory: [], currentRole: '同期藥師' },
      leader_wu: { professionalTrust: 0, personalCloseness: 0, friction: 0, sharedHistory: [], currentRole: '住院藥局組長' },
    },
    relationshipPreference: options.relationshipPreference ?? 'open',
    romanceStates: { zhou_yian: { ...DEFAULT_ROMANCE } }, flags: [],
    episodeQueue: [], episodeIndex: 0, completedEpisodeIds: [], availablePreferenceIds: [],
    yearDraft: emptyYearDraft('outpatient', assignmentExperience),
    annualIncome: 79.8, money: 20, reports: [], timeline: [], debug: Boolean(options.debug),
  }
  return prepareYear(initial)
}

export function startV06Assignment(state: HospitalV06State): HospitalV06State {
  if (state.stage !== 'assignment' || !state.episodeQueue.length) return state
  return { ...state, stage: 'episode', pendingEpisodeId: state.episodeQueue[0] }
}

export function v06EpisodeById(id?: string): V06Episode | undefined {
  return [...V06_WORK_EPISODES, ...V06_LIFE_EPISODES].find((episode) => episode.id === id)
}

function addUnique(values: string[], additions: string[] = []): string[] {
  return [...new Set([...values, ...additions])]
}

function applyEffects(state: HospitalV06State, effects: V06Effects = {}): { state: HospitalV06State; notes: string[] } {
  const competencies = { ...state.competencies }
  const competencyChanges = { ...state.yearDraft.competencyChanges }
  for (const key of CORE_COMPETENCY_KEYS) {
    const delta = effects.competencies?.[key] ?? 0
    if (!delta) continue
    competencies[key] = clamp(competencies[key] + delta, 20, 90)
    competencyChanges[key] = (competencyChanges[key] ?? 0) + delta
  }

  const colleagues = { ...state.colleagues }
  const notes: string[] = []
  for (const [id, change] of Object.entries(effects.relationships ?? {})) {
    const before = colleagues[id]
    if (!before) continue
    colleagues[id] = {
      ...before,
      professionalTrust: clamp(before.professionalTrust + (change.professionalTrust ?? 0), -100, 100),
      personalCloseness: clamp(before.personalCloseness + (change.personalCloseness ?? 0), -100, 100),
      friction: clamp(before.friction + (change.friction ?? 0)),
      sharedHistory: addUnique(before.sharedHistory, change.sharedHistory),
    }
    const person = V06_PEOPLE[id as keyof typeof V06_PEOPLE]
    if (person) notes.push(`${person.name}記住了你們如何處理這件事。`)
  }

  const romanceStates = { ...state.romanceStates }
  let flags = addUnique(state.flags, effects.flags)
  if (effects.romance) {
    const before = romanceStates.zhou_yian ?? DEFAULT_ROMANCE
    const stage = effects.romance.stage ?? before.stage
    romanceStates.zhou_yian = {
      stage,
      closeness: clamp(before.closeness + (effects.romance.closeness ?? 0), -100, 100),
      commitment: clamp(before.commitment + (effects.romance.commitment ?? 0), -100, 100),
      conflict: clamp(before.conflict + (effects.romance.conflict ?? 0)),
      sharedDecisions: addUnique(before.sharedDecisions, effects.romance.sharedDecisions),
      flags: addUnique(before.flags, effects.romance.flags),
    }
    flags = addUnique(flags, [`romance_${stage}`])
    notes.push(`你與周以安的關係進入「${romanceStageLabel(stage)}」。`)
  }

  const assignmentExperience = { ...state.assignmentExperience }
  assignmentExperience[state.assignmentId] += effects.assignmentExperience ?? 0
  return {
    state: {
      ...state, competencies, colleagues, romanceStates, assignmentExperience, flags,
      money: roundOne(Math.max(0, state.money + (effects.money ?? 0))),
      condition: {
        fatigue: clamp(state.condition.fatigue + (effects.fatigue ?? 0)),
        stress: clamp(state.condition.stress + (effects.stress ?? 0)),
        health: clamp(state.condition.health + (effects.health ?? 0)),
        burnoutRisk: clamp(state.condition.burnoutRisk + (effects.burnoutRisk ?? 0)),
        workload: state.condition.workload,
      },
      yearDraft: { ...state.yearDraft, competencyChanges },
    },
    notes,
  }
}

function mergeApplied(state: HospitalV06State, ...effects: Array<V06Effects | undefined>): { state: HospitalV06State; notes: string[] } {
  let next = state
  const notes: string[] = []
  for (const effect of effects) {
    const applied = applyEffects(next, effect)
    next = applied.state
    notes.push(...applied.notes)
  }
  return { state: next, notes: [...new Set(notes)] }
}

function runCheck(state: HospitalV06State, choice: V06EpisodeChoice): { result?: V06CheckResult; cursor: number } {
  if (!choice.check) return { cursor: state.rngCursor }
  const competency = state.competencies[choice.check.competency]
  const proficiency = proficiencyLevel(state.assignmentExperience[state.assignmentId])
  const supportTrust = choice.check.supportColleagueId ? state.colleagues[choice.check.supportColleagueId]?.professionalTrust ?? 0 : 0
  const support = Math.max(0, Math.min(8, Math.floor(supportTrust / 10)))
  const fatiguePenalty = Math.floor(state.condition.fatigue / 8)
  const workloadPenalty = Math.max(0, Math.floor((state.condition.workload - 50) / 10))
  const random = Math.floor(careerRandomAt(state.seed, state.rngCursor) * 17) - 8
  const score = competency + proficiency * 7 + support + random - fatiguePenalty - workloadPenalty
  return {
    cursor: state.rngCursor + 1,
    result: {
      passed: score >= choice.check.difficulty,
      score,
      difficulty: choice.check.difficulty,
      factors: [
        `基礎能力 ${competency}`,
        `單位熟練 ${proficiencyLabel(state.assignmentExperience[state.assignmentId])}`,
        support ? `同事支援 +${support}` : '本次沒有額外支援',
        fatiguePenalty ? `疲勞影響 -${fatiguePenalty}` : '疲勞未造成明顯影響',
        `情境變數 ${random >= 0 ? '+' : ''}${random}`,
      ],
    },
  }
}

function refreshQualifications(state: HospitalV06State): HospitalV06State {
  const experience = state.assignmentExperience[state.assignmentId]
  const earned: string[] = []
  if (experience >= 2) earned.push(qualificationLabel(state.assignmentId, 'supervised'))
  if (experience >= 5) earned.push(qualificationLabel(state.assignmentId, 'independent'))
  const newQualifications = earned.filter((id) => !state.qualifications.includes(id))
  return {
    ...state,
    qualifications: addUnique(state.qualifications, newQualifications),
    yearDraft: {
      ...state.yearDraft,
      qualificationsEarned: addUnique(state.yearDraft.qualificationsEarned, newQualifications),
    },
  }
}

export function chooseV06Episode(state: HospitalV06State, choiceId: string): HospitalV06State {
  if (!['episode', 'life'].includes(state.stage) || !state.pendingEpisodeId) return state
  const episode = v06EpisodeById(state.pendingEpisodeId)
  const choice = episode?.choices.find((candidate) => candidate.id === choiceId)
  if (!episode || !choice) throw new Error(`unknown v0.6 episode choice ${choiceId}`)
  const check = runCheck(state, choice)
  const passed = check.result?.passed ?? true
  const applied = mergeApplied(
    { ...state, rngCursor: check.cursor },
    choice.effects,
    passed ? choice.successEffects : choice.failureEffects,
  )
  const text = check.result ? (passed ? choice.successOutcome : choice.failureOutcome) : choice.outcome
  if (!text) throw new Error(`episode choice ${choiceId} has no outcome text`)
  let next = refreshQualifications(applied.state)
  const relationshipNotes = [...new Set([...next.yearDraft.relationshipNotes, ...applied.notes])]
  const episodeResults = [...next.yearDraft.episodeResults, { episodeId: episode.id, title: episode.title, choiceLabel: choice.label, outcome: text }]
  next = {
    ...next,
    stage: 'outcome',
    pendingOutcome: { kind: episode.kind, episodeId: episode.id, choiceId, title: choice.label, text, check: check.result, relationshipNotes: applied.notes },
    completedEpisodeIds: episode.repeatable ? next.completedEpisodeIds : addUnique(next.completedEpisodeIds, [episode.id]),
    yearDraft: {
      ...next.yearDraft,
      episodeIds: [...next.yearDraft.episodeIds, episode.id],
      episodeResults,
      relationshipNotes,
    },
    timeline: [...next.timeline, {
      age: next.age, year: next.year, type: episode.kind === 'work' ? 'work' : 'relationship',
      title: episode.title, detail: text,
    }],
  }
  return next
}

function eligibleLifeEpisode(state: HospitalV06State): V06Episode | undefined {
  return V06_LIFE_EPISODES.find((episode) => hasEpisodeConditions(state, episode))
}

function availablePreferences(state: HospitalV06State): V06Preference[] {
  return V06_PREFERENCES.filter((preference) => {
    if (preference.minCareerYear && state.careerYear < preference.minCareerYear) return false
    if (preference.requiredQualifications?.some((id) => !state.qualifications.includes(id))) return false
    return true
  })
}

export function continueAfterV06Outcome(state: HospitalV06State): HospitalV06State {
  if (state.stage !== 'outcome' || !state.pendingOutcome) return state
  if (state.pendingOutcome.kind === 'work') {
    const nextIndex = state.episodeIndex + 1
    if (nextIndex < state.episodeQueue.length) return {
      ...state, stage: 'episode', episodeIndex: nextIndex, pendingEpisodeId: state.episodeQueue[nextIndex], pendingOutcome: undefined,
    }
    const life = eligibleLifeEpisode(state)
    if (life) return { ...state, stage: 'life', pendingEpisodeId: life.id, pendingOutcome: undefined }
  }
  return {
    ...state,
    stage: 'preference', pendingEpisodeId: undefined, pendingOutcome: undefined,
    availablePreferenceIds: availablePreferences(state).map((preference) => preference.id),
  }
}

export function preferenceById(id: string): V06Preference | undefined {
  return V06_PREFERENCES.find((preference) => preference.id === id)
}

function requestedAssignment(preferenceId: string, current: AssignmentId): AssignmentId {
  if (preferenceId === 'request_outpatient_depth') return 'outpatient'
  if (preferenceId === 'request_inpatient_rotation') return 'inpatient'
  if (preferenceId === 'apply_emergency_training') return 'emergency'
  if (preferenceId === 'request_supply_rotation') return 'drug_supply'
  return current
}

function annualIncomeFor(assignmentId: AssignmentId, careerYear: number): number {
  const base = 5.2 + Math.min(careerYear - 1, 4) * .18
  const monthlyAllowance = assignmentId === 'emergency' ? .9 : assignmentId === 'inpatient' ? .2 : .15
  return roundOne((base + monthlyAllowance) * 14.5)
}

export function chooseV06Preference(state: HospitalV06State, preferenceId: string): HospitalV06State {
  if (state.stage !== 'preference' || !state.availablePreferenceIds.includes(preferenceId)) throw new Error(`unavailable v0.6 preference ${preferenceId}`)
  const preference = preferenceById(preferenceId)!
  let cursor = state.rngCursor
  const requested = requestedAssignment(preferenceId, state.assignmentId)
  const roll = careerRandomAt(state.seed, cursor++)
  const alwaysApproved = preferenceId === 'protect_recovery'
  const approved = alwaysApproved || roll < (preferenceId === 'apply_emergency_training' ? .72 : .82)
  const nextAssignmentId = approved ? requested : state.assignmentId
  let decision = approved
    ? `院方核准：下一年度安排${V06_ASSIGNMENTS[nextAssignmentId].name}。`
    : `院方未核准：因缺額與人力需求，下一年度暫留${V06_ASSIGNMENTS[state.assignmentId].name}。`
  let next = { ...state, rngCursor: cursor }
  if (preferenceId === 'protect_recovery') {
    const applied = applyEffects(next, { fatigue: -12, stress: -8, burnoutRisk: -5 })
    next = applied.state
    decision = `院方同意暫緩輪調並調整班別，下一年度留在${V06_ASSIGNMENTS[state.assignmentId].name}。`
  }
  if (preferenceId === 'apply_emergency_training' && approved) {
    next = { ...next, qualifications: addUnique(next.qualifications, ['emergency_observer']), yearDraft: { ...next.yearDraft, qualificationsEarned: addUnique(next.yearDraft.qualificationsEarned, ['emergency_observer']) } }
  }
  return finalizeV06Year({
    ...next,
    nextAssignmentId,
    yearDraft: { ...next.yearDraft, preferenceId, preferenceDecision: decision, nextAssignmentId },
  }, preference.label)
}

function finalizeV06Year(state: HospitalV06State, preferenceLabel: string): HospitalV06State {
  const conditionBefore = state.reports.length ? state.reports.at(-1)!.conditionAfter : { fatigue: 22, stress: 28, health: 88, burnoutRisk: 8, workload: 55 }
  const assignmentLoad = state.assignmentId === 'emergency' ? 9 : state.assignmentId === 'inpatient' ? 5 : 3
  const conditionAfter = {
    fatigue: clamp(state.condition.fatigue + assignmentLoad - 5),
    stress: clamp(state.condition.stress + Math.max(0, assignmentLoad - 3) - 3),
    health: clamp(state.condition.health - Math.max(0, state.condition.fatigue - 75) * .04),
    burnoutRisk: clamp(state.condition.burnoutRisk * .72 + Math.max(0, state.condition.stress - 45) * .18 + assignmentLoad),
    workload: state.assignmentId === 'emergency' ? 72 : state.assignmentId === 'inpatient' ? 64 : 58,
  }
  const annualIncome = annualIncomeFor(state.assignmentId, state.careerYear)
  const assetsBefore = state.money
  const assetsAfter = roundOne(Math.max(0, assetsBefore + annualIncome - 36))
  const pgyQualification = `pgy_year_${state.careerYear}_complete`
  const qualifications = addUnique(state.qualifications, [pgyQualification])
  const qualificationsEarned = addUnique(state.yearDraft.qualificationsEarned, [pgyQualification])
  const report = {
    age: state.age, year: state.year, careerYear: state.careerYear,
    assignmentId: state.assignmentId, assignmentName: V06_ASSIGNMENTS[state.assignmentId].name, roster: V06_ASSIGNMENTS[state.assignmentId].roster,
    episodeResults: state.yearDraft.episodeResults,
    competencyChanges: state.yearDraft.competencyChanges,
    proficiencyBefore: state.yearDraft.proficiencyBefore,
    proficiencyAfter: state.assignmentExperience[state.assignmentId],
    qualificationsEarned,
    preferenceLabel,
    preferenceDecision: state.yearDraft.preferenceDecision ?? '',
    nextAssignmentId: state.nextAssignmentId ?? state.assignmentId,
    annualIncome, assetsBefore, assetsAfter, conditionBefore, conditionAfter,
    relationshipNotes: state.yearDraft.relationshipNotes,
  }
  return {
    ...state,
    age: state.age + 1, year: state.year + 1, careerYear: state.careerYear + 1,
    stage: 'report', qualifications, trainingProgress: { ...state.trainingProgress, pgy: state.careerYear },
    condition: conditionAfter, annualIncome, money: assetsAfter,
    lastReport: report, reports: [...state.reports, report],
    timeline: [...state.timeline, { age: state.age, year: state.year, type: 'report', title: `${V06_ASSIGNMENTS[state.assignmentId].name}年度報告`, detail: state.yearDraft.preferenceDecision ?? '' }],
  }
}

export function continueAfterV06Report(state: HospitalV06State): HospitalV06State {
  if (state.stage !== 'report') return state
  if (state.careerYear > 5) return {
    ...state,
    stage: 'chapter',
    timeline: [...state.timeline, { age: state.age, year: state.year, type: 'chapter', title: '新人期小結', detail: '這不是退休，而是完整 Hospital Career 的第一個開發檢查點。' }],
  }
  return prepareYear(state)
}

export function romanceStageLabel(stage: RomanceState['stage']): string {
  return {
    single: '單身', acquaintance: '認識', friends: '朋友', dating: '交往中', partner: '穩定伴侶', separated: '已分開',
  }[stage]
}

function automaticChoice(episode: V06Episode, strategy: 'careful' | 'independent'): string {
  return strategy === 'careful' ? episode.choices[0].id : episode.choices.at(-1)!.id
}

export function fastForwardV06(initial: HospitalV06State, years = 5, strategy: 'careful' | 'independent' = 'careful'): HospitalV06State {
  let state = initial
  const targetReports = Math.min(5, state.reports.length + Math.max(0, Math.floor(years)))
  let guard = 0
  while (state.reports.length < targetReports && state.stage !== 'chapter' && guard++ < 200) {
    if (state.stage === 'assignment') state = startV06Assignment(state)
    else if (state.stage === 'episode' || state.stage === 'life') {
      const episode = v06EpisodeById(state.pendingEpisodeId)!
      state = chooseV06Episode(state, automaticChoice(episode, strategy))
    } else if (state.stage === 'outcome') state = continueAfterV06Outcome(state)
    else if (state.stage === 'preference') {
      const preferred = state.availablePreferenceIds.includes('request_inpatient_rotation') && state.assignmentId === 'outpatient'
        ? 'request_inpatient_rotation'
        : state.availablePreferenceIds.includes('apply_emergency_training')
          ? 'apply_emergency_training'
          : state.availablePreferenceIds[0]
      state = chooseV06Preference(state, preferred)
    } else if (state.stage === 'report') state = continueAfterV06Report(state)
  }
  if (state.stage === 'report' && state.reports.length >= 5) state = continueAfterV06Report(state)
  return state
}

export function simulateV06(runs = 100, seed = 'SIM06'): V06SimulationResult {
  const safeRuns = Math.max(1, Math.min(10_000, Math.floor(runs)))
  let assets = 0
  let stress = 0
  let qualified = 0
  let dating = 0
  for (let index = 0; index < safeRuns; index += 1) {
    const result = fastForwardV06(createHospitalV06Game({ seed: `${seed}-${index}`, relationshipPreference: index % 2 ? 'friends_only' : 'open' }), 5)
    assets += result.money
    stress += result.condition.stress
    if (result.qualifications.some((id) => id.endsWith('_independent'))) qualified += 1
    if (['dating', 'partner'].includes(result.romanceStates.zhou_yian.stage)) dating += 1
  }
  return {
    runs: safeRuns,
    averageAssets: Math.round(assets / safeRuns),
    averageStress: Math.round(stress / safeRuns),
    qualificationRate: roundOne(qualified / safeRuns),
    datingRate: roundOne(dating / safeRuns),
  }
}
