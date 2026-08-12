import { grade } from '../engine/rules'

export function StatBar({ label, value, color = 'var(--mint)' }: { label: string; value: number; color?: string }) {
  return <div className="stat-row">
    <div className="stat-label"><span>{label}</span><strong>{grade(value)}</strong></div>
    <div className="meter" aria-label={`${label} ${value}`}><i style={{ width: `${value}%`, background: color }} /></div>
    <span className="stat-value">{Math.round(value)}</span>
  </div>
}
