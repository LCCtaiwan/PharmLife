import type { ActionDefinition } from '../engine/types'

export const ACTIONS: ActionDefinition[] = [
  { id: 'study', name: '進修', description: '把晚上留給知識與證照。', accent: 'mint', effects: { stats: { knowledge: 3, regulation: 1 }, status: { energy: -8, stress: 4 } } },
  { id: 'practice', name: '精進實務', description: '在速度與安全之間找節奏。', accent: 'blue', effects: { stats: { dispensing: 2, efficiency: 2 }, status: { energy: -7, stress: 5 } } },
  { id: 'network', name: '經營關係', description: '人脈有時會改變整條人生。', accent: 'violet', effects: { stats: { communication: 2, management: 1 }, status: { energy: -4, family: 2 }, personality: { empathy: 3 } } },
  { id: 'rest', name: '好好休息', description: '把界線重新畫回來。', accent: 'gold', effects: { status: { energy: 18, stress: -12, burnout: -8, health: 2 }, personality: { worklife: 4 } } },
  { id: 'career', name: '衝刺工作', description: '讓主管很難忽略你的成果。', accent: 'coral', careerOnly: true, effects: { stats: { efficiency: 2, management: 1 }, status: { energy: -12, stress: 10, burnout: 8, reputation: 3 }, personality: { ambition: 4, worklife: -4 } } },
  { id: 'sidejob', name: '接案兼職', description: '多一份收入，也多一份疲倦。', accent: 'slate', careerOnly: true, effects: { stats: { business: 2 }, economy: { cash: 5, annualIncome: 5 }, status: { energy: -10, stress: 7 }, personality: { risk: 2 } } },
  { id: 'research', name: '研究計畫', description: '追一個現在還沒答案的問題。', accent: 'violet', effects: { stats: { research: 3, knowledge: 1 }, status: { energy: -9, stress: 4 }, personality: { idealism: 3 } } },
  { id: 'family', name: '陪伴重要的人', description: '有些進度不會出現在履歷上。', accent: 'rose', effects: { status: { family: 8, stress: -4, energy: -2 }, personality: { empathy: 3, worklife: 4 } } },
]
