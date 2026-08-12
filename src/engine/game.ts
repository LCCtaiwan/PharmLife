import { ACHIEVEMENTS, createEnding, evaluateAchievements } from '../data/achievements'
import { ACTIONS } from '../data/actions'
import { CAREERS, CAREER_LIST } from '../data/careers'
import { EVENT_BY_ID, EVENTS } from '../data/events'
import { NPCS } from '../data/npcs'
import { pickWeighted, randomAt, randomInt, SEED_VERSION, normalizeSeed } from './rng'
import { applyEffects, careerPerformance, clamp, initialNPCs, matchesCondition } from './rules'
import type { CareerId, EffectSet, EventChoice, GameEvent, GameState, NewGameOptions, StatKey, TimelineEntry } from './types'

const originStats: Record<NewGameOptions['origin'], Partial<Record<StatKey, number>>> = {
  steady: { dispensing: 5, regulation: 4, efficiency: 2 },
  scholar: { knowledge: 6, research: 5 },
  people: { communication: 7, management: 3 },
  hustler: { business: 7, efficiency: 3, communication: 2 },
}

const difficultyModifier = { story: 5, standard: 0, hard: -4 }

function timeline(age: number, year: number, title: string, detail: string, tone: TimelineEntry['tone'] = 'neutral'): TimelineEntry {
  return { age, year, title, detail, tone }
}

export function createNewGame(options: NewGameOptions): GameState {
  const seed = normalizeSeed(options.seed)
  const modifier = difficultyModifier[options.difficulty]
  const stats = Object.fromEntries(['knowledge', 'dispensing', 'communication', 'efficiency', 'regulation', 'research', 'management', 'business'].map((key, index) => {
    const statKey = key as StatKey
    const variance = randomInt(seed, index, -3, 3)
    return [statKey, clamp(38 + modifier + variance + (originStats[options.origin][statKey] ?? 0), 25, 60)]
  })) as GameState['stats']

  return {
    saveVersion: 2,
    seedVersion: SEED_VERSION,
    seed,
    rngCursor: 8,
    profile: { name: options.name.trim() || '無名藥師', pronoun: options.pronoun, origin: options.origin, difficulty: options.difficulty },
    phase: 'student', year: 2026, age: 18, turn: 1, actionsLeft: 4, studentYear: 1, examStage: 0, examAttempts: 0, licensed: false,
    stats,
    personality: { ambition: 0, idealism: 0, risk: 0, empathy: 0, worklife: 0 },
    energy: 82, stress: 18, burnout: 0, health: 90, family: 65, reputation: 10,
    economy: { cash: 8, assets: 0, debt: options.origin === 'scholar' ? 8 : 0, annualIncome: 0, annualExpense: 8, homes: 0, businesses: 0 },
    career: { trackId: null, roleIndex: 0, yearsInRole: 0, yearsInTrack: 0, performance: 0, changes: 0, unemployed: false, founder: false, businessHealth: 0, offers: [] },
    familyLife: { status: 'single', partnerName: null, children: 0, parentCare: false },
    npcs: initialNPCs(), flags: {}, eventHistory: {}, choiceHistory: [],
    timeline: [timeline(18, 2026, '進入藥學系', '你穿上第一件白袍，但人生還沒有標準答案。', 'milestone')],
    achievements: [], pendingEventId: null, pendingResult: null, ending: null,
    statsLifetime: { burnoutEpisodes: 0, examFailures: 0, promotions: 0, prescriptionsCaught: 0, complaints: 0, yearsWorked: 0 },
  }
}

function withCursor(state: GameState, amount = 1): GameState {
  return { ...state, rngCursor: state.rngCursor + amount }
}

function eligibleEvents(state: GameState): GameEvent[] {
  return EVENTS.filter((event) => {
    if (!matchesCondition(state, event.conditions)) return false
    const last = state.eventHistory[event.id]
    if (event.once && last != null) return false
    if (last != null && event.cooldown && state.turn - last < event.cooldown) return false
    return true
  })
}

export function drawEvent(state: GameState): GameState {
  const eligible = eligibleEvents(state)
  const weighted = eligible.map((event) => {
    let weight = event.weight
    if (event.category === 'relationship' && state.personality.empathy > 25) weight *= 1.25
    if (event.category === 'startup' && state.personality.risk > 25) weight *= 1.2
    if (event.category === 'health' && state.burnout > 65) weight *= 1.6
    return weight
  })
  const selected = pickWeighted(eligible, weighted, randomAt(state.seed, state.rngCursor)) ?? EVENT_BY_ID['quiet-year']
  return { ...state, rngCursor: state.rngCursor + 1, pendingEventId: selected.id, pendingResult: null }
}

function applyDiminishingGrowth(state: GameState, effects: EffectSet): EffectSet {
  if (!effects.stats) return effects
  const stats = { ...effects.stats }
  for (const [key, amount] of Object.entries(stats) as [StatKey, number][]) {
    if (amount <= 0) continue
    const value = state.stats[key]
    stats[key] = value >= 80 ? Math.max(1, Math.ceil(amount * .35)) : value >= 70 ? Math.max(1, Math.ceil(amount * .55)) : value >= 60 ? Math.max(1, Math.ceil(amount * .75)) : amount
  }
  return { ...effects, stats }
}

export function takeAction(state: GameState, actionId: string): GameState {
  if (state.pendingEventId || state.pendingResult || state.ending || state.actionsLeft <= 0) return state
  const action = ACTIONS.find((item) => item.id === actionId)
  if (!action || (action.careerOnly && state.phase !== 'career')) return state
  let next = applyEffects(state, applyDiminishingGrowth(state, action.effects))
  next = { ...next, actionsLeft: Math.max(0, state.actionsLeft - 1), choiceHistory: [...next.choiceHistory, `A:${state.turn}:${actionId}`] }
  if (next.actionsLeft === 0) next = drawEvent(next)
  return next
}

function checkScore(state: GameState, choice: EventChoice): { success: boolean; score: number; roll: number } {
  if (!choice.check) return { success: true, score: 100, roll: 0 }
  const totalWeight = Object.values(choice.check.stats).reduce((sum, weight) => sum + (weight ?? 0), 0) || 1
  const ability = Object.entries(choice.check.stats).reduce((sum, [key, weight]) => sum + state.stats[key as StatKey] * (weight ?? 0), 0) / totalWeight
  const personality = Object.entries(choice.check.personality ?? {}).reduce((sum, [key, weight]) => sum + state.personality[key as keyof GameState['personality']] * (weight ?? 0) * .12, 0)
  const npc = choice.check.npcId ? (state.npcs[choice.check.npcId]?.trust ?? 0) * .08 : 0
  const condition = (state.energy - state.stress - state.burnout) * .06
  const roll = randomInt(state.seed, state.rngCursor, -12, 12)
  const score = Math.round(ability + personality + npc + condition + roll)
  return { success: score >= choice.check.difficulty, score, roll }
}

function effectChanges(before: GameState, after: GameState): string[] {
  const changes: string[] = []
  const labels: [keyof Pick<GameState, 'energy' | 'stress' | 'burnout' | 'health' | 'family' | 'reputation'>, string][] = [
    ['energy', '體力'], ['stress', '壓力'], ['burnout', 'Burnout'], ['health', '健康'], ['family', '家庭'], ['reputation', '聲望'],
  ]
  for (const [key, label] of labels) {
    const delta = after[key] - before[key]
    if (delta) changes.push(`${label} ${delta > 0 ? '+' : ''}${delta}`)
  }
  const cashDelta = Math.round(after.economy.cash - before.economy.cash)
  if (cashDelta) changes.push(`現金 ${cashDelta > 0 ? '+' : ''}${cashDelta} 萬`)
  const changedStats = Object.entries(after.stats).filter(([key, value]) => value !== before.stats[key as StatKey]).slice(0, 2)
  for (const [key, value] of changedStats) changes.push(`${key} +${value - before.stats[key as StatKey]}`)
  return changes.slice(0, 5)
}

function randomOffer(state: GameState): { state: GameState; offer: CareerId | null } {
  const current = state.career.trackId
  const options = CAREER_LIST.filter((career) => career.id !== current)
  if (!options.length) return { state, offer: null }
  const offer = options[randomInt(state.seed, state.rngCursor, 0, options.length - 1)]?.id ?? null
  if (!offer) return { state: withCursor(state), offer: null }
  return { state: { ...state, rngCursor: state.rngCursor + 1, career: { ...state.career, offers: [...new Set([...state.career.offers, offer])] } }, offer }
}

export function resolveEventChoice(state: GameState, choiceId: string): GameState {
  if (!state.pendingEventId || state.pendingResult) return state
  const event = EVENT_BY_ID[state.pendingEventId]
  const choice = event?.choices.find((item) => item.id === choiceId)
  if (!event || !choice) return state
  const before = state
  const check = checkScore(state, choice)
  let effects = choice.effects
  let outcomeText = '你的選擇把人生往前推了一點。'
  let success: boolean | null = null
  let next = state
  if (choice.check) {
    success = check.success
    const outcome = check.success ? choice.success : choice.failure
    effects = outcome?.effects
    outcomeText = outcome?.text ?? outcomeText
    next = withCursor(next)
  }
  next = applyEffects(next, effects)
  if (event.id === 'open-offer' && choice.id === 'talk') {
    const result = randomOffer(next)
    next = result.state
    if (result.offer) outcomeText = `${CAREERS[result.offer].name} 向你提出了進一步邀請。`
  }
  if (effects?.flags?.quit_for_health) next = { ...next, career: { ...next.career, unemployed: true, offers: [] } }
  const eventHistory = { ...next.eventHistory, [event.id]: next.turn }
  const tone = success === false ? 'bad' : event.category === 'world' ? 'neutral' : 'good'
  const shouldLog = event.once || ['career', 'family', 'startup', 'health'].includes(event.category)
  next = {
    ...next,
    eventHistory,
    choiceHistory: [...next.choiceHistory, `E:${event.id}:${choice.id}:${success ?? 'n'}`],
    timeline: shouldLog ? [...next.timeline, timeline(next.age, next.year, event.title, choice.text, tone)] : next.timeline,
    pendingResult: { eventId: event.id, choiceText: choice.text, outcomeText, success, changes: effectChanges(before, next) },
  }
  if (effects?.flags?.caught_rx) next.statsLifetime = { ...next.statsLifetime, prescriptionsCaught: next.statsLifetime.prescriptionsCaught + 1 }
  if (event.id === 'unexpected-complaint') next.statsLifetime = { ...next.statsLifetime, complaints: next.statsLifetime.complaints + 1 }
  return { ...next, achievements: evaluateAchievements(next) }
}

function meetsPromotion(state: GameState): boolean {
  if (!state.career.trackId) return false
  const track = CAREERS[state.career.trackId]
  const role = track.roles[state.career.roleIndex]
  const nextRole = track.roles[state.career.roleIndex + 1]
  if (!nextRole || state.career.yearsInRole + 1 < role.promotionAfter) return false
  return Object.entries(nextRole.requirements).every(([key, value]) => state.stats[key as StatKey] >= (value ?? 0))
}

function advanceWorldNPCs(state: GameState): GameState {
  if (state.turn % 5 !== 0) return state
  const npcs = { ...state.npcs }
  for (const npcDef of NPCS) {
    const npc = npcs[npcDef.id]
    if (!npc?.met) continue
    npcs[npcDef.id] = { ...npc, worldStage: Math.min(4, npc.worldStage + 1), active: state.age + npcDef.ageOffset < 70 }
  }
  return { ...state, npcs }
}

export function endYear(state: GameState): GameState {
  if (state.pendingEventId && !state.pendingResult) return state
  let next: GameState = { ...state, pendingEventId: null, pendingResult: null }
  const age = state.age + 1
  const year = state.year + 1
  const burnoutBefore = state.burnout

  if (state.phase === 'student') {
    const nextStudentYear = state.studentYear + 1
    next = {
      ...next, age, year, turn: state.turn + 1, actionsLeft: 4, studentYear: nextStudentYear,
      energy: clamp(state.energy + 12), stress: clamp(state.stress - 8), burnout: clamp(state.burnout - 5),
      economy: { ...state.economy, cash: Math.max(0, state.economy.cash - state.economy.annualExpense) },
    }
    if (nextStudentYear > 6) {
      next.phase = 'exam'
      next.studentYear = 6
      next.examStage = 1
      next.actionsLeft = 0
      next.timeline = [...next.timeline, timeline(age, year, '藥學系畢業', '真正的門檻，現在才來。', 'milestone')]
    }
  } else if (state.phase === 'career') {
    const track = state.career.trackId ? CAREERS[state.career.trackId] : null
    const role = track?.roles[state.career.roleIndex]
    const performance = careerPerformance(state)
    const income = state.career.unemployed ? 0 : (role?.salary ?? 0) + (state.career.founder ? 18 + state.economy.businesses * 12 : 0)
    const expense = state.economy.annualExpense + 18 + state.familyLife.children * 8
    const interest = state.economy.debt * .025
    const assetReturn = state.economy.assets * (randomAt(state.seed, state.rngCursor) * .12 - .025)
    const promoted = meetsPromotion({ ...state, career: { ...state.career, performance } }) && performance >= 60 && randomAt(state.seed, state.rngCursor + 1) > .28
    const roleIndex = promoted && track ? Math.min(track.roles.length - 1, state.career.roleIndex + 1) : state.career.roleIndex
    const burnout = clamp(state.burnout + (role?.pressure ?? 40) * .08 + Math.max(0, state.stress - 55) * .08 - 5)
    next = {
      ...next,
      age, year, turn: state.turn + 1, actionsLeft: 4, rngCursor: state.rngCursor + 2,
      energy: clamp(state.energy + 10 - (role?.pressure ?? 40) * .08),
      stress: clamp(state.stress - 7 + (role?.pressure ?? 40) * .04),
      burnout,
      health: clamp(state.health - Math.max(0, burnout - 70) * .05 + (state.personality.worklife > 20 ? 1 : 0)),
      family: clamp(state.family + (state.personality.worklife > 20 ? 2 : -1)),
      economy: { ...state.economy, annualIncome: income, cash: Math.max(0, state.economy.cash + income - expense - interest), assets: Math.max(0, state.economy.assets + assetReturn) },
      career: {
        ...state.career, roleIndex, performance, yearsInRole: promoted ? 0 : state.career.yearsInRole + 1,
        yearsInTrack: state.career.yearsInTrack + 1, offers: [], unemployed: false,
      },
      statsLifetime: { ...state.statsLifetime, promotions: state.statsLifetime.promotions + (promoted ? 1 : 0), yearsWorked: state.statsLifetime.yearsWorked + (state.career.unemployed ? 0 : 1) },
    }
    if (promoted && track) next.timeline = [...next.timeline, timeline(age, year, `升任${track.roles[roleIndex].title}`, `年度績效 ${performance}，新的位置也帶來新的代價。`, 'milestone')]
    if (burnoutBefore < 85 && burnout >= 85) {
      next.statsLifetime = { ...next.statsLifetime, burnoutEpisodes: next.statsLifetime.burnoutEpisodes + 1 }
      next.timeline = [...next.timeline, timeline(age, year, 'Burnout', '你第一次承認，靠意志力已經不夠。', 'bad')]
    }
    if (state.turn % 3 === 0 && randomAt(state.seed, state.rngCursor + 2) > .55) {
      next.rngCursor += 1
      next = randomOffer(next).state
    }
  }

  next = advanceWorldNPCs(next)
  next.achievements = evaluateAchievements(next)
  if (next.age >= 65 || next.health <= 8) return retire(next, next.health <= 8 ? '健康迫使你提早離開工作。' : '你決定為這段職涯畫下句點。')
  return next
}

export function attemptExam(state: GameState): GameState {
  if (state.phase !== 'exam' || (state.examStage !== 1 && state.examStage !== 2)) return state
  const stage = state.examStage
  const roll = randomInt(state.seed, state.rngCursor, -14, 14)
  const preparation = state.stats.knowledge * .55 + state.stats.research * .15 + state.stats.regulation * .12 + state.energy * .08 - state.stress * .06 + roll
  const threshold = stage === 1 ? 43 : 47
  const passed = preparation >= threshold
  let next = { ...state, rngCursor: state.rngCursor + 1, examAttempts: state.examAttempts + 1, choiceHistory: [...state.choiceHistory, `EXAM:${stage}:${passed}`] } as GameState
  if (!passed) {
    next = applyEffects(next, { stats: { knowledge: 3, regulation: 1 }, status: { stress: 12, energy: -8 }, flags: { [`exam_${stage}_failed`]: true } })
    next = { ...next, age: state.age + 1, year: state.year + 1, turn: state.turn + 1, statsLifetime: { ...next.statsLifetime, examFailures: next.statsLifetime.examFailures + 1 }, timeline: [...next.timeline, timeline(state.age, state.year, `國考第 ${stage} 階段未通過`, '落榜不是句點。半年後，你帶著錯題再來一次。', 'bad')] }
    return next
  }
  next.timeline = [...next.timeline, timeline(state.age, state.year, `通過國考第 ${stage} 階段`, stage === 1 ? '第一道門打開了。' : '你正式取得藥師資格。', 'milestone')]
  if (stage === 1) return { ...next, examStage: 2, stress: clamp(next.stress + 4), energy: clamp(next.energy - 5) }
  return {
    ...next, examStage: 2, licensed: true, phase: 'career', actionsLeft: 0, achievements: evaluateAchievements({ ...next, licensed: true }),
    career: { ...next.career, offers: CAREER_LIST.map((career) => career.id) },
  }
}

export function startCareer(state: GameState, careerId: CareerId): GameState {
  if (state.phase !== 'career' || !state.licensed || (!state.career.offers.includes(careerId) && state.career.trackId !== careerId)) return state
  const previous = state.career.trackId
  let next = applyEffects(state, { startCareer: careerId })
  next = {
    ...next, actionsLeft: 4,
    timeline: [...next.timeline, timeline(state.age, state.year, previous ? `轉職${CAREERS[careerId].name}` : `進入${CAREERS[careerId].name}`, CAREERS[careerId].description, 'milestone')],
    pendingEventId: null, pendingResult: null,
  }
  return next
}

export function retire(state: GameState, reason = '你決定現在就是合適的時候。'): GameState {
  const ending = createEnding(state)
  return {
    ...state, phase: 'ending', actionsLeft: 0, pendingEventId: null, pendingResult: null, ending,
    achievements: evaluateAchievements(state),
    timeline: [...state.timeline, timeline(state.age, state.year, '正式退休', reason, 'milestone')],
  }
}

export function canRetire(state: GameState): boolean {
  return state.phase === 'career' && state.age >= 50
}

export function currentEvent(state: GameState): GameEvent | null {
  return state.pendingEventId ? EVENT_BY_ID[state.pendingEventId] ?? null : null
}

export function achievementDetails(ids: string[]) {
  return ids.map((id) => ACHIEVEMENTS.find((item) => item.id === id)).filter(Boolean)
}
