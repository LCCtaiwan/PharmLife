import type { NPCDefinition } from '../engine/types'

export const NPCS: NPCDefinition[] = [
  { id: 'mei', name: '許美真', role: '同屆好友', archetype: '爽朗、重感情', ageOffset: 0, color: '#f2a65a' },
  { id: 'prof_chen', name: '陳教授', role: '藥理學教授', archetype: '嚴格、惜才', career: 'academia', ageOffset: 27, color: '#9c89b8' },
  { id: 'lin', name: '林怡君', role: '醫院學姊', archetype: '冷靜、護短', career: 'hospital', ageOffset: 7, color: '#5bc0be' },
  { id: 'director_wang', name: '王主任', role: '醫院主管', archetype: '要求高、看結果', career: 'hospital', ageOffset: 22, color: '#577590' },
  { id: 'hao', name: '張昱豪', role: '社區藥師', archetype: '人脈廣、敢冒險', career: 'community', ageOffset: 4, color: '#f9c74f' },
  { id: 'manager_liu', name: '劉經理', role: '連鎖區主管', archetype: '精準、業績導向', career: 'chain', ageOffset: 12, color: '#f9844a' },
  { id: 'dr_tsai', name: '蔡醫師', role: '診所醫師', archetype: '直率、重默契', career: 'clinic', ageOffset: 10, color: '#90be6d' },
  { id: 'sophia', name: '周思妤', role: 'Medical Affairs', archetype: '敏銳、國際派', career: 'pharma', ageOffset: 5, color: '#b8a1ff' },
  { id: 'alex', name: '郭柏廷', role: '臨床專案經理', archetype: '快節奏、講證據', career: 'cro', ageOffset: 8, color: '#43aa8b' },
  { id: 'section_ho', name: '何科長', role: '藥政主管', archetype: '沉著、守程序', career: 'public', ageOffset: 16, color: '#4d908e' },
  { id: 'partner', name: '江予安', role: '伴侶候選', archetype: '溫柔、有界線', ageOffset: 1, color: '#ff8fab' },
  { id: 'junior', name: '陳若晴', role: '後進藥師', archetype: '好奇、有主見', ageOffset: -9, color: '#80ed99' },
]

export const NPC_BY_ID = Object.fromEntries(NPCS.map((npc) => [npc.id, npc]))
