import { ABILITY_KEYS, type AnnualChoice, type Career } from './types'

function hasCost(choice: AnnualChoice): boolean {
  const effects = choice.effects
  return (effects.stress ?? 0) > 0
    || (effects.health ?? 0) < 0
    || (effects.burnoutRisk ?? 0) > 0
    || (effects.money ?? 0) < 0
    || (effects.workload != null && effects.workload !== 1)
    || (effects.workLife ?? 0) < 0
    || (effects.promotionBonus ?? 0) < 0
}

export function validateCareer(career: Career): string[] {
  const errors: string[] = []
  const weightTotal = ABILITY_KEYS.reduce((sum, key) => sum + career.abilityWeights[key], 0)
  if (Math.abs(weightTotal - 1) > .0001) errors.push('abilityWeights 必須合計為 1.0')
  if (career.annualChoices.length < 6) errors.push('annualChoices 至少需要 6 個選項')
  for (const choice of career.annualChoices) if (!hasCost(choice)) errors.push(`選項 ${choice.id} 缺少成本`)
  if (!career.ladder.length || !career.ladder.at(-1)?.isCeiling) errors.push('ladder 最後一階必須標記 isCeiling')
  if (career.compensation.monthsPerYear <= 0) errors.push('monthsPerYear 必須大於 0')
  const levelNumbers = career.ladder.map((level) => level.level)
  if (new Set(levelNumbers).size !== levelNumbers.length) errors.push('ladder level 不得重複')
  return errors
}

export function assertValidCareer(career: Career): void {
  const errors = validateCareer(career)
  if (errors.length) throw new Error(`${career.id} schema invalid: ${errors.join('；')}`)
}
