import type { CareerId, CareerTrack, StatKey } from '../engine/types'

const req = (primary: StatKey, values: number[]) => values.map((value, index) => ({
  [primary]: value,
  ...(index > 1 ? { management: value - 8 } : {}),
}))

const makeRoles = (titles: string[], salaries: number[], pressure: number[], primary: StatKey) => {
  const requirements = req(primary, [0, 50, 60, 70])
  return titles.map((title, index) => ({
    title,
    salary: salaries[index] ?? salaries.at(-1) ?? 70,
    pressure: pressure[index] ?? 60,
    promotionAfter: index === 0 ? 2 : 3,
    requirements: requirements[index],
  }))
}

export const CAREERS: Record<CareerId, CareerTrack> = {
  hospital: {
    id: 'hospital', name: '醫院藥事', short: '臨床與團隊', accent: '#48d6ba',
    description: '在處方、病房與跨專業團隊間累積臨床聲望。', tradeoff: '專業成長快，但輪班與責任會推高 Burnout。',
    weights: { knowledge: .35, dispensing: .25, efficiency: .2, communication: .1, regulation: .1 },
    roles: makeRoles(['醫院藥師', '資深藥師', '組長', '藥劑部主任'], [68, 82, 105, 142], [66, 72, 78, 84], 'knowledge'),
  },
  community: {
    id: 'community', name: '社區藥局', short: '病人與在地', accent: '#ffd166',
    description: '建立病人信任與在地人脈，逐步走向合夥或自營。', tradeoff: '關係與商業機會多，但收入容易受商圈影響。',
    weights: { communication: .3, dispensing: .2, business: .25, efficiency: .15, regulation: .1 },
    roles: makeRoles(['社區藥師', '責任藥師', '合夥藥師', '社區藥事顧問'], [72, 88, 118, 146], [52, 58, 66, 61], 'communication'),
  },
  chain: {
    id: 'chain', name: '連鎖藥局', short: '營運與管理', accent: '#ff9f68',
    description: '在明確 KPI 與組織升遷中建立管理能力。', tradeoff: '薪資與升遷清楚，但業績與排班壓力高。',
    weights: { business: .3, management: .25, communication: .2, efficiency: .15, regulation: .1 },
    roles: makeRoles(['門市藥師', '店長', '區主管', '總部營運主管'], [76, 96, 128, 165], [68, 76, 82, 79], 'business'),
  },
  clinic: {
    id: 'clinic', name: '診所藥事', short: '穩定與協作', accent: '#76b7f4',
    description: '在固定團隊與病人之間維持穩定節奏。', tradeoff: '工時可控，但升遷天花板與職缺較少。',
    weights: { dispensing: .3, communication: .25, efficiency: .2, knowledge: .15, regulation: .1 },
    roles: makeRoles(['診所藥師', '資深診所藥師', '多院所督導', '藥事顧問'], [66, 78, 98, 122], [45, 50, 57, 52], 'dispensing'),
  },
  pharma: {
    id: 'pharma', name: '藥廠', short: '產品與策略', accent: '#b99cff',
    description: '在醫藥學術、法規與產品策略中拓展職涯。', tradeoff: '收入上限高，但組織政治與跨區協作壓力明顯。',
    weights: { knowledge: .25, communication: .2, regulation: .2, research: .2, management: .15 },
    roles: makeRoles(['藥廠專員', '資深專員', '經理', '處長'], [86, 112, 156, 218], [58, 66, 76, 82], 'regulation'),
  },
  cro: {
    id: 'cro', name: '臨床試驗', short: '研究與專案', accent: '#64c7ff',
    description: '在試驗中心、數據與跨國專案之間推進研究。', tradeoff: '成長與流動快，但出差、時程與稽核壓力高。',
    weights: { research: .3, regulation: .25, communication: .2, efficiency: .15, management: .1 },
    roles: makeRoles(['臨床試驗助理', 'CRA', '資深 CRA', '臨床專案經理'], [82, 108, 145, 190], [64, 72, 80, 82], 'research'),
  },
  public: {
    id: 'public', name: '公職藥政', short: '制度與公共性', accent: '#75d28b',
    description: '在法規、政策與公共衛生中建立長期影響。', tradeoff: '穩定與生活較佳，但收入成長較慢且制度限制多。',
    weights: { regulation: .35, knowledge: .2, communication: .15, research: .15, management: .15 },
    roles: makeRoles(['薦任藥師', '藥政科員', '科長', '高階藥政主管'], [64, 76, 96, 126], [43, 48, 58, 64], 'regulation'),
  },
  academia: {
    id: 'academia', name: '研究學術', short: '知識與傳承', accent: '#ed8bc2',
    description: '從研究與教學累積論文、聲望與下一代人才。', tradeoff: '專業與理想回報高，但前期收入與職缺不穩定。',
    weights: { research: .4, knowledge: .3, communication: .1, regulation: .1, management: .1 },
    roles: makeRoles(['研究助理', '研究員', '副教授', '教授'], [55, 76, 108, 145], [55, 63, 72, 70], 'research'),
  },
}

export const CAREER_LIST = Object.values(CAREERS)
