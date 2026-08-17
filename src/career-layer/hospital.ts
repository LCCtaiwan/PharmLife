import type { Career } from './types'

export const HOSPITAL_CAREER: Career = {
  id: 'hospital',
  name: '醫院藥師',
  shortName: '醫院',
  description: '專業成長快、制度清楚，也最容易用健康交換收入與升遷。',
  abilityWeights: { KNOW: .30, DISP: .25, COMM: .15, EFF: .20, REG: .10, MGT: 0, BIZ: 0, RES: 0 },
  entry: { difficulty: 3, ageSensitivity: 1 },
  ladder: [
    { level: 1, title: '新人藥師', minYears: 2, perfRequired: 45, baseChance: .35, salaryBase: 5.2, salaryRange: [4.8, 5.6], stressDelta: 0 },
    { level: 2, title: '一般藥師', minYears: 3, perfRequired: 58, baseChance: .25, salaryBase: 5.8, salaryRange: [5.4, 6.4], stressDelta: 2 },
    { level: 3, title: '資深藥師', minYears: 4, perfRequired: 70, baseChance: .18, salaryBase: 6.5, salaryRange: [6.0, 7.2], stressDelta: 3 },
    { level: 4, title: '組長', minYears: 4, perfRequired: 82, baseChance: .12, salaryBase: 7.3, salaryRange: [6.8, 8.2], stressDelta: 8 },
    { level: 5, title: '藥劑部主管', minYears: 0, perfRequired: 100, baseChance: 0, salaryBase: 8.8, salaryRange: [8.0, 10.5], stressDelta: 10, isCeiling: true },
  ],
  signature: {
    id: 'prescription_intercepts', label: '處方疑義攔截', unit: '件', drivenBy: 'KNOW', growthPerYear: [6, 22], initialValue: 0, minValue: 0,
    thresholds: [
      { value: 50, flag: 'clinical_eye' },
      { value: 150, achievement: '攔截者' },
      { value: 300, event: 'HOSPITAL_INVITED_TALK' },
    ],
  },
  compensation: {
    monthsPerYear: 14.5,
    shiftAllowances: { day: 0, evening: .6, night: .9 },
    shiftBurnoutMultipliers: { day: 1, evening: 1.2, night: 1.45 },
    ladderAllowanceByLevel: [.15, .25, .4, .55, .7],
    dutyAllowanceByLevel: [0, 0, 0, .5, 1.5],
  },
  stressCoefficient: 1.35,
  workLifeBalance: 40,
  nightShift: true,
  annualChoices: [
    {
      id: 'clinical_project', label: '拚臨床專案', description: '主導一項臨床改善，累積專業成果與升遷籌碼。', tradeoff: '專業與績效提高，但工作量和壓力上升。',
      effects: { abilities: { KNOW: 2, RES: 1 }, stress: 8, workload: 1.25, performance: 5, promotionBonus: .06, signature: 8 },
    },
    {
      id: 'night_shift', label: '接夜班換加給', description: '把今年排班重心放在大夜，直接拉高年收入。', tradeoff: '每月多 0.9 萬，但 Burnout 負荷變為 1.45 倍。',
      effects: { abilities: { DISP: 1, EFF: 1 }, stress: 12, health: -1, burnoutRisk: 8, workload: 1.35, shift: 'night', signature: 3 },
    },
    {
      id: 'mentor', label: '帶新人', description: '花時間教學與覆核，建立團隊信任。', tradeoff: '溝通與聲望提高，但自己的工作時間被壓縮。',
      effects: { abilities: { COMM: 2, MGT: 1 }, stress: 5, workload: 1.12, reputation: 4, signature: 5 },
    },
    {
      id: 'professional_study', label: '專業進修', description: '投入課程與專科訓練，強化臨床判斷。', tradeoff: '能力提升，但支付費用並犧牲休息。',
      effects: { abilities: { KNOW: 2, REG: 1 }, stress: 5, money: -8, workload: 1.08, signature: 3 },
    },
    {
      id: 'leave_on_time', label: '準時下班', description: '守住生活界線，讓身體和注意力恢復。', tradeoff: '壓力與 Burnout 下降，但升遷加成減少。',
      effects: { stress: -12, burnoutRecovery: 12, workload: .72, workLife: 12, promotionBonus: -.08 },
    },
    {
      id: 'administration', label: '爭取行政工作', description: '接手排班、稽核和跨部門協調，往管理職靠近。', tradeoff: '管理能力與升遷籌碼提高，但壓力明顯增加。',
      effects: { abilities: { EFF: 1, MGT: 2 }, stress: 9, workload: 1.22, performance: 3, promotionBonus: .05, signature: 2 },
    },
  ],
  eventPool: 'hospital',
  exits: [
    { to: 'community', minLevel: 1, difficulty: 1, note: '社區實務相近' },
    { to: 'chain', minLevel: 1, difficulty: 1, note: '連鎖門市可直接銜接' },
    { to: 'clinic', minLevel: 1, difficulty: 1, note: '診所調劑可直接銜接' },
    { to: 'pharma', minLevel: 1, difficulty: 3, note: '臨床經驗可轉入部分職能', preferredSubTracks: ['MA', 'CRA', 'RA'] },
    { to: 'academia', minLevel: 1, difficulty: 3, note: '研究與教學能力有利' },
    { to: 'public', minLevel: 1, difficulty: 4, note: '仍需準備考試' },
    { to: 'crossfield', minLevel: 1, difficulty: 4, note: '需補足跨域能力' },
  ],
  milestones: [
    { id: 'specialist_pharmacist', name: '專科藥師訓練', minYears: 2, durationYears: 2, cost: 20, effects: { abilities: { KNOW: 4, COMM: 2 } } },
  ],
  transferPolicy: { maxEntryLevel: 3, salaryRetentionCap: 1.3 },
}
