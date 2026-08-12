import type { AchievementDefinition, EndingResult, GameState } from '../engine/types'

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'licensed', name: '白袍之後', description: '通過兩階段國考，取得藥師資格。' },
  { id: 'perfect_exam', name: '一次就好', description: '兩階段國考都一次通過。' },
  { id: 'survivor', name: '過勞生還者', description: '從一次嚴重 Burnout 中恢復。' },
  { id: 'founder', name: '把鐵門拉起來', description: '創立自己的藥局。' },
  { id: 'second_store', name: '不只一間', description: '成功開出第二間店。' },
  { id: 'home', name: '一把自己的鑰匙', description: '買下第一間房。' },
  { id: 'family', name: '回家有人等', description: '建立家庭並維持良好關係。' },
  { id: 'mentor', name: '有人沿著你走過的路', description: '成為後進信任的導師。' },
  { id: 'director', name: '桌子的另一邊', description: '在任一職涯升到最高階職位。' },
  { id: 'wanderer', name: '104 常駐分頁', description: '轉換職涯至少五次。' },
  { id: 'boundaries', name: '準時下班的傳說', description: '工作生活人格明顯偏向生活。' },
  { id: 'wealth', name: '財務自由藥師', description: '淨資產達到 1,200 萬。' },
]

export function evaluateAchievements(state: GameState): string[] {
  const netWorth = state.economy.cash + state.economy.assets - state.economy.debt
  const unlocked = new Set(state.achievements)
  if (state.licensed) unlocked.add('licensed')
  if (state.licensed && state.statsLifetime.examFailures === 0) unlocked.add('perfect_exam')
  if (state.statsLifetime.burnoutEpisodes > 0 && state.burnout < 55) unlocked.add('survivor')
  if (state.career.founder || state.flags.startup_closed) unlocked.add('founder')
  if (state.flags.second_store) unlocked.add('second_store')
  if (state.economy.homes > 0) unlocked.add('home')
  if (state.familyLife.status === 'married' && state.family >= 65) unlocked.add('family')
  if (state.flags.mentored_junior) unlocked.add('mentor')
  if (state.career.roleIndex >= 3) unlocked.add('director')
  if (state.career.changes >= 5) unlocked.add('wanderer')
  if (state.personality.worklife >= 55) unlocked.add('boundaries')
  if (netWorth >= 1200) unlocked.add('wealth')
  return [...unlocked]
}

const careerTitles: Record<string, string> = {
  hospital: '醫院地下院長', community: '社區守護神', chain: '連鎖戰神', clinic: '診間最穩的那個人',
  pharma: '藥廠策略家', cro: '試驗現場的定錨', public: '制度裡的藥師', academia: '學術巨塔',
}

export function createEnding(state: GameState): EndingResult {
  const netWorth = Math.round(state.economy.cash + state.economy.assets - state.economy.debt)
  const balance = Math.round((state.health + state.family + (100 - state.burnout)) / 3)
  const mastery = Math.max(...Object.values(state.stats))
  const score = Math.max(0, Math.round(mastery * .3 + state.reputation * .2 + balance * .3 + Math.min(100, netWorth / 12) * .2))

  if (netWorth >= 1200 && state.age < 60) return { id: 'financial-freedom', title: '財務自由藥師', subtitle: '你先退休，不是先耗盡。', summary: '你把職涯換成選擇權，終於可以只做真正想做的事。', score, badges: ['資產', '自由', '選擇'] }
  if (state.career.founder && state.economy.businesses >= 2) return { id: 'pharmacy-founder', title: '創業藥王', subtitle: '一間店，後來成了一張地圖。', summary: '你承擔過現金流、團隊與錯誤，也把自己的名字留在社區裡。', score, badges: ['創業', '管理', '在地'] }
  if (state.personality.worklife >= 55 && state.family >= 70) return { id: 'balanced-life', title: '準時下班的傳說', subtitle: '履歷不是你唯一留下的東西。', summary: '你沒有贏下每一次升遷，卻保住了健康、關係與想回去的家。', score, badges: ['生活', '家庭', '界線'] }
  if (state.statsLifetime.burnoutEpisodes >= 2) return { id: 'burnout-survivor', title: '過勞生還者', subtitle: '你曾離開自己，也一次次走回來。', summary: '崩潰沒有替你定義人生；你學會辨認極限，也學會重新開始。', score, badges: ['韌性', '轉折', '重生'] }
  const title = state.career.trackId ? careerTitles[state.career.trackId] : '走出白袍的人'
  return { id: `career-${state.career.trackId ?? 'open'}`, title, subtitle: '你把選擇累積成了自己的職涯。', summary: '沒有一條路能代表所有藥師。這條路之所以成立，是因為每一次取捨都是你的。', score, badges: ['專業', '職涯', '人生'] }
}
